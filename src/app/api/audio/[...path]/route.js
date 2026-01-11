export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';

async function handleAudioRequest(params, method = 'GET') {
  try {
    // In Next.js 15, params must be awaited
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const audioUrl = `https://everyayah.com/data/${path}`;

    console.log(`${method} audio request:`, audioUrl);

    const response = await fetch(audioUrl, { method });

    if (!response.ok) {
      console.error(`Audio not found (${response.status}):`, audioUrl);
      return NextResponse.json(
        { error: 'Audio not found' },
        { status: response.status }
      );
    }

    // For HEAD requests, just return the headers
    if (method === 'HEAD') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000',
          'Content-Length': response.headers.get('Content-Length') || '0',
        },
      });
    }

    // For GET requests, return the audio data
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audio' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  return handleAudioRequest(params, 'GET');
}

export async function HEAD(request, { params }) {
  return handleAudioRequest(params, 'HEAD');
}
