export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const month = parseInt(searchParams.get('month')); // 0-11
    const year = parseInt(searchParams.get('year'));

    if (!siswaId || isNaN(month) || !year) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Auth check: ORANG_TUA can only access their children, ADMIN/GURU can access all
    if (session.user.role === 'ORANG_TUA') {
      const isLinked = await prisma.orangTuaSiswa.findFirst({
        where: {
          siswaId,
          orangTua: { userId: session.user.id }
        }
      });
      if (!isLinked) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Fetch Student Info
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: true,
        kelas: {
          include: {
            guruKelas: {
              where: { peran: 'utama', isActive: true },
              include: { guru: { include: { user: true } } }
            }
          }
        }
      }
    });

    if (!siswa) return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });

    const guruPembina = siswa.kelas?.guruKelas[0]?.guru?.user?.name || '....................';

    // Fetch Presensi Stats
    const presensiStats = await prisma.presensi.groupBy({
      by: ['status'],
      where: {
        siswaId,
        tanggal: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    });

    const counts = { HADIR: 0, IZIN: 0, SAKIT: 0, ALFA: 0 };
    presensiStats.forEach(s => { counts[s.status] = s._count.id; });

    // Fetch Penilaian
    const penilaianList = await prisma.penilaian.findMany({
      where: {
        siswaId,
        hafalan: { tanggal: { gte: startDate, lte: endDate } }
      },
      include: {
        hafalan: true,
        guru: { include: { user: true } }
      },
      orderBy: { hafalan: { tanggal: 'asc' } }
    });

    const avgScore = penilaianList.length > 0 
      ? (penilaianList.reduce((sum, p) => sum + p.nilaiAkhir, 0) / penilaianList.length).toFixed(2)
      : "0";

    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(startDate);

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header / Kop Surat
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SIMTAQ - LAPORAN HAFALAN BULANAN', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistem Informasi Tahfidz Al-Qur\'an', pageWidth / 2, 26, { align: 'center' });
    doc.line(20, 30, pageWidth - 20, 30);

    // Identity
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('IDENTITAS SISWA', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nama Siswa    : ${siswa.user.name}`, 20, 48);
    doc.text(`NIS / NISN      : ${siswa.nis || '-'} / ${siswa.nisn || '-'}`, 20, 54);
    doc.text(`Kelas               : ${siswa.kelas?.nama || '-'}`, 20, 60);
    doc.text(`Guru Pembina : ${guruPembina}`, 20, 66);

    doc.setFont('helvetica', 'bold');
    doc.text('PERIODE LAPORAN', pageWidth - 80, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bulan   : ${monthName}`, pageWidth - 80, 48);
    doc.text(`Tahun   : ${year}`, pageWidth - 80, 54);

    // Ringkasan Section
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN PERKEMBANGAN', 20, 80);
    
    // Grid-like summary for stats
    doc.autoTable({
      startY: 85,
      margin: { left: 20, right: 20 },
      head: [['Hadir', 'Izin', 'Sakit', 'Alfa', 'Rata-rata Nilai']],
      body: [[counts.HADIR, counts.IZIN, counts.SAKIT, counts.ALFA, avgScore]],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], halign: 'center' },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } }
    });

    // Detailed Table
    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL PENILAIAN HAFALAN', 20, doc.lastAutoTable.finalY + 15);

    const tableBody = penilaianList.map(p => [
      new Date(p.hafalan.tanggal).toLocaleDateString('id-ID'),
      `${p.hafalan.surah}\nAyat ${p.hafalan.ayatMulai}-${p.hafalan.ayatSelesai}`,
      p.tajwid,
      p.kelancaran,
      p.makhraj,
      p.adab,
      p.nilaiAkhir,
      p.nilaiAkhir >= 75 ? 'Lulus' : 'Tidak Lulus',
      p.catatan || '-'
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      margin: { left: 20, right: 20 },
      head: [['Tanggal', 'Surah/Ayat', 'Tjw', 'Kln', 'Mkh', 'Impl', 'Avg', 'Status', 'Catatan']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        1: { cellWidth: 35 },
        8: { cellWidth: 40 }
      }
    });

    // Signature
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFont('helvetica', 'normal');
    doc.text('Mengetahui,', pageWidth - 70, finalY);
    doc.text('Guru Pembina Tahfidz', pageWidth - 70, finalY + 6);
    doc.text(`( ${guruPembina} )`, pageWidth - 70, finalY + 30);

    // Footer
    doc.setFontSize(8);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 20, doc.internal.pageSize.height - 10);

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Laporan_${monthName}_${year}_${siswa.user.name.replace(/\s+/g, '_')}.pdf"`
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
