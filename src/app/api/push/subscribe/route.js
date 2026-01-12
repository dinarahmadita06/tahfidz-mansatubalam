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
    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!prisma.pushSubscription) {
      console.error('CRITICAL: prisma.pushSubscription is UNDEFINED');
      console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('$')));
      return NextResponse.json({ error: 'Prisma client out of sync. Please restart server.' }, { status: 500 });
    }

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Save or update subscription
    const savedSubscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId: userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: savedSubscription });
  } catch (error) {
    console.error('Error in /api/push/subscribe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
