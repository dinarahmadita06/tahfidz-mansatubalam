/**
 * API Route: Generate Certificate with Active Template
 * POST /api/admin/certificates/generate
 * 
 * Uses the currently active template from database
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveTemplateBuffer } from '@/lib/template-service';
import { generateCertificate, batchGenerateCertificates, mergePDFs } from '@/lib/certificate-generator';

/**
 * Generate single or batch certificates
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const {
      mode = 'single',  // 'single' or 'batch'
      paperSize = 'A4', // 'A4' or 'F4'
      outputFormat = 'single', // 'single', 'merged', or 'zip'
      data,
      dataList
    } = body;
    
    // Get active template
    let templateBuffer;
    try {
      templateBuffer = await getActiveTemplateBuffer();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'No active template found',
          message: 'Please upload and activate a certificate template first',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    // Single certificate mode
    if (mode === 'single') {
      if (!data) {
        return NextResponse.json(
          { error: 'Certificate data is required for single mode' },
          { status: 400 }
        );
      }
      
      const pdfBytes = await generateCertificate(templateBuffer, paperSize, data);
      
      // Generate filename
      const filename = `Sertifikat_${data.nama_siswa.replace(/\s+/g, '_')}.pdf`;
      
      // Return as downloadable PDF
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfBytes.length.toString()
        }
      });
    }
    
    // Batch certificate mode
    if (mode === 'batch') {
      if (!dataList || !Array.isArray(dataList) || dataList.length === 0) {
        return NextResponse.json(
          { error: 'dataList array is required for batch mode' },
          { status: 400 }
        );
      }
      
      const { results, errors } = await batchGenerateCertificates(
        templateBuffer,
        paperSize,
        dataList
      );
      
      // Return merged PDF
      if (outputFormat === 'merged') {
        const pdfBytesList = results.map(r => r.pdfBytes);
        const mergedPdf = await mergePDFs(pdfBytesList);
        
        return new NextResponse(mergedPdf, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Sertifikat_Batch_${Date.now()}.pdf"`,
            'Content-Length': mergedPdf.length.toString()
          }
        });
      }
      
      // Return as ZIP (requires JSZip or similar)
      if (outputFormat === 'zip') {
        const JSZip = require('jszip');
        const zip = new JSZip();
        
        results.forEach((result) => {
          zip.file(result.filename, result.pdfBytes);
        });
        
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="Sertifikat_Batch_${Date.now()}.zip"`,
            'Content-Length': zipBuffer.length.toString()
          }
        });
      }
      
      // Return JSON with results
      return NextResponse.json({
        success: true,
        generated: results.length,
        errors: errors.length,
        results: results.map(r => ({
          filename: r.filename,
          data: r.data,
          size: r.pdfBytes.length
        })),
        errors: errors
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid mode. Use "single" or "batch"' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Certificate generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate certificate',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
