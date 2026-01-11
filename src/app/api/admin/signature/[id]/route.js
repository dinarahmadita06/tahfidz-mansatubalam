export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    // For PDF generation, we need to allow access without requiring authentication
    // We'll validate that the requested user ID matches the signature in the database
    const requestedUserId = params.id;
    
    // Get the user's signature info based on the requested ID
    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      select: { 
        id: true, 
        signatureUrl: true,
        ttdUrl: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the actual file path from user's signature
    const signaturePath = user.signatureUrl || user.ttdUrl;
    
    if (!signaturePath) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    // Handle Vercel Blob URLs
    if (signaturePath.startsWith('http')) {
      return NextResponse.redirect(signaturePath);
    }

    // Ensure the path is within the public directory
    const fullPath = path.join(process.cwd(), 'public', signaturePath);
    
    // Validate the path to prevent directory traversal
    const normalizedPath = path.normalize(fullPath);
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!normalizedPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(normalizedPath);
    
    // Determine content type based on file extension
    const ext = path.extname(normalizedPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving signature:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}