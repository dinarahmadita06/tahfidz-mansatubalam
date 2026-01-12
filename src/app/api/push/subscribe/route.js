import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Only allow SISWA, GURU, and ORANG_TUA to subscribe
    const ALLOWED_ROLES = ['SISWA', 'GURU', 'ORANG_TUA'];
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json({ 
        error: 'Forbidden', 
        message: `Push notifikasi tidak tersedia untuk role ${userRole}` 
      }, { status: 403 });
    }

    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Data subscription tidak lengkap' }, { status: 400 });
    }

    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json({ error: 'Kunci enkripsi subscription tidak valid' }, { status: 400 });
    }

    if (!prisma.pushSubscription) {
      console.error('CRITICAL: prisma.pushSubscription is UNDEFINED');
      console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('$')));
      return NextResponse.json({ error: 'Prisma client out of sync. Please restart server.' }, { status: 500 });
    }

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Save or update subscription (Upsert per endpoint)
    const savedSubscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId: userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
        isActive: true,
      },
    });

    console.log(`[PUSH] User ${userId} (${userRole}) subscribed successfully. Endpoint: ${subscription.endpoint.substring(0, 30)}...`);

    return NextResponse.json({ success: true, data: savedSubscription });
  } catch (error) {
    console.error('Error in /api/push/subscribe:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
