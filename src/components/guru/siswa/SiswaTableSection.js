import React from 'react';
import { prisma } from '@/lib/prisma';

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
      kelasId: true,
      user: {
        select: {
          name: true,
        }
      },
      kelas: {
        select: {
          nama: true,
        }
      }
    },
    orderBy: { user: { name: 'asc' } },
    take: 100 // Limit for performance
  });

  console.timeEnd(`SiswaTable-${userId}`);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-emerald-100/30">
      <div className="p-6 border-b border-emerald-100/30">
        <h2 className="text-xl font-bold text-emerald-900">Daftar Siswa (Kelas Aktif)</h2>
        <p className="text-sm text-slate-600 mt-1">
          Menampilkan {siswaList.length} siswa
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">No</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Nama Siswa</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NISN</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NIS</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Kelas</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100/50">
            {siswaList.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  Tidak ada siswa yang ditemukan
                </td>
              </tr>
            ) : (
              siswaList.map((siswa, index) => (
                <tr key={siswa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-gray-600 text-sm">{index + 1}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">{siswa.user?.name || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{siswa.nisn || '-'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{siswa.nis || '-'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{siswa.kelas?.nama || '-'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      siswa.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {siswa.status === 'approved' ? 'Aktif' : 'Menunggu'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
