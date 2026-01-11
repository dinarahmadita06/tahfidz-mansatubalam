export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateLaporanPDF } from '@/lib/pdf-generator';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const periode = searchParams.get('periode');
    
    // Validasi parameter
    if (!siswaId) {
      return NextResponse.json(
        { error: 'siswaId parameter is required' },
        { status: 400 }
      );
    }
    
    if (!periode) {
      return NextResponse.json(
        { error: 'periode parameter is required' },
        { status: 400 }
      );
    }
    
    // Validasi format periode (expected: YYYY-MM atau YYYY)
    const periodeRegex = /^\d{4}(-\d{2})?$/;
    if (!periodeRegex.test(periode)) {
      return NextResponse.json(
        { error: 'periode must be in format YYYY-MM or YYYY' },
        { status: 400 }
      );
    }
    
    // Parse periode untuk range tanggal
    let startDate, endDate;
    if (periode.includes('-')) {
      // Format YYYY-MM
      const [year, month] = periode.split('-');
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
    } else {
      // Format YYYY (whole year)
      startDate = new Date(parseInt(periode), 0, 1);
      endDate = new Date(parseInt(periode), 11, 31);
    }
    
    console.log(`Fetching data for siswaId: ${siswaId}, periode: ${periode}`);
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    try {
      // Ambil data siswa
      const siswa = await prisma.siswa.findUnique({
        where: {
          id: parseInt(siswaId)
        }
      });
      
      if (!siswa) {
        return NextResponse.json(
          { error: 'Siswa not found' },
          { status: 404 }
        );
      }
      
      // Ambil data setoran hafalan dalam periode
      const setoranData = await prisma.setoran.findMany({
        where: {
          siswaId: parseInt(siswaId),
          tanggal: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          tanggal: 'asc'
        }
      });
      
      console.log(`Found ${setoranData.length} setoran records`);
      
      // Generate PDF
      const pdfBytes = await generateLaporanPDF(siswa, setoranData, periode);
      
      // Set response headers untuk file PDF
      const response = new Response(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="laporan-hafalan-${siswa.nama.replace(/\s+/g, '-')}-${periode}.pdf"`,
          'Content-Length': pdfBytes.length.toString(),
        },
      });
      
      return response;
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// Handle POST request untuk testing atau batch operations
export async function POST(request) {
  try {
    const body = await request.json();
    const { siswaId, periode, setoranData: mockSetoranData } = body;
    
    if (!siswaId || !periode) {
      return NextResponse.json(
        { error: 'siswaId and periode are required' },
        { status: 400 }
      );
    }
    
    // Untuk testing, bisa menggunakan mock data
    const mockSiswa = {
      id: parseInt(siswaId),
      nama: 'Ahmad Rizki Pratama',
      kelas: 'XI IPA 1',
      nis: '20210001'
    };
    
    const mockSetoranDefault = [
      {
        id: 1,
        siswaId: parseInt(siswaId),
        tanggal: new Date('2025-09-22'),
        surah: 'Al-Baqarah',
        rentangAyat: '1-15',
        statusHafalan: 'hafal',
        nilaiKelancaran: 95,
        nilaiTajwid: 90,
        nilaiAkhir: 'A',
        catatan: 'Sangat baik, intonasi dan tajwid sudah tepat'
      },
      {
        id: 2,
        siswaId: parseInt(siswaId),
        tanggal: new Date('2025-09-24'),
        surah: 'Al-Baqarah',
        rentangAyat: '16-30',
        statusHafalan: 'hafal',
        nilaiKelancaran: 85,
        nilaiTajwid: 90,
        nilaiAkhir: 'A-',
        catatan: 'Baik, perlu sedikit perbaikan di kelancaran'
      },
      {
        id: 3,
        siswaId: parseInt(siswaId),
        tanggal: new Date('2025-09-26'),
        surah: 'Al-Baqarah',
        rentangAyat: '31-45',
        statusHafalan: 'kurang_hafal',
        nilaiKelancaran: 75,
        nilaiTajwid: 80,
        nilaiAkhir: 'B+',
        catatan: 'Perlu lebih banyak latihan, masih ada beberapa kesalahan'
      }
    ];
    
    const setoranToUse = mockSetoranData || mockSetoranDefault;
    const pdfBytes = await generateLaporanPDF(mockSiswa, setoranToUse, periode);
    
    const response = new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-hafalan-${mockSiswa.nama.replace(/\s+/g, '-')}-${periode}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });
    
    return response;
    
  } catch (error) {
    console.error('POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}