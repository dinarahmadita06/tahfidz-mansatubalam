export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';

/**
 * PDF Proxy endpoint untuk bypass CORS restrictions
 * GET /api/guru/buku-digital/proxy?url=<encoded_url>
 * 
 * Returns PDF as blob yang bisa dibuka di browser
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'URL parameter diperlukan' },
        { status: 400 }
      );
    }

    // Validate URL is from Vercel Blob
    if (!fileUrl.includes('vercel-storage.com')) {
      return NextResponse.json(
        { error: 'URL tidak valid' },
        { status: 400 }
      );
    }

    // Fetch PDF dari Vercel Blob
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Gagal mengambil file' },
        { status: response.status }
      );
    }

    // Get the PDF buffer
    const buffer = await response.arrayBuffer();

    // Return as blob URL response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document.pdf"',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('PDF proxy error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses PDF', details: error.message },
      { status: 500 }
    );
  }
}
