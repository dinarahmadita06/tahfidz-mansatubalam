/**
 * API Endpoint: Update Student Status
 * PATCH /api/admin/siswa/[id]/status
 *
 * Updates student status (AKTIF, LULUS, PINDAH, KELUAR) and cascades to user account
 * Admin only
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  updateStudentStatus,
  getStudentStatusBadge,
} from '@/lib/services/studentStatusService';

export async function PATCH(request, { params }) {
  try {
    // 1. Authentication & Authorization
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id: siswaId } = params;
    console.log('📝 Update Status Request:', { siswaId, params });

    // 2. Validate Request Body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('❌ JSON parsing error:', e.message);
      return NextResponse.json(
        { error: 'Invalid JSON body', details: e.message },
        { status: 400 }
      );
    }

    const { statusSiswa } = body;
    console.log('📋 Received payload:', { statusSiswa, body });

    if (!statusSiswa) {
      return NextResponse.json(
        { error: 'statusSiswa is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['AKTIF', 'LULUS', 'PINDAH', 'KELUAR'];
    if (!validStatuses.includes(statusSiswa)) {
      return NextResponse.json(
        {
          error: 'Invalid statusSiswa',
          validStatuses,
        },
        { status: 400 }
      );
    }

    // 3. Update Student Status via Service Layer
    console.log('🔄 Calling updateStudentStatus with:', { siswaId, statusSiswa, adminId: session.user.id });
    
    let updatedSiswa;
    try {
      updatedSiswa = await updateStudentStatus(
        siswaId,
        statusSiswa,
        session.user.id
      );
      console.log('✅ Update successful:', { siswaId, newStatus: updatedSiswa.statusSiswa });
    } catch (serviceError) {
      console.error('❌ Service layer error:', {
        message: serviceError.message,
        siswaId,
        statusSiswa,
        stack: serviceError.stack
      });
      throw serviceError;
    }

    // 4. Return Success Response
    const badge = getStudentStatusBadge(statusSiswa);

    return NextResponse.json({
      success: true,
      message: `Status siswa berhasil diubah menjadi ${badge.label}`,
      data: {
        id: updatedSiswa.id,
        nis: updatedSiswa.nis,
        name: updatedSiswa.user.name,
        statusSiswa: updatedSiswa.statusSiswa,
        tanggalKeluar: updatedSiswa.tanggalKeluar,
        userIsActive: updatedSiswa.user.isActive,
        badge,
      },
    });
  } catch (error) {
    console.error('❌ PATCH /api/admin/siswa/[id]/status Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Handle specific errors
    if (error.message === 'Siswa tidak ditemukan') {
      return NextResponse.json(
        { error: error.message, errorType: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (error.message.startsWith('Invalid status')) {
      return NextResponse.json(
        { error: error.message, errorType: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Generic error with detailed message for development
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Failed to update student status',
        errorType: 'INTERNAL_ERROR',
        message: error.message,
        details: isDev ? {
          code: error.code,
          prismaCode: error.code,
          meta: error.meta,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/siswa/[id]/status
 * Get current student status info
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id: siswaId } = params;

    const { prisma } = await import('@/lib/db');

    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        kelas: {
          select: {
            nama: true,
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    const badge = getStudentStatusBadge(siswa.statusSiswa);

    return NextResponse.json({
      success: true,
      data: {
        id: siswa.id,
        nis: siswa.nis,
        name: siswa.user.name,
        kelas: siswa.kelas?.nama,
        statusSiswa: siswa.statusSiswa,
        tanggalKeluar: siswa.tanggalKeluar,
        userIsActive: siswa.user.isActive,
        badge,
      },
    });
  } catch (error) {
    console.error('Error fetching student status:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch student status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
