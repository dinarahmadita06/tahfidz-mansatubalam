import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'LOGIN' } = body;

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: action,
      module: 'AUTH',
      description: `User ${session.user.name} (${session.user.role}) berhasil ${action === 'LOGIN' ? 'login' : 'logout'}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
