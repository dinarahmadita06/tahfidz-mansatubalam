import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Cari semua pendaftaran tasmi yang duplikat
    const allTasmi = await prisma.tasmi.findMany({
      orderBy: {
        createdAt: 'asc', // Urutkan dari yang paling lama
      },
    });

    console.log(`Total tasmi: ${allTasmi.length}`);

    // Kelompokkan berdasarkan siswaId, juzYangDitasmi, tanggalTasmi, jamTasmi, status
    const groups = {};
    
    allTasmi.forEach(tasmi => {
      const key = `${tasmi.siswaId}_${tasmi.juzYangDitasmi}_${tasmi.tanggalTasmi}_${tasmi.jamTasmi}_${tasmi.statusPendaftaran}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(tasmi);
    });

    // Cari grup yang punya duplikat (lebih dari 1 record)
    let totalDeleted = 0;
    const deletedIds = [];
    const keptIds = [];
    
    for (const key in groups) {
      const group = groups[key];
      
      if (group.length > 1) {
        console.log(`Ditemukan ${group.length} duplikat untuk:`);
        console.log(`- Juz: ${group[0].juzYangDitasmi}`);
        console.log(`- Tanggal: ${group[0].tanggalTasmi}`);
        console.log(`- Jam: ${group[0].jamTasmi}`);
        console.log(`- Status: ${group[0].statusPendaftaran}`);
        
        // Simpan yang pertama (paling lama), hapus sisanya
        const toDelete = group.slice(1); // Ambil semua kecuali yang pertama
        
        for (const tasmi of toDelete) {
          await prisma.tasmi.delete({
            where: { id: tasmi.id },
          });
          deletedIds.push(tasmi.id);
          totalDeleted++;
        }
        
        keptIds.push(group[0].id);
      }
    }

    return NextResponse.json({
      success: true,
      message: totalDeleted === 0 
        ? 'Tidak ada duplikat ditemukan' 
        : `Berhasil menghapus ${totalDeleted} data duplikat`,
      totalDeleted,
      deletedIds,
      keptIds,
    });

  } catch (error) {
    console.error('Error deleting duplicates:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
