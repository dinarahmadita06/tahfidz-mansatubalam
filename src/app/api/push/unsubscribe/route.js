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
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    console.log(`[PUSH] Unsubscribing user ${session.user.id} from endpoint: ${endpoint}`);

    // Option 1: Delete the subscription
    // Option 2: Set isActive to false (more safe for tracking)
    await prisma.pushSubscription.updateMany({
      where: {
        endpoint: endpoint,
        userId: session.user.id
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('[PUSH] Error in /api/push/unsubscribe:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 });
  }
}
