export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300; // 5 minutes for bulk operations

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCertificate } from '@/lib/certificate-generator';
import { getActiveTemplateBuffer } from '@/lib/template-service';
import archiver from 'archiver';
import { Readable } from 'stream';

// Helper to generate certificate number
async function generateCertNumber(type) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = type === 'NON_AWARD' ? 'TASMI' : 'AWARD';
  
  const countToday = await prisma.certificate.count({
    where: {
      certificateNumber: {
        startsWith: `CERT/${prefix}/${dateStr}`,
      },
    },
  });
  
  const seq = (countToday + 1).toString().padStart(4, '0');
  return `CERT/${prefix}/${dateStr}/${seq}`;
}

// Helper to generate single certificate PDF using certificate-generator
async function generateCertificatePDF(tasmi, templateBuffer, signers, customDate = null) {
  try {
    const certDate = customDate ? new Date(customDate) : new Date();
    const dateStr = certDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const s1 = signers.find(s => s.type === 'SIGNER_1');
    const s2 = signers.find(s => s.type === 'SIGNER_2');
    
    console.log('[generateCertificatePDF] Template buffer available:', !!templateBuffer);
    console.log('[generateCertificatePDF] Template buffer size:', templateBuffer ? `${templateBuffer.length} bytes` : 'null');
    console.log('[generateCertificatePDF] Siswa:', tasmi.siswa?.user?.name);
    console.log('[generateCertificatePDF] JUZ:', tasmi.juzYangDitasmi);
    
    // Prepare data for certificate generator
    const certificateData = {
      nama_siswa: tasmi.siswa?.user?.name || 'N/A',
      juz: tasmi.juzYangDitasmi || '',
      tanggal_cetak: dateStr,
      tempat: 'Bandar Lampung',
      jabatan_kiri: s1?.jabatan || 'Kepala MAN 1 Bandar Lampung',
      nama_pejabat_kiri: s1?.nama || 'Luqman Hakim, S.Pd., M.M.',
      ttd_kepala_man: s1?.signatureData || null,
      cap_kepala_man: s1?.capData || null,
      cap_kepala_man_scale: s1?.capScale || 1.0,
      cap_kepala_man_offsetX: s1?.capOffsetX || 0,
      cap_kepala_man_offsetY: s1?.capOffsetY || 0,
      cap_kepala_man_opacity: s1?.capOpacity || 0.4,
      jabatan_kanan: s2?.jabatan || 'Ketua Asrama Luqman El-Hakim',
      nama_pejabat_kanan: s2?.nama || 'Siti Rowiyah, M.P.dI',
      ttd_ketua_asrama: s2?.signatureData || null,
      cap_ketua_asrama: s2?.capData || null,
      cap_ketua_asrama_scale: s2?.capScale || 1.0,
      cap_ketua_asrama_offsetX: s2?.capOffsetX || 0,
      cap_ketua_asrama_offsetY: s2?.capOffsetY || 0,
      cap_ketua_asrama_opacity: s2?.capOpacity || 0.4,
    };

    // Use the certificate generator with correct parameter order
    // generateCertificate(templateSource, paperSize, data)
    const pdfBytes = await generateCertificate(templateBuffer, 'A4', certificateData);
    console.log('[generateCertificatePDF] PDF generated, size:', pdfBytes.length, 'bytes');
    return pdfBytes;
  } catch (error) {
    console.error('[generateCertificatePDF] Error:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filters = {}, skipPublished = true, selectedIds, printDate } = body;

    // Build where clause similar to results API
    const whereClause = {
      statusPendaftaran: 'SELESAI',
      isPassed: true,
      assessedAt: { not: null },
    };

    // Apply filters
    const { kelasId, query, periode, jenisKelamin, jenjang } = filters;

    if (periode) {
      const year = parseInt(periode);
      whereClause.tanggalUjian = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }

    if (kelasId || jenisKelamin || query || jenjang) {
      whereClause.siswa = {};
      
      if (kelasId) {
        whereClause.siswa.kelasId = kelasId;
      }
      
      if (jenjang) {
        whereClause.siswa.kelas = {
          jenjang: jenjang
        };
      }
      
      if (jenisKelamin) {
        whereClause.siswa.jenisKelamin = jenisKelamin;
      }
      
      if (query) {
        whereClause.siswa.user = {
          name: { contains: query, mode: 'insensitive' },
        };
      }
    }

    // If selectedIds provided, filter by them
    if (selectedIds && selectedIds.length > 0) {
      whereClause.id = { in: selectedIds };
    }

    // Fetch all matching tasmi results first
    const allTasmiResults = await prisma.tasmi.findMany({
      where: whereClause,
      include: {
        siswa: {
          select: {
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        certificate: true,
      },
      orderBy: [
        { siswa: { kelas: { nama: 'asc' } } },
        { siswa: { user: { name: 'asc' } } },
      ],
    });

    const totalCount = allTasmiResults.length;
    let skippedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    // Log untuk debugging
    console.log(`[BULK GENERATE] Total tasmi found: ${totalCount}`);
    console.log(`[BULK GENERATE] skipPublished: ${skipPublished}`);
    allTasmiResults.forEach((t, idx) => {
      console.log(`[BULK GENERATE] Tasmi ${idx + 1}:`, {
        id: t.id,
        siswa: t.siswa?.user?.name,
        hasCertificate: !!t.certificate,
        certificateId: t.certificate?.id
      });
    });

    // Separate into new and existing certificates
    const tasmiToGenerate = [];
    const tasmiWithCertificates = [];
    
    for (const tasmi of allTasmiResults) {
      if (tasmi.certificate) {
        tasmiWithCertificates.push(tasmi);
        if (!skipPublished) {
          // Jika tidak skip published, regenerate ulang
          tasmiToGenerate.push(tasmi);
        } else {
          skippedCount++;
        }
      } else {
        tasmiToGenerate.push(tasmi);
      }
    }

    console.log(`[BULK GENERATE] To generate: ${tasmiToGenerate.length}, With existing cert: ${tasmiWithCertificates.length}, Skipped: ${skippedCount}`);

    // Jika semua sudah punya certificate dan skipPublished=true, download yang sudah ada
    if (tasmiToGenerate.length === 0 && tasmiWithCertificates.length > 0 && skipPublished) {
      console.log('[BULK GENERATE] All have certificates, downloading existing ones');
      // Download existing certificates instead of returning error
      const tasmiResults = tasmiWithCertificates;
      
      // Generate PDFs from existing certificates
      const pdfs = [];
      const signers = await prisma.adminSignature.findMany({
        where: { type: { in: ['SIGNER_1', 'SIGNER_2'] } }
      });

      // Get active template buffer
      let templateBuffer;
      try {
        templateBuffer = await getActiveTemplateBuffer();
        console.log('[BULK GENERATE] Template loaded successfully:', templateBuffer.length, 'bytes');
      } catch (error) {
        console.error('[BULK GENERATE] Template load error:', error.message);
        return NextResponse.json(
          { error: 'No active template found', message: 'Please upload and activate a certificate template first' },
          { status: 400 }
        );
      }

      for (const tasmi of tasmiResults) {
        try {
          const pdfBytes = await generateCertificatePDF(tasmi, templateBuffer, signers, printDate);
          
          const name = (tasmi.siswa?.user?.name || 'NoName').replace(/\s+/g, '_');
          const nisn = tasmi.siswa?.nisn || 'NoNIS';
          const kelas = (tasmi.siswa?.kelas?.nama || 'NoKelas').replace(/\s+/g, '_');
          const tanggalUjian = tasmi.tanggalUjian 
            ? new Date(tasmi.tanggalUjian).toISOString().slice(0, 10).replace(/-/g, '')
            : 'NoDate';
          const filename = `Sertifikat_Tasmi_${name}_${nisn}_${kelas}_${tanggalUjian}.pdf`;

          pdfs.push({ filename, data: pdfBytes });
          successCount++;
        } catch (error) {
          console.error(`Error generating cert for ${tasmi.siswa?.user?.name}:`, error);
          failedCount++;
        }
      }

      // Return ZIP with existing certificates
      if (pdfs.length === 1) {
        return new NextResponse(Buffer.from(pdfs[0].data), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${pdfs[0].filename}"`,
            'X-Total-Count': totalCount.toString(),
            'X-Success-Count': successCount.toString(),
            'X-Failed-Count': failedCount.toString(),
            'X-Skipped-Count': '0',
          },
        });
      }

      // Create ZIP for multiple
      console.log(`[BULK GENERATE] Creating ZIP with ${pdfs.length} PDFs`);
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks = [];
      
      // Wrap archiver in Promise
      const zipPromise = new Promise((resolve, reject) => {
        archive.on('data', (chunk) => {
          console.log(`[BULK GENERATE] Received chunk: ${chunk.length} bytes`);
          chunks.push(chunk);
        });
        
        archive.on('end', () => {
          console.log('[BULK GENERATE] Archive end event');
          const buffer = Buffer.concat(chunks);
          console.log(`[BULK GENERATE] Total ZIP size: ${buffer.length} bytes`);
          resolve(buffer);
        });
        
        archive.on('error', (err) => {
          console.error('[BULK GENERATE] Archive error:', err);
          reject(err);
        });
      });

      // Add PDFs to archive
      for (const pdf of pdfs) {
        console.log(`[BULK GENERATE] Adding ${pdf.filename} (${pdf.data.length} bytes)`);
        archive.append(Buffer.from(pdf.data), { name: pdf.filename });
      }
      
      // Finalize and wait for completion
      archive.finalize();
      const zipBuffer = await zipPromise;

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const zipFilename = `Sertifikat_Tasmi_Bulk_${dateStr}.zip`;

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${zipFilename}"`,
          'X-Total-Count': totalCount.toString(),
          'X-Success-Count': successCount.toString(),
          'X-Failed-Count': failedCount.toString(),
          'X-Skipped-Count': '0',
        },
      });
    }

    // If nothing to process
    if (tasmiToGenerate.length === 0) {
      return NextResponse.json(
        {
          message: 'Tidak ada sertifikat yang perlu di-generate',
          count: 0,
          details: {
            total: totalCount,
            skipped: skippedCount,
            toGenerate: 0
          }
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

    const tasmiResults = tasmiToGenerate;

    // Fetch signers
    const signers = await prisma.adminSignature.findMany({
      where: { type: { in: ['SIGNER_1', 'SIGNER_2'] } }
    });

    // Get active template buffer
    let templateBuffer;
    try {
      templateBuffer = await getActiveTemplateBuffer();
      console.log('[BULK GENERATE] Template loaded successfully:', templateBuffer.length, 'bytes');
    } catch (error) {
      console.error('[BULK GENERATE] Template load error:', error.message);
      return NextResponse.json(
        { error: 'No active template found', message: 'Please upload and activate a certificate template first' },
        { status: 400 }
      );
    }

    // Generate certificates
    const pdfs = [];

    for (const tasmi of tasmiResults) {
      try {
        // Create certificate record if not exists
        if (!tasmi.certificate) {
          const certNumber = await generateCertNumber('NON_AWARD');
          await prisma.certificate.create({
            data: {
              type: 'NON_AWARD',
              tasmiId: tasmi.id,
              certificateNumber: certNumber,
              generatedById: session.user.id,
              templateId: template?.id || null,
            },
          });
        }

        // Generate PDF with custom date if provided
        const pdfBytes = await generateCertificatePDF(tasmi, templateBuffer, signers, printDate);
        
        // Filename: Sertifikat_Tasmi_{Nama}_{NIS}_{Kelas}_{TanggalUjian}.pdf
        const name = (tasmi.siswa?.user?.name || 'NoName').replace(/\s+/g, '_');
        const nisn = tasmi.siswa?.nisn || 'NoNIS';
        const kelas = (tasmi.siswa?.kelas?.nama || 'NoKelas').replace(/\s+/g, '_');
        const tanggalUjian = tasmi.tanggalUjian 
          ? new Date(tasmi.tanggalUjian).toISOString().slice(0, 10).replace(/-/g, '')
          : 'NoDate';
        const filename = `Sertifikat_Tasmi_${name}_${nisn}_${kelas}_${tanggalUjian}.pdf`;

        pdfs.push({ filename, data: pdfBytes });
        successCount++;
      } catch (error) {
        console.error(`Error generating cert for ${tasmi.siswa?.user?.name}:`, error);
        failedCount++;
      }
    }

    // If no PDFs generated
    if (pdfs.length === 0) {
      return NextResponse.json(
        {
          message: 'Gagal generate semua sertifikat',
        }, 
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

    // Create ZIP file for multiple PDFs
    console.log(`[BULK GENERATE] Creating ZIP with ${pdfs.length} PDFs`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];
    
    // Wrap archiver in Promise
    const zipPromise = new Promise((resolve, reject) => {
      archive.on('data', (chunk) => {
        console.log(`[BULK GENERATE] Received chunk: ${chunk.length} bytes`);
        chunks.push(chunk);
      });
      
      archive.on('end', () => {
        console.log('[BULK GENERATE] Archive end event');
        const buffer = Buffer.concat(chunks);
        console.log(`[BULK GENERATE] Total ZIP size: ${buffer.length} bytes`);
        resolve(buffer);
      });
      
      archive.on('error', (err) => {
        console.error('[BULK GENERATE] Archive error:', err);
        reject(err);
      });
    });

    // Add PDFs to archive
    for (const pdf of pdfs) {
      console.log(`[BULK GENERATE] Adding ${pdf.filename} (${pdf.data.length} bytes)`);
      archive.append(Buffer.from(pdf.data), { name: pdf.filename });
    }

    // Finalize and wait for completion
    archive.finalize();
    const zipBuffer = await zipPromise;

    // Generate ZIP filename: Sertifikat_Tasmi_Bulk_{Jenjang}_{KelasOrAll}_{YYYYMMDD}.zip
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    let filterDesc = '';
    
    if (jenjang) {
      filterDesc += `${jenjang}`;
    }
    
    if (kelasId) {
      const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } });
      if (kelas) {
        filterDesc += filterDesc ? `_${kelas.nama.replace(/\s+/g, '_')}` : kelas.nama.replace(/\s+/g, '_');
      }
    } else if (!jenjang) {
      filterDesc = 'All';
    }
    
    const zipFilename = `Sertifikat_Tasmi_Bulk_${filterDesc}_${dateStr}.zip`;

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
    console.error('BULK GENERATE ERROR:', error);
    return NextResponse.json({ 
      message: 'Gagal generate sertifikat bulk', 
      error: error.message 
    }, { status: 500 });
  }
}
