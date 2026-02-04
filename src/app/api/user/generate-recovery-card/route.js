import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCanvas } from 'canvas';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recoveryCode, username, name } = await request.json();

    if (!recoveryCode) {
      return NextResponse.json({ error: 'Recovery code is required' }, { status: 400 });
    }

    // Get user info from session or request body
    const userUsername = username || session.user.username || 'User';
    const userName = name || session.user.name || '';

    // Create canvas for the recovery card (increased size for better quality)
    const canvas = createCanvas(1080, 810);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1080, 810);

    // Header with SIMTAQ branding
    const gradient = ctx.createLinearGradient(0, 0, 1080, 0);
    gradient.addColorStop(0, '#059669');
    gradient.addColorStop(1, '#047857');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 160);

    // SIMTAQ text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SIMTAQ', 540, 85);

    // Subtitle
    ctx.font = '24px Arial';
    ctx.fillText('Sistem Informasi Manajemen Tahfidz Al-Qur\'an', 540, 125);

    // Recovery Code title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Kartu Recovery', 540, 250);

    // User info
    ctx.fillStyle = '#4b5563';
    ctx.font = '20px Arial';
    ctx.fillText(`Username: ${userUsername}`, 540, 300);
    if (userName) {
      ctx.fillText(`Nama: ${userName}`, 540, 335);
    }

    // Recovery code display (larger and centered)
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = '#059669';
    ctx.fillText(recoveryCode, 540, 440);

    // Warning message
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('⚠️ SIMPAN DI TEMPAT AMAN', 540, 520);
    
    ctx.font = '18px Arial';
    ctx.fillText('Kode ini hanya tampil sekali dan tidak dapat dipulihkan', 540, 555);

    // Instructions
    ctx.fillStyle = '#4b5563';
    ctx.font = '16px Arial';
    ctx.fillText('Gunakan kode ini untuk mereset password jika lupa', 540, 610);
    ctx.fillText('Jaga kerahasiaan kode ini seperti password Anda', 540, 640);

    // Footer
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Arial';
    const createdDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    ctx.fillText('Dibuat pada: ' + createdDate, 540, 740);
    ctx.fillText('SIMTAQ - Sistem Informasi Manajemen Tahfidz Al-Qur\'an', 540, 770);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Return image response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="RecoveryCard_${userUsername}.png"`,
      },
    });
  } catch (error) {
    console.error('Error generating recovery card:', error);
    return NextResponse.json({ error: 'Failed to generate recovery card' }, { status: 500 });
  }
}