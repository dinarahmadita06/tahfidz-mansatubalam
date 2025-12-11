import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if there are any penilaian records
    const penilaianCount = await prisma.penilaian.count();
    console.log(`Total penilaian records: ${penilaianCount}`);

    // Get a sample penilaian record with related data
    const samplePenilaian = await prisma.penilaian.findFirst({
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
        hafalan: {
          select: {
            id: true,
            // Removed surah: true since surah is a string field, not a relation
            juz: true,
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true
          }
        }
      }
    });

    if (samplePenilaian) {
      console.log('Sample penilaian record:');
      console.log(JSON.stringify(samplePenilaian, null, 2));
    } else {
      console.log('No penilaian records found');
    }

    // Check hafalan records
    const hafalanCount = await prisma.hafalan.count();
    console.log(`Total hafalan records: ${hafalanCount}`);

    // Get a sample hafalan record
    const sampleHafalan = await prisma.hafalan.findFirst({
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
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
        // Removed surah: true since surah is a string field, not a relation
      }
    });

    if (sampleHafalan) {
      console.log('Sample hafalan record:');
      console.log(JSON.stringify(sampleHafalan, null, 2));
    } else {
      console.log('No hafalan records found');
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();