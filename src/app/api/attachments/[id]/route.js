import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const announcement = await prisma.pengumuman.findUnique({
      where: { id },
      select: { attachmentUrl: true, attachmentName: true }
    });

    if (!announcement || !announcement.attachmentUrl) {
      return new NextResponse('Attachment not found', { status: 404 });
    }

    // Fetch the file from the remote storage (e.g., Vercel Blob)
    const response = await fetch(announcement.attachmentUrl);
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch file from storage', { status: 502 });
    }

    const blob = await response.blob();
    const headers = new Headers();
    
    // Set mandatory headers for PDF preview
    headers.set('Content-Type', 'application/pdf');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Force inline display instead of download for preview
    headers.set('Content-Disposition', `inline; filename="${announcement.attachmentName || 'attachment.pdf'}"`);
    
    // Allow iframing from own origin
    headers.set('Content-Security-Policy', "frame-ancestors 'self'");

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error proxying attachment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
