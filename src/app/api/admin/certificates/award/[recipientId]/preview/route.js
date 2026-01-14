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

    const { recipientId } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';
    const customDate = searchParams.get('date');

    const recipient = await prisma.awardRecipient.findUnique({
      where: { id: recipientId },
      include: {
        student: {
          select: {
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        category: true,
        event: true,
        certificate: true,
      },
    });

    if (!recipient) {
      return NextResponse.json({ message: 'Data Award tidak ditemukan' }, { status: 404 });
    }

    // Fetch Signers
    const signers = await prisma.adminSignature.findMany({
      where: { type: { in: ['SIGNER_1', 'SIGNER_2'] } }
    });
    const s1 = signers.find(s => s.type === 'SIGNER_1');
    const s2 = signers.find(s => s.type === 'SIGNER_2');

    // Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // A4 Landscape: 842 x 595 points (297mm x 210mm)
    const width = 842;
    const height = 595;
    const page = pdfDoc.addPage([width, height]);

    // Border (Gold Theme)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.8, 0.6, 0.1),
      borderWidth: 3,
    });

    page.drawRectangle({
      x: 25,
      y: 25,
      width: width - 50,
      height: height - 50,
      borderColor: rgb(0.8, 0.6, 0.1),
      borderWidth: 1,
    });

    let yPos = height - 60;

    // Header - Kementerian Agama
    const headerLine1 = 'KEMENTERIAN AGAMA';
    const headerLine1Width = helveticaBoldFont.widthOfTextAtSize(headerLine1, 12);
    page.drawText(headerLine1, {
      x: (width - headerLine1Width) / 2,
      y: yPos,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 16;

    const headerLine2 = 'KANTOR KEMENTERIAN AGAMA KOTA BANDAR LAMPUNG';
    const headerLine2Width = helveticaFont.widthOfTextAtSize(headerLine2, 10);
    page.drawText(headerLine2, {
      x: (width - headerLine2Width) / 2,
      y: yPos,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 16;

    const headerLine3 = 'MADRASAH ALIYAH NEGERI MAN 1 BANDAR LAMPUNG';
    const headerLine3Width = helveticaBoldFont.widthOfTextAtSize(headerLine3, 11);
    page.drawText(headerLine3, {
      x: (width - headerLine3Width) / 2,
      y: yPos,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 35;

    // Title - SERTIFIKAT
    const title = 'SERTIFIKAT';
    const titleWidth = helveticaBoldFont.widthOfTextAtSize(title, 28);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: yPos,
      size: 28,
      font: helveticaBoldFont,
      color: rgb(0.7, 0.5, 0.1),
    });
    yPos -= 24;

    const subtitle = 'Wisuda Tahfidzul Qur\'an';
    const subtitleWidth = timesRomanItalicFont.widthOfTextAtSize(subtitle, 18);
    page.drawText(subtitle, {
      x: (width - subtitleWidth) / 2,
      y: yPos,
      size: 18,
      font: timesRomanItalicFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 35;

    // Diberikan Kepada
    const givenTo = 'Diberikan Kepada';
    const givenToWidth = helveticaFont.widthOfTextAtSize(givenTo, 14);
    page.drawText(givenTo, {
      x: (width - givenToWidth) / 2,
      y: yPos,
      size: 14,
      font: helveticaFont,
    });
    yPos -= 28;

    // Student Name
    const studentName = recipient.student?.user?.name || 'N/A';
    const studentNameWidth = helveticaBoldFont.widthOfTextAtSize(studentName, 20);
    page.drawText(studentName, {
      x: (width - studentNameWidth) / 2,
      y: yPos,
      size: 20,
      font: helveticaBoldFont,
      color: rgb(0.7, 0.5, 0.1),
    });
    yPos -= 32;

    // Get JUZ from tasmi data
    const tasmiData = await prisma.tasmi.findFirst({
      where: { siswaId: recipient.studentId, isPassed: true },
      orderBy: { tanggalUjian: 'desc' }
    });
    const juzNumber = tasmiData?.juzYangDitasmi || '-';

    // Telah Menyelesaikan
    const completionText = `Telah Menyelesaikan Tahfidzul Qur\'an JUZ ${juzNumber}`;
    const completionTextWidth = helveticaBoldFont.widthOfTextAtSize(completionText, 14);
    page.drawText(completionText, {
      x: (width - completionTextWidth) / 2,
      y: yPos,
      size: 14,
      font: helveticaBoldFont,
    });
    yPos -= 26;

    // Sebagai (Award Category)
    const categoryLabel = 'Sebagai:';
    const categoryLabelWidth = helveticaFont.widthOfTextAtSize(categoryLabel, 13);
    page.drawText(categoryLabel, {
      x: (width - categoryLabelWidth) / 2,
      y: yPos,
      size: 13,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 24;

    const categoryName = recipient.category?.categoryName || 'Peserta Terbaik';
    const categoryWidth = helveticaBoldFont.widthOfTextAtSize(categoryName, 18);
    page.drawText(categoryName, {
      x: (width - categoryWidth) / 2,
      y: yPos,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0.1, 0.5, 0.3),
    });
    yPos -= 28;

    // Appreciation text (multi-line)
    const appreciationLine1 = 'Kepadanya kami berikan penghargaan setinggi-tingginya';
    const appreciationLine1Width = helveticaFont.widthOfTextAtSize(appreciationLine1, 11);
    page.drawText(appreciationLine1, {
      x: (width - appreciationLine1Width) / 2,
      y: yPos,
      size: 11,
      font: helveticaFont,
    });
    yPos -= 16;

    const appreciationLine2 = 'Semoga tanda penghargaan ini menjadi motivasi untuk senantiasa';
    const appreciationLine2Width = helveticaFont.widthOfTextAtSize(appreciationLine2, 11);
    page.drawText(appreciationLine2, {
      x: (width - appreciationLine2Width) / 2,
      y: yPos,
      size: 11,
      font: helveticaFont,
    });
    yPos -= 16;

    const appreciationLine3 = 'meningkatkan amal ibadahnya sesuai ketentuan Allah SWT dan Rosul-Nya';
    const appreciationLine3Width = helveticaFont.widthOfTextAtSize(appreciationLine3, 11);
    page.drawText(appreciationLine3, {
      x: (width - appreciationLine3Width) / 2,
      y: yPos,
      size: 11,
      font: helveticaFont,
    });
    yPos -= 35;

    // Signatures Area
    const sigY = yPos;
    const leftX = 80;
    const rightX = width - 280;

    // TTD 1 (Left)
    if (s1) {
      page.drawText(s1.jabatan || '', { x: leftX, y: sigY, size: 11, font: helveticaFont });
      
      // Draw TTD
      if (s1.signatureData) {
        try {
          const imgBase64 = s1.signatureData.split(',')[1] || s1.signatureData;
          const imgBytes = Buffer.from(imgBase64, 'base64');
          const ttdImg = await pdfDoc.embedPng(imgBytes).catch(() => pdfDoc.embedJpg(imgBytes));
          const ttdWidth = 100;
          const ttdHeight = 50;
          page.drawImage(ttdImg, { x: leftX, y: sigY - 65, width: ttdWidth, height: ttdHeight });
          
          // Draw Cap overlay
          if (s1.capData) {
            const capBase64 = s1.capData.split(',')[1] || s1.capData;
            const capBytes = Buffer.from(capBase64, 'base64');
            const capImg = await pdfDoc.embedPng(capBytes).catch(() => pdfDoc.embedJpg(capBytes));
            const capScale = s1.capScale || 1.0;
            const capWidth = 80 * capScale;
            const capHeight = 80 * capScale;
            const capX = leftX + (ttdWidth - capWidth) / 2 + (s1.capOffsetX || 0);
            const capY = sigY - 65 + (ttdHeight - capHeight) / 2 + (s1.capOffsetY || 0);
            page.drawImage(capImg, { x: capX, y: capY, width: capWidth, height: capHeight, opacity: s1.capOpacity || 0.4 });
          }
        } catch (e) { console.error('TTD1 Embed Error', e); }
      }
      page.drawText(s1.nama || '', { x: leftX, y: sigY - 80, size: 11, font: helveticaBoldFont });
    }

    // TTD 2 (Right)
    const certDate = customDate ? new Date(customDate) : (recipient.event?.date ? new Date(recipient.event.date) : new Date());
    const dateStr = certDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    page.drawText(`Bandar Lampung, ${dateStr}`, { x: rightX, y: sigY + 20, size: 10, font: helveticaFont });
    
    if (s2) {
      page.drawText(s2.jabatan || '', { x: rightX, y: sigY, size: 11, font: helveticaFont });
      
      // Draw TTD
      if (s2.signatureData) {
        try {
          const imgBase64 = s2.signatureData.split(',')[1] || s2.signatureData;
          const imgBytes = Buffer.from(imgBase64, 'base64');
          const ttdImg = await pdfDoc.embedPng(imgBytes).catch(() => pdfDoc.embedJpg(imgBytes));
          const ttdWidth = 100;
          const ttdHeight = 50;
          page.drawImage(ttdImg, { x: rightX, y: sigY - 65, width: ttdWidth, height: ttdHeight });
          
          // Draw Cap overlay
          if (s2.capData) {
            const capBase64 = s2.capData.split(',')[1] || s2.capData;
            const capBytes = Buffer.from(capBase64, 'base64');
            const capImg = await pdfDoc.embedPng(capBytes).catch(() => pdfDoc.embedJpg(capBytes));
            const capScale = s2.capScale || 1.0;
            const capWidth = 80 * capScale;
            const capHeight = 80 * capScale;
            const capX = rightX + (ttdWidth - capWidth) / 2 + (s2.capOffsetX || 0);
            const capY = sigY - 65 + (ttdHeight - capHeight) / 2 + (s2.capOffsetY || 0);
            page.drawImage(capImg, { x: capX, y: capY, width: capWidth, height: capHeight, opacity: s2.capOpacity || 0.4 });
          }
        } catch (e) { console.error('TTD2 Embed Error', e); }
      }
      page.drawText(s2.nama || '', { x: rightX, y: sigY - 80, size: 11, font: helveticaBoldFont });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="Penghargaan_${recipient.student.user.name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating award certificate:', error);
    return NextResponse.json({ message: 'Gagal membuat sertifikat', error: error.message }, { status: 500 });
  }
}
