import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyRecoveryCode, generateRecoveryCode, hashRecoveryCode } from '@/lib/recovery';

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

async function checkRateLimit(key) {
  const now = new Date();
  const limit = await prisma.rateLimit.findUnique({ where: { key } });

  if (limit && limit.lockedUntil && limit.lockedUntil > now) {
    const minutesLeft = Math.ceil((limit.lockedUntil - now) / 60000);
    return { restricted: true, message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${minutesLeft} menit.` };
  }

  // Reset attempts if last attempt was a long time ago
  if (limit && (now - limit.updatedAt) > LOCK_TIME_MS) {
    await prisma.rateLimit.update({
      where: { key },
      data: { attempts: 0, lockedUntil: null }
    });
    return { restricted: false };
  }

  return { restricted: false, attempts: limit?.attempts || 0 };
}

async function recordAttempt(key, success) {
  const now = new Date();
  const limit = await prisma.rateLimit.findUnique({ where: { key } });

  if (success) {
    if (limit) {
      await prisma.rateLimit.delete({ where: { key } });
    }
    return;
  }

  const newAttempts = (limit?.attempts || 0) + 1;
  const lockedUntil = newAttempts >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_TIME_MS) : null;

  if (limit) {
    await prisma.rateLimit.update({
      where: { key },
      data: { attempts: newAttempts, lockedUntil }
    });
  } else {
    await prisma.rateLimit.create({
      data: { key, attempts: newAttempts, lockedUntil }
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, role, recoveryCode, newPassword } = body;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `reset-password:${ip}:${username}`;

    // 1. Rate Limit Check
    const limitCheck = await checkRateLimit(rateLimitKey);
    if (limitCheck.restricted) {
      return NextResponse.json({ error: limitCheck.message }, { status: 429 });
    }

    // 2. Validation
    if (!username || !role || !recoveryCode || !newPassword) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ 
        success: false, 
        code: "PASSWORD_TOO_SHORT",
        error: 'Password baru minimal 8 karakter',
        message: 'Password minimal 8 karakter.' 
      }, { status: 400 });
    }

    // 3. Find User
    const user = await prisma.user.findFirst({
      where: { 
        username,
        role: role.toUpperCase()
      }
    });

    // Security: Generic error if user not found or recovery code not set
    if (!user || !user.recoveryCodeHash) {
      await recordAttempt(rateLimitKey, false);
      return NextResponse.json({ error: 'Username atau recovery code tidak valid' }, { status: 400 });
    }

    // 4. Verify Recovery Code
    const isValidCode = await verifyRecoveryCode(recoveryCode, user.recoveryCodeHash);
    if (!isValidCode) {
      await recordAttempt(rateLimitKey, false);
      return NextResponse.json({ error: 'Username atau recovery code tidak valid' }, { status: 400 });
    }

    // 5. Success - Rotate Code and Update Password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Auto-rotate: generate new recovery code
    const newRawCode = generateRecoveryCode();
    const newHashedCode = await hashRecoveryCode(newRawCode);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        recoveryCodeHash: newHashedCode,
        isRecoveryCodeSetup: true // In case it wasn't
      }
    });

    // 6. Log activity
    await prisma.activityLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        actorName: user.name,
        action: 'UPDATE',
        title: 'Reset Password',
        description: 'User mereset password menggunakan recovery code',
        metadata: {
          method: 'RECOVERY_CODE',
          ip
        }
      }
    });

    // Clear rate limit on success
    await recordAttempt(rateLimitKey, true);

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diperbarui. Silakan login.',
      // We don't return the new recovery code here because the user isn't logged in.
      // They will see it again on their next login if we trigger it then.
      // Actually, instructions say "Tampilkan sekali saja saat: first login / setelah reset password".
      // Since they just reset, we should probably return the NEW code here so they can save it immediately.
      newRecoveryCode: newRawCode
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
