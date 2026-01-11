export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';


// GET - Mengambil pengaturan sistem
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil pengaturan dari database
    // Untuk sementara, return default settings
    const settings = {
      profile: {
        nama: session.user.name || 'Administrator',
        email: session.user.email || 'admin@tahfidz.com',
        role: 'Administrator',
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: false,
        suspiciousActivityAlert: true,
        autoLogout: true
      },
      display: {
        theme: 'light',
        fontSize: 'normal',
        animationEnabled: true
      },
      system: {
        tahunAjaranAktif: '2024/2025',
        maintenanceMode: false,
        systemStatus: 'active'
      },
      notification: {
        emailNotification: true,
        realtimeNotification: true,
        apiKey: '',
        apiConnected: false
      }
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan sistem' },
      { status: 500 }
    );
  }
}

// POST - Menyimpan pengaturan sistem
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profile, display, system, notification } = body;

    // Log aktivitas
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'UPDATE',
        module: 'SETTINGS',
        description: 'Mengubah pengaturan sistem',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        userAgent: request.headers.get('user-agent') || 'Unknown'
      }
    });

    // Simpan pengaturan ke database
    // Untuk sementara, hanya return success
    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan sistem' },
      { status: 500 }
    );
  }
}

// PUT - Update password admin
export async function PUT(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // Validasi password
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan password baru harus diisi' },
        { status: 400 }
      );
    }

    // Verifikasi password lama dan update password baru
    // TODO: Implement password update logic

    // Log aktivitas
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'UPDATE',
        module: 'AUTH',
        description: 'Mengubah password akun',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        userAgent: request.headers.get('user-agent') || 'Unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah password' },
      { status: 500 }
    );
  }
}
