import React from 'react';
import { prisma } from '@/lib/prisma';
import SiswaTableClient from './SiswaTableClient';

export async function SiswaTableSection({ userId, searchTerm = '', selectedKelas = '' }) {
  console.time(`SiswaTable-${userId}`);

  // Build where clause
  const whereClause = {
    kelas: { 
      guruKelas: { 
        some: { 
          guru: { userId: userId },
          isActive: true 
        } 
      } 
    }
  };

  if (selectedKelas) {
    whereClause.kelasId = selectedKelas;
  }

  if (searchTerm) {
    whereClause.OR = [
      { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { nis: { contains: searchTerm } },
      { nisn: { contains: searchTerm } }
    ];
  }

  const siswaList = await prisma.siswa.findMany({
    where: whereClause,
    select: {
      id: true,
      nis: true,
      nisn: true,
      status: true,
      rejectionReason: true,
      kelasId: true,
      alamat: true,
      tanggalLahir: true,
      jenisKelamin: true,
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      kelas: {
        select: {
          id: true,
          nama: true,
        }
      },
      orangTuaSiswa: {
        select: {
          hubungan: true,
          orangTua: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          }
        }
      }
    },
    orderBy: { user: { name: 'asc' } },
    take: 100 // Limit for performance
  });

  console.timeEnd(`SiswaTable-${userId}`);

  return <SiswaTableClient siswaList={siswaList} />;
}
