import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    // Mark as inactive or delete
    await prisma.pushSubscription.updateMany({
      where: {
        endpoint: endpoint,
        userId: session.user.id,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/push/unsubscribe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
