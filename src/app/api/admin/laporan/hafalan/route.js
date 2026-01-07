import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const siswaId = searchParams.get('siswaId');
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');

    if (!kelasId || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }

    // Get kelas info with teacher
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        guruTahfidz: {
          select: {
            name: true,
            jabatan: true,
            ttdUrl: true,
            signatureUrl: true
          }
        }
      }
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    // Get current admin info
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        jabatan: true,
        ttdUrl: true,
        signatureUrl: true
      }
    });

    // Merge teacher signature info
    let teacherUser = kelas.guruTahfidz;
    
    // Fallback: search in GuruKelas if guruTahfidz is not set (legacy data)
    if (!teacherUser) {
      const guruUtama = await prisma.guruKelas.findFirst({
        where: { kelasId, peran: 'utama', isActive: true },
        include: { 
          guru: { 
            include: { 
              user: {
                select: {
                  name: true,
                  jabatan: true,
                  ttdUrl: true,
                  signatureUrl: true
                }
              } 
            } 
          } 
        }
      });
      if (guruUtama) {
        teacherUser = guruUtama.guru.user;
      }
    }

    const teacher = {
      nama: teacherUser?.name || 'Belum Ditentukan',
      jabatan: teacherUser?.jabatan || 'Guru Tahfidz',
      ttdUrl: teacherUser?.ttdUrl || teacherUser?.signatureUrl || null
    };

    const admin = {
      nama: adminUser?.name || session.user.name,
      jabatan: adminUser?.jabatan || 'Koordinator Tahfidz',
      ttdUrl: adminUser?.ttdUrl || adminUser?.signatureUrl || null
    };

    const whereClause = {
      siswa: {
        kelasId: kelasId
      },
      tanggal: {
        gte: new Date(tanggalMulai),
        lte: new Date(tanggalSelesai)
      }
    };

    if (siswaId) {
      whereClause.siswaId = siswaId;
    }

    // Fetch hafalan data
    const hafalan = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        surah: {
          select: {
            namaLatin: true,
            nomor: true
          }
        },
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    // Period text
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);
    const periodeText = `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;

    if (siswaId) {
      // Report per siswa
      const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      if (!siswa) {
        return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
      }

      // Calculate totals
      const totalJuz = hafalan.reduce((sum, h) => {
        const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
        const juzFraction = ayatCount / 200; // Approximate
        return sum + juzFraction;
      }, 0);

      // Filter hafalan yang punya nilai valid (0-100)
      const hafalanWithNilai = hafalan.filter(h => h.nilaiAkhir && h.nilaiAkhir >= 0 && h.nilaiAkhir <= 100);
      const nilaiSum = hafalanWithNilai.reduce((sum, h) => sum + h.nilaiAkhir, 0);
      const nilaiRata = hafalanWithNilai.length > 0 ? Math.round(nilaiSum / hafalanWithNilai.length) : 0;

      return NextResponse.json({
        type: 'siswa',
        kelasNama: kelas.nama,
        periodeText,
        siswa: {
          nama: siswa.user.name,
          nisn: siswa.nisn,
          totalJuz: totalJuz.toFixed(1),
          jumlahSetoran: hafalan.length,
          nilaiRata
        },
        teacher,
        admin,
        hafalan
      });
    } else {
      // Report per kelas
      const siswaList = await prisma.siswa.findMany({
        where: { kelasId },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      // Group hafalan by siswa
      const siswaData = siswaList.map(siswa => {
        const siswaHafalan = hafalan.filter(h => h.siswaId === siswa.id);

        const totalJuz = siswaHafalan.reduce((sum, h) => {
          const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
          const juzFraction = ayatCount / 200;
          return sum + juzFraction;
        }, 0);

        // Filter hafalan yang punya nilai valid (0-100)
        const hafalanWithNilai = siswaHafalan.filter(h => h.nilaiAkhir && h.nilaiAkhir >= 0 && h.nilaiAkhir <= 100);
        const nilaiSum = hafalanWithNilai.reduce((sum, h) => sum + h.nilaiAkhir, 0);
        const nilaiRata = hafalanWithNilai.length > 0 ? Math.round(nilaiSum / hafalanWithNilai.length) : 0;

        // Check target (assume 1 juz per semester)
        const targetJuz = 1;
        const statusTarget = totalJuz >= targetJuz ? 'Tercapai' : 'Belum Tercapai';

        return {
          nama: siswa.user.name,
          nisn: siswa.nisn,
          totalJuz: totalJuz.toFixed(1),
          jumlahSetoran: siswaHafalan.length,
          nilaiRata,
          statusTarget
        };
      });

      // Calculate summary
      const totalJuzAll = siswaData.reduce((sum, s) => sum + parseFloat(s.totalJuz), 0);
      const rataHafalan = siswaList.length > 0 ? (totalJuzAll / siswaList.length).toFixed(1) : 0;

      const totalNilai = siswaData.reduce((sum, s) => sum + s.nilaiRata, 0);
      const rataNilai = siswaList.length > 0 ? Math.round(totalNilai / siswaList.length) : 0;

      const totalSetoran = hafalan.length;
      const siswaTercapai = siswaData.filter(s => s.statusTarget === 'Tercapai').length;

      return NextResponse.json({
        type: 'kelas',
        kelasNama: kelas.nama,
        periodeText,
        summary: {
          jumlahSiswa: siswaList.length,
          rataHafalan,
          rataNilai,
          totalSetoran,
          siswaTercapai,
          persenTercapai: siswaList.length > 0 ? Math.round((siswaTercapai / siswaList.length) * 100) : 0
        },
        teacher,
        admin,
        siswaData,
        hafalan
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Gagal generate laporan' },
      { status: 500 }
    );
  }
}
