import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

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
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { kelasId, tanggal, guruId, presensi } = body;

    if (!kelasId || !tanggal || !guruId || !presensi || !Array.isArray(presensi)) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Verify guru exists
    const guru = await prisma.guru.findUnique({
      where: { id: guruId },
    });

    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({
      message: 'Presensi berhasil disimpan',
      count: results.length,
      presensi: results,
    });
  } catch (error) {
    console.error('Error saving presensi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
