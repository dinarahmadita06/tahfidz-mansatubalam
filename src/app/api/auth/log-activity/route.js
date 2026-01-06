import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'LOGIN' } = body;

    // Determine role-specific action
    let activityAction;
    if (action === 'LOGIN') {
      const roleActionMap = {
        'SISWA': ACTIVITY_ACTIONS.SISWA_LOGIN,
        'GURU': ACTIVITY_ACTIONS.GURU_LOGIN,
        'ADMIN': ACTIVITY_ACTIONS.ADMIN_LOGIN,
        'ORANG_TUA': ACTIVITY_ACTIONS.ORANGTUA_LOGIN,
        'ORANGTUA': ACTIVITY_ACTIONS.ORANGTUA_LOGIN,
      };
      activityAction = roleActionMap[session.user.role] || ACTIVITY_ACTIONS.SISWA_LOGIN;
    } else if (action === 'LOGOUT') {
      const roleActionMap = {
        'SISWA': ACTIVITY_ACTIONS.SISWA_LOGOUT,
        'GURU': ACTIVITY_ACTIONS.GURU_LOGOUT,
        'ADMIN': ACTIVITY_ACTIONS.ADMIN_LOGOUT,
        'ORANG_TUA': ACTIVITY_ACTIONS.ORTU_LOGOUT,
        'ORANGTUA': ACTIVITY_ACTIONS.ORTU_LOGOUT,
      };
      activityAction = roleActionMap[session.user.role] || ACTIVITY_ACTIONS.SISWA_LOGOUT;
    } else {
      activityAction = action; // Fallback to passed action
    }

    // Log activity using new logger
    await logActivity({
      actorId: session.user.id,
      actorRole: session.user.role,
      actorName: session.user.name,
      action: activityAction,
      title: action === 'LOGIN' ? 'User login' : 'User logout',
      description: `${session.user.name} (${session.user.role}) ${action === 'LOGIN' ? 'berhasil login' : 'berhasil logout'}`,
      metadata: {
        action,
        timestamp: new Date().toISOString(),
      },
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
