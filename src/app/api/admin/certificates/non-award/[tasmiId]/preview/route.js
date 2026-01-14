export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tasmiId } = params;

    const tasmi = await prisma.tasmi.findUnique({
      where: { id: tasmiId },
      include: {
        siswa: {
          select: {
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        guruPenguji: {
          include: { user: { select: { name: true } } },
        },
        certificate: true,
      },
    });

    if (!tasmi) {
      return NextResponse.json({ message: 'Data Tasmi tidak ditemukan' }, { status: 404 });
    }

    // Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRomanItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Landscape A4 (842 x 595 points)
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // Draw Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0.4, 0.2),
      borderWidth: 2,
    });
    
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0, 0.5, 0.3),
      borderWidth: 1,
    });

    // Content
    let yPos = height - 100;

    // Header
    const title = 'SERTIFIKAT TASMI\'';
    const titleWidth = helveticaBoldFont.widthOfTextAtSize(title, 40);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: yPos,
      size: 40,
      font: helveticaBoldFont,
      color: rgb(0, 0.4, 0.2),
    });
    yPos -= 50;

    const subTitle = 'Diberikan kepada:';
    const subTitleWidth = helveticaFont.widthOfTextAtSize(subTitle, 16);
    page.drawText(subTitle, {
      x: (width - subTitleWidth) / 2,
      y: yPos,
      size: 16,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 50;

    // Student Name
    const name = tasmi.siswa.user.name.toUpperCase();
    const nameWidth = helveticaBoldFont.widthOfTextAtSize(name, 32);
    page.drawText(name, {
      x: (width - nameWidth) / 2,
      y: yPos,
      size: 32,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    // Line under name
    page.drawLine({
      start: { x: (width - nameWidth) / 2 - 20, y: yPos },
      end: { x: (width + nameWidth) / 2 + 20, y: yPos },
      thickness: 1.5,
      color: rgb(0, 0.4, 0.2),
    });
    yPos -= 40;

    // Details
    const details = `Atas keberhasilannya menuntaskan ujian Tasmi' Al-Qur'an`;
    const detailsWidth = helveticaFont.widthOfTextAtSize(details, 18);
    page.drawText(details, {
      x: (width - detailsWidth) / 2,
      y: yPos,
      size: 18,
      font: helveticaFont,
    });
    yPos -= 30;

    const juzInfo = `JUZ ${tasmi.juzYangDitasmi}`;
    const juzWidth = helveticaBoldFont.widthOfTextAtSize(juzInfo, 24);
    page.drawText(juzInfo, {
      x: (width - juzWidth) / 2,
      y: yPos,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0.4, 0.2),
    });
    yPos -= 40;

    // Scores table-like info
    const scoreText = `Nilai Akhir: ${tasmi.nilaiAkhir || '-'} (${tasmi.predikat || '-'})`;
    const scoreWidth = helveticaFont.widthOfTextAtSize(scoreText, 16);
    page.drawText(scoreText, {
      x: (width - scoreWidth) / 2,
      y: yPos,
      size: 16,
      font: helveticaFont,
    });
    yPos -= 80;

    // Signatures Area
    const sigY = yPos;
    
    // Left: Guru Penguji
    const leftX = 150;
    const pengujiLabel = 'Guru Penguji,';
    page.drawText(pengujiLabel, { x: leftX, y: sigY, size: 12, font: helveticaFont });
    const pengujiName = tasmi.guruPenguji?.user?.name || '____________________';
    page.drawText(pengujiName, { x: leftX, y: sigY - 60, size: 12, font: helveticaBoldFont });
    
    // Right: Date & Certificate Number
    const rightX = width - 300;
    const dateStr = tasmi.tanggalUjian ? new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
    page.drawText(`Bandar Lampung, ${dateStr}`, { x: rightX, y: sigY, size: 12, font: helveticaFont });
    page.drawText(`NISN: ${tasmi.siswa?.nisn || '-'}`, { x: rightX, y: sigY - 15, size: 10, font: helveticaFont });
    page.drawText(`No. Sertifikat: ${tasmi.certificate?.certificateNumber || 'DRAFT'}`, { x: rightX, y: sigY - 30, size: 10, font: timesRomanItalicFont });

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="Sertifikat_${tasmi.siswa.user.name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PREVIEW PDF ERROR:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
