import { NextResponse } from 'next/server';

/**
 * POST /api/auth/ping
 * - Refresh last-activity timestamp in httpOnly cookie
 * - Used by client idle hook to keep session alive while active
 */
export async function POST(request) {
  try {
    const now = Date.now();
    const res = NextResponse.json({ ok: true, ts: now });
    const secure = process.env.NODE_ENV === 'production';
    res.headers.append(
      'Set-Cookie',
      [
        `simtaq_idle_at=${now}; Path=/; HttpOnly; SameSite=Lax; ${secure ? 'Secure; ' : ''}Max-Age=${60 * 60 * 24 * 7}`
      ].join('')
    );
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

