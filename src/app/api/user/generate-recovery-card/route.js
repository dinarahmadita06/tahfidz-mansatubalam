import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCanvas } from 'canvas';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recoveryCode } = await request.json();

    if (!recoveryCode) {
      return NextResponse.json({ error: 'Recovery code is required' }, { status: 400 });
    }

    // Create canvas for the recovery card
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);

    // Header with SIMTAQ branding
    const gradient = ctx.createLinearGradient(0, 0, 800, 0);
    gradient.addColorStop(0, '#059669');
    gradient.addColorStop(1, '#047857');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 120);

    // SIMTAQ text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SIMTAQ', 400, 70);

    // Subtitle
    ctx.font = '20px Arial';
    ctx.fillText('Sistem Informasi Manajemen Tahfidz Al-Qur\'an', 400, 100);

    // Recovery Code title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recovery Code', 400, 200);

    // Recovery code display (larger and centered)
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#059669';
    ctx.fillText(recoveryCode, 400, 280);

    // Warning message
    ctx.fillStyle = '#dc2626';
    ctx.font = '16px Arial';
    ctx.fillText('⚠️ Simpan di tempat aman - Kode ini hanya tampil sekali', 400, 340);

    // Instructions
    ctx.fillStyle = '#4b5563';
    ctx.font = '14px Arial';
    ctx.fillText('Gunakan kode ini untuk mereset password jika lupa', 400, 380);
    ctx.fillText('Jaga kerahasiaan kode ini seperti password Anda', 400, 410);

    // Footer
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.fillText('Dibuat pada: ' + new Date().toLocaleDateString('id-ID'), 400, 550);
    ctx.fillText('SIMTAQ - Sistem Informasi Manajemen Tahfidz Al-Qur\'an', 400, 570);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Return image response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="SIMTAQ-Recovery-Code-${new Date().toISOString().split('T')[0]}.png"`,
      },
    });
  } catch (error) {
    console.error('Error generating recovery card:', error);
    return NextResponse.json({ error: 'Failed to generate recovery card' }, { status: 500 });
  }
}