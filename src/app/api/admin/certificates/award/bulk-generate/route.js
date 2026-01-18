export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import archiver from 'archiver';

// Helper to generate award certificate PDF
async function generateAwardCertificatePDF(recipient, signers, printDate = null) {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRomanItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const width = 842;
  const height = 595;
  const page = pdfDoc.addPage([width, height]);

  // Gold border
  page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0.8, 0.6, 0.1), borderWidth: 3 });
  page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: rgb(0.8, 0.6, 0.1), borderWidth: 1 });

  let yPos = height - 60;

  // Header
  const headerLine1 = 'KEMENTERIAN AGAMA';
  page.drawText(headerLine1, {
    x: (width - helveticaBoldFont.widthOfTextAtSize(headerLine1, 12)) / 2,
    y: yPos, size: 12, font: helveticaBoldFont,
  });
  yPos -= 16;

  const headerLine2 = 'KANTOR KEMENTERIAN AGAMA KOTA BANDAR LAMPUNG';
  page.drawText(headerLine2, {
    x: (width - helveticaFont.widthOfTextAtSize(headerLine2, 10)) / 2,
    y: yPos, size: 10, font: helveticaFont,
  });
  yPos -= 16;

  const headerLine3 = 'MADRASAH ALIYAH NEGERI MAN 1 BANDAR LAMPUNG';
  page.drawText(headerLine3, {
    x: (width - helveticaBoldFont.widthOfTextAtSize(headerLine3, 11)) / 2,
    y: yPos, size: 11, font: helveticaBoldFont,
  });
  yPos -= 35;

  // Title
  const title = 'SERTIFIKAT';
  page.drawText(title, {
    x: (width - helveticaBoldFont.widthOfTextAtSize(title, 28)) / 2,
    y: yPos, size: 28, font: helveticaBoldFont, color: rgb(0.7, 0.5, 0.1),
  });
  yPos -= 24;

  const subtitle = 'Wisuda Tahfidzul Qur\'an';
  page.drawText(subtitle, {
    x: (width - timesRomanItalicFont.widthOfTextAtSize(subtitle, 18)) / 2,
    y: yPos, size: 18, font: timesRomanItalicFont,
  });
  yPos -= 35;

  // Student Name
  const givenTo = 'Diberikan Kepada';
  page.drawText(givenTo, {
    x: (width - helveticaFont.widthOfTextAtSize(givenTo, 14)) / 2,
    y: yPos, size: 14, font: helveticaFont,
  });
  yPos -= 28;

  const studentName = recipient.student?.user?.name || 'N/A';
  page.drawText(studentName, {
    x: (width - helveticaBoldFont.widthOfTextAtSize(studentName, 20)) / 2,
    y: yPos, size: 20, font: helveticaBoldFont, color: rgb(0.7, 0.5, 0.1),
  });
  yPos -= 32;

  // Award Category
  const categoryLabel = 'Sebagai:';
  page.drawText(categoryLabel, {
    x: (width - helveticaFont.widthOfTextAtSize(categoryLabel, 13)) / 2,
    y: yPos, size: 13, font: helveticaFont, color: rgb(0.4, 0.4, 0.4),
  });
  yPos -= 24;

  const categoryName = recipient.category?.categoryName || 'Peserta Terbaik';
  page.drawText(categoryName, {
    x: (width - helveticaBoldFont.widthOfTextAtSize(categoryName, 18)) / 2,
    y: yPos, size: 18, font: helveticaBoldFont, color: rgb(0.1, 0.5, 0.3),
  });
  yPos -= 28;

  // Appreciation
  const lines = [
    'Kepadanya kami berikan penghargaan setinggi-tingginya',
    'Semoga tanda penghargaan ini menjadi motivasi untuk senantiasa',
    'meningkatkan amal ibadahnya sesuai ketentuan Allah SWT dan Rosul-Nya'
  ];
  for (const line of lines) {
    page.drawText(line, {
      x: (width - helveticaFont.widthOfTextAtSize(line, 11)) / 2,
      y: yPos, size: 11, font: helveticaFont,
    });
    yPos -= 16;
  }
  yPos -= 19;

  // Signatures
  const sigY = yPos;
  const leftX = 80;
  const rightX = width - 280;
  const s1 = signers.find(s => s.type === 'SIGNER_1');
  const s2 = signers.find(s => s.type === 'SIGNER_2');

  if (s1) {
    page.drawText(s1.jabatan || '', { x: leftX, y: sigY, size: 11, font: helveticaFont });
    if (s1.signatureData) {
      try {
        const imgBase64 = s1.signatureData.split(',')[1] || s1.signatureData;
        const imgBytes = Buffer.from(imgBase64, 'base64');
        const ttdImg = await pdfDoc.embedPng(imgBytes).catch(() => pdfDoc.embedJpg(imgBytes));
        page.drawImage(ttdImg, { x: leftX, y: sigY - 65, width: 100, height: 50 });
        
        if (s1.capData) {
          const capBase64 = s1.capData.split(',')[1] || s1.capData;
          const capBytes = Buffer.from(capBase64, 'base64');
          const capImg = await pdfDoc.embedPng(capBytes).catch(() => pdfDoc.embedJpg(capBytes));
          const capScale = s1.capScale || 1.0;
          const capWidth = 80 * capScale;
          const capHeight = 80 * capScale;
          page.drawImage(capImg, {
            x: leftX + (100 - capWidth) / 2 + (s1.capOffsetX || 0),
            y: sigY - 65 + (50 - capHeight) / 2 + (s1.capOffsetY || 0),
            width: capWidth, height: capHeight, opacity: s1.capOpacity || 0.4
          });
        }
      } catch (e) { console.error('TTD1 Error:', e); }
    }
    page.drawText(s1.nama || '', { x: leftX, y: sigY - 80, size: 11, font: helveticaBoldFont });
  }

  const certDate = printDate ? new Date(printDate) : new Date();
  const dateStr = certDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  page.drawText(`Bandar Lampung, ${dateStr}`, { x: rightX, y: sigY + 20, size: 10, font: helveticaFont });
  
  if (s2) {
    page.drawText(s2.jabatan || '', { x: rightX, y: sigY, size: 11, font: helveticaFont });
    if (s2.signatureData) {
      try {
        const imgBase64 = s2.signatureData.split(',')[1] || s2.signatureData;
        const imgBytes = Buffer.from(imgBase64, 'base64');
        const ttdImg = await pdfDoc.embedPng(imgBytes).catch(() => pdfDoc.embedJpg(imgBytes));
        page.drawImage(ttdImg, { x: rightX, y: sigY - 65, width: 100, height: 50 });
        
        if (s2.capData) {
          const capBase64 = s2.capData.split(',')[1] || s2.capData;
          const capBytes = Buffer.from(capBase64, 'base64');
          const capImg = await pdfDoc.embedPng(capBytes).catch(() => pdfDoc.embedJpg(capBytes));
          const capScale = s2.capScale || 1.0;
          const capWidth = 80 * capScale;
          const capHeight = 80 * capScale;
          page.drawImage(capImg, {
            x: rightX + (100 - capWidth) / 2 + (s2.capOffsetX || 0),
            y: sigY - 65 + (50 - capHeight) / 2 + (s2.capOffsetY || 0),
            width: capWidth, height: capHeight, opacity: s2.capOpacity || 0.4
          });
        }
      } catch (e) { console.error('TTD2 Error:', e); }
    }
    page.drawText(s2.nama || '', { x: rightX, y: sigY - 80, size: 11, font: helveticaBoldFont });
  }

  return await pdfDoc.save();
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filters = {}, skipPublished = true, selectedIds, defaultCategoryId, printDate } = body;

    // Build where clause
    const whereClause = {};
    
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }
    
    if (filters.query) {
      whereClause.student = {
        user: {
          name: { contains: filters.query, mode: 'insensitive' },
        },
      };
    }

    // If selectedIds provided, filter by them
    if (selectedIds && selectedIds.length > 0) {
      whereClause.id = { in: selectedIds };
    }

    // Fetch all matching recipients
    const allRecipients = await prisma.awardRecipient.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        category: true,
        certificate: true,
      },
      orderBy: [
        { student: { kelas: { nama: 'asc' } } },
        { student: { user: { name: 'asc' } } },
      ],
    });

    const totalCount = allRecipients.length;
    let skippedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    // Filter based on skipPublished
    const recipients = skipPublished 
      ? allRecipients.filter(r => {
          if (r.certificate) {
            skippedCount++;
            return false;
          }
          return true;
        })
      : allRecipients;

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          message: skipPublished ? 'Semua sertifikat sudah terbit' : 'Tidak ada sertifikat yang perlu di-generate',
          count: 0,
        },
        { 
          headers: {
            'X-Total-Count': totalCount.toString(),
            'X-Success-Count': '0',
            'X-Failed-Count': '0',
            'X-Skipped-Count': skippedCount.toString(),
          }
        }
      );
    }

    // Fetch signers
    const signers = await prisma.adminSignature.findMany({
      where: { type: { in: ['SIGNER_1', 'SIGNER_2'] } }
    });

    // Find template
    const template = await prisma.certificateTemplate.findFirst({
      where: { type: 'AWARD', isDefault: true, isActive: true },
    });

    // Generate certificates
    const pdfs = [];

    for (const recipient of recipients) {
      try {
        // Create certificate record if not exists
        if (!recipient.certificate) {
          const date = new Date();
          const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
          const countToday = await prisma.certificate.count({
            where: {
              certificateNumber: { startsWith: `CERT/AWARD/${dateStr}` },
            },
          });
          const seq = (countToday + 1).toString().padStart(4, '0');
          const certNumber = `CERT/AWARD/${dateStr}/${seq}`;

          await prisma.certificate.create({
            data: {
              type: 'AWARD',
              awardRecipientId: recipient.id,
              certificateNumber: certNumber,
              generatedById: session.user.id,
              templateId: template?.id || null,
            },
          });
        }

        // Generate PDF
        const pdfBytes = await generateAwardCertificatePDF(recipient, signers, printDate);
        
        // Filename: Sertifikat_Award_{Nama}_{NIS}_{Kategori}.pdf
        const name = (recipient.student?.user?.name || 'NoName').replace(/\s+/g, '_');
        const nisn = recipient.student?.nisn || 'NoNIS';
        const category = (recipient.category?.categoryName || 'NoCategory').replace(/\s+/g, '_');
        const filename = `Sertifikat_Award_${name}_${nisn}_${category}.pdf`;

        pdfs.push({ filename, data: pdfBytes });
        successCount++;
      } catch (error) {
        console.error(`Error generating cert for ${recipient.student?.user?.name}:`, error);
        failedCount++;
      }
    }

    if (pdfs.length === 0) {
      return NextResponse.json(
        { message: 'Gagal generate semua sertifikat' }, 
        { 
          status: 500,
          headers: {
            'X-Total-Count': totalCount.toString(),
            'X-Success-Count': '0',
            'X-Failed-Count': failedCount.toString(),
            'X-Skipped-Count': skippedCount.toString(),
          }
        }
      );
    }

    // If only one PDF, return it directly
    if (pdfs.length === 1) {
      return new NextResponse(Buffer.from(pdfs[0].data), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfs[0].filename}"`,
          'X-Total-Count': totalCount.toString(),
          'X-Success-Count': successCount.toString(),
          'X-Failed-Count': failedCount.toString(),
          'X-Skipped-Count': skippedCount.toString(),
        },
      });
    }

    // Create ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });
    for (const pdf of pdfs) {
      archive.append(Buffer.from(pdf.data), { name: pdf.filename });
    }
    archive.finalize();

    // ZIP filename: Sertifikat_Award_Bulk_{Category}_{YYYYMMDD}.zip
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    let filterDesc = 'All';
    
    if (filters.categoryId) {
      const category = await prisma.awardCategory.findUnique({ where: { id: filters.categoryId } });
      if (category) filterDesc = category.categoryName.replace(/\s+/g, '_');
    }
    
    const zipFilename = `Sertifikat_Award_Bulk_${filterDesc}_${dateStr}.zip`;

    const chunks = [];
    for await (const chunk of archive) {
      chunks.push(chunk);
    }
    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'X-Total-Count': totalCount.toString(),
        'X-Success-Count': successCount.toString(),
        'X-Failed-Count': failedCount.toString(),
        'X-Skipped-Count': skippedCount.toString(),
      },
    });

  } catch (error) {
    console.error('BULK GENERATE AWARD ERROR:', error);
    return NextResponse.json({ 
      message: 'Gagal generate sertifikat award bulk', 
      error: error.message 
    }, { status: 500 });
  }
}
