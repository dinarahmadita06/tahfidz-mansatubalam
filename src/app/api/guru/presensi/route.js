import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const tanggal = searchParams.get('tanggal');

    if (!kelasId || !tanggal) {
      return NextResponse.json(
        { message: 'kelasId dan tanggal harus diisi' },
        { status: 400 }
      );
    }

    // Parse tanggal dan set ke awal dan akhir hari
    const startDate = new Date(tanggal);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(tanggal);
    endDate.setHours(23, 59, 59, 999);

    // Fetch siswa di kelas tersebut
    const siswa = await prisma.siswa.findMany({
      where: {
        kelasId: kelasId,
        status: 'approved',
      },
      select: {
        id: true,
      },
    });

    const siswaIds = siswa.map((s) => s.id);

    // Fetch presensi untuk siswa di kelas tersebut pada tanggal yang dipilih
    const presensi = await prisma.presensi.findMany({
      where: {
        siswaId: {
          in: siswaIds,
        },
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ presensi });
  } catch (error) {
    console.error('Error fetching presensi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      console.log('[PRESENSI POST] Session not found');
      return NextResponse.json(
        { message: 'Sesi guru tidak ditemukan' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'GURU') {
      console.log('[PRESENSI POST] User role is not GURU:', session.user.role);
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 403 }
      );
    }

    if (!session.user.guruId) {
      console.log('[PRESENSI POST] Guru ID not found in session:', session.user);
      return NextResponse.json(
        { message: 'Guru ID tidak ditemukan di session' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { kelasId, tanggal, presensi } = body;

    if (!kelasId || !tanggal || !presensi || !Array.isArray(presensi)) {
      console.log('[PRESENSI POST] Incomplete data:', { kelasId, tanggal, presensi: !!presensi });
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const guruId = session.user.guruId;

    // Verify guru exists
    const guru = await prisma.guru.findUnique({
      where: { id: guruId },
    });

    if (!guru) {
      console.log('[PRESENSI POST] Guru not found:', guruId);
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan di database' },
        { status: 404 }
      );
    }

    console.log('[PRESENSI POST] Saving presensi for guru:', guruId, 'kelas:', kelasId, 'tanggal:', tanggal);

    // Parse tanggal
    const presensiDate = new Date(tanggal);
    presensiDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    // Process each presensi record
    const results = [];

    for (const item of presensi) {
      const { siswaId, status, keterangan } = item;

      if (!siswaId || !status) {
        continue;
      }

      // Check if presensi already exists for this siswa on this date
      const existingPresensi = await prisma.presensi.findFirst({
        where: {
          siswaId: siswaId,
          tanggal: {
            gte: new Date(presensiDate.setHours(0, 0, 0, 0)),
            lt: new Date(presensiDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (existingPresensi) {
        // Update existing presensi
        const updated = await prisma.presensi.update({
          where: { id: existingPresensi.id },
          data: {
            status: status,
            keterangan: keterangan || null,
            guruId: guruId,
            updatedAt: new Date(),
          },
        });
        results.push(updated);
      } else {
        // Create new presensi
        const created = await prisma.presensi.create({
          data: {
            siswaId: siswaId,
            guruId: guruId,
            tanggal: new Date(tanggal),
            status: status,
            keterangan: keterangan || null,
          },
        });
        results.push(created);
      }
    }

    console.log('[PRESENSI POST] Successfully saved', results.length, 'presensi records');

    return NextResponse.json({
      message: 'Presensi berhasil disimpan',
      count: results.length,
      presensi: results,
    });
  } catch (error) {
    console.error('[PRESENSI POST] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
