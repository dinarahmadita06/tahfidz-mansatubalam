export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get Fatimah data
    const siswa = await prisma.siswa.findFirst({
      where: {
        user: {
          email: 'fatimah.hakim@siswa.tahfidz.sch.id'
        }
      },
      include: {
        user: true,
        kelas: {
          include: {
            guruKelas: {
              where: { isActive: true },
              include: {
                guru: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa Fatimah tidak ditemukan' }, { status: 404 });
    }

    const guruPengampu = siswa.kelas?.guruKelas[0]?.guru;

    if (!guruPengampu) {
      return NextResponse.json({ error: 'Guru pengampu tidak ditemukan' }, { status: 404 });
    }

    // Delete existing hafalan
    await prisma.hafalan.deleteMany({
      where: { siswaId: siswa.id }
    });

    // Delete existing tasmi
    await prisma.tasmi.deleteMany({
      where: { siswaId: siswa.id }
    });

    // Add hafalan dummy
    const dummyHafalan = [
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 1,
        surah: 'Al-Baqarah',
        ayatMulai: 1,
        ayatSelesai: 141,
        keterangan: 'Hafalan Juz 1',
        tanggal: new Date('2024-01-15')
      },
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 29,
        surah: 'Al-Mulk',
        ayatMulai: 1,
        ayatSelesai: 30,
        keterangan: 'Hafalan Juz 29',
        tanggal: new Date('2024-02-10')
      },
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 30,
        surah: 'An-Naba',
        ayatMulai: 1,
        ayatSelesai: 40,
        keterangan: 'Hafalan Juz 30',
        tanggal: new Date('2024-03-01')
      }
    ];

    for (const hafalan of dummyHafalan) {
      await prisma.hafalan.create({ data: hafalan });
    }

    // Add tasmi dummy
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    const tasmiData = {
      siswaId: siswa.id,
      jumlahHafalan: 3,
      juzYangDitasmi: 'Juz 1, Juz 29, Juz 30',
      jamTasmi: '08:00',
      tanggalTasmi: tomorrow,
      guruPengampuId: guruPengampu.id,
      catatan: 'Siap untuk ujian Tasmi\'',
      statusPendaftaran: 'MENUNGGU',
    };

    const newTasmi = await prisma.tasmi.create({
      data: tasmiData,
      include: {
        siswa: {
          include: {
            user: true,
            kelas: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Data dummy berhasil ditambahkan!',
      data: {
        siswa: siswa.user.name,
        kelas: siswa.kelas?.nama,
        guru: guruPengampu.user.name,
        hafalan: `${dummyHafalan.length} records`,
        tasmi: {
          id: newTasmi.id,
          juz: newTasmi.juzYangDitasmi,
          status: newTasmi.statusPendaftaran,
          tanggal: newTasmi.tanggalTasmi
        }
      },
      instructions: {
        guru: {
          email: 'ahmad.fauzi@tahfidz.sch.id',
          password: 'password123',
          action: 'Login, buka menu Tasmi, lihat pendaftaran Fatimah'
        },
        siswa: {
          email: 'fatimah.hakim@siswa.tahfidz.sch.id',
          password: 'password123',
          action: 'Login, buka menu Tasmi, lihat history'
        }
      }
    });

  } catch (error) {
    console.error('Error seeding:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
