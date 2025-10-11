import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, tingkat, tahunAjaranId, targetJuz } = body;

    // Validate required fields
    if (!nama || !tingkat || !tahunAjaranId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: tahunAjaranId }
    });

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun ajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create kelas
    const kelas = await prisma.kelas.create({
      data: {
        nama,
        tingkat,
        tahunAjaranId,
        targetJuz: targetJuz || 1
      },
      include: {
        tahunAjaran: {
          select: {
            nama: true,
            semester: true
          }
        },
        _count: {
          select: {
            siswa: true
          }
        }
      }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'KELAS',
      description: `Menambahkan kelas baru ${kelas.nama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        kelasId: kelas.id,
        tahunAjaranId: kelas.tahunAjaranId
      }
    });

    return NextResponse.json(kelas);
  } catch (error) {
    console.error('Error creating kelas:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kelas' },
      { status: 500 }
    );
  }
}
