import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const status = searchParams.get('status'); // pending, active, rejected

    let whereClause = {};

    // Filter by status
    if (status) {
      whereClause.status = status;
    } else if (session.user.role === 'GURU') {
      // Guru bisa melihat siswa approved dan pending (yang mereka buat atau dari kelas mereka)
      whereClause.status = {
        in: ['approved', 'pending']
      };
    } else if (session.user.role === 'SISWA' || session.user.role === 'ORANG_TUA') {
      // Siswa dan orang tua hanya lihat yang approved
      whereClause.status = 'approved';
    }
    // Admin bisa lihat semua status

    // Filter by guru's kelas if guru
    if (session.user.role === 'GURU' && session.user.guruId) {
      const guruKelas = await prisma.guruKelas.findMany({
        where: {
          guruId: session.user.guruId,
          isActive: true
        },
        select: { kelasId: true },
      });

      // Jika ada filter kelasId dari query parameter
      if (kelasId) {
        whereClause.kelasId = kelasId;
        // Note: We removed the createdBy filter since it doesn't exist in the schema
      } else {
        // Tidak ada filter kelas spesifik, tampilkan semua siswa yang bisa diakses guru
        // Guru bisa melihat siswa dari kelas mereka
        if (guruKelas.length > 0) {
          whereClause.kelasId = {
            in: guruKelas.map(gk => gk.kelasId),
          };
        }
      }
    } else if (kelasId && session.user.role !== 'GURU') {
      // Untuk role lain (admin, dll), filter by kelas jika disediakan
      whereClause.kelasId = kelasId;
    }

    const siswa = await prisma.siswa.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        kelas: {
          select: {
            nama: true,
          },
        },
        hafalan: {
          select: {
            id: true,
            juz: true,
            surah: true,
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true,
          },
        },
        penilaian: {
          select: {
            nilaiAkhir: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to include calculated totals
    const transformedSiswa = siswa.map(s => {
      // Calculate Total Juz (count of distinct juz values)
      const uniqueJuz = [...new Set(s.hafalan.map(h => h.juz))];
      const totalJuz = uniqueJuz.length;

      // Calculate Total Setoran (count of hafalan records)
      const totalSetoran = s.hafalan.length;

      // Calculate average nilai
      const averageNilai = s.penilaian.length > 0
        ? s.penilaian.reduce((sum, p) => sum + p.nilaiAkhir, 0) / s.penilaian.length
        : 0;

      return {
        ...s,
        totalJuz,
        totalSetoran,
        averageNilai: parseFloat(averageNilai.toFixed(1)),
      };
    });

    return NextResponse.json(transformedSiswa);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json(
      { error: 'Failed to fetch siswa' },
      { status: 500 }
    );
  }
}

// POST - Create new siswa (Guru)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, nisn, nis, kelasId, jenisKelamin, tempatLahir, tanggalLahir, alamat, noTelepon } = body;

    // Validate required fields
    if (!name || !email || !password || !nisn || !nis || !kelasId || !jenisKelamin || !tempatLahir || !tanggalLahir) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email, nisn, or nis already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const existingNisn = await prisma.siswa.findUnique({ where: { nisn } });
    if (existingNisn) {
      return NextResponse.json({ error: 'NISN already exists' }, { status: 400 });
    }

    const existingNis = await prisma.siswa.findUnique({ where: { nis } });
    if (existingNis) {
      return NextResponse.json({ error: 'NIS already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and siswa with pending status
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'SISWA',
          isActive: false, // Not active until approved
        },
      });

      const siswa = await tx.siswa.create({
        data: {
          userId: user.id,
          nisn,
          nis,
          kelasId,
          jenisKelamin,
          tempatLahir,
          tanggalLahir: new Date(tanggalLahir),
          alamat,
          noTelepon,
          status: 'pending',
          // Removed createdBy field since it doesn't exist in the schema
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          kelas: {
            select: {
              nama: true,
            },
          },
        },
      });

      // Create notification for all admins
      const admins = await tx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      if (admins.length > 0) {
        await Promise.all(
          admins.map((admin) =>
            tx.notification.create({
              data: {
                userId: admin.id,
                title: 'Siswa Baru Menunggu Validasi',
                message: `Guru ${session.user.name} menambahkan siswa ${name} - menunggu validasi.`,
                type: 'student_pending',
                link: '/admin/validasi-siswa',
              },
            })
          )
        );
      }

      return siswa;
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'SISWA',
      description: `Guru menambahkan siswa baru ${result.user.name} (NISN: ${result.nisn}) - Status: Menunggu validasi`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId: result.id,
        kelasId: result.kelasId,
        status: 'pending'
      }
    });

    return NextResponse.json({
      message: 'Siswa berhasil ditambahkan. Menunggu validasi dari admin.',
      siswa: result,
    });
  } catch (error) {
    console.error('Error creating siswa:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      error: 'Failed to create siswa',
      details: error.message
    }, { status: 500 });
  }
}