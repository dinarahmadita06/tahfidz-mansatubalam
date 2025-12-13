import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we have cached data
    const cacheKey = 'guru-list';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached guru data');
      return NextResponse.json(cachedData);
    }

    console.log('Fetching fresh guru data from database');

    const guru = await prisma.guru.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
          }
        },
        guruKelas: {
          include: {
            kelas: {
              select: {
                id: true,
                nama: true
              }
            }
          }
        },
        _count: {
          select: {
            guruKelas: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    // Cache the response
    setCachedData(cacheKey, guru);

    return NextResponse.json(guru);
  } catch (error) {
    console.error('Error fetching guru:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guru' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, nip, jenisKelamin, noHP, alamat } = await request.json();

    // Validasi input
    if (!name || !email || !password || !jenisKelamin) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Cek email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user dan guru
    const guru = await prisma.guru.create({
      data: {
        nip,
        jenisKelamin,
        noHP,
        alamat,
        user: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: 'GURU'
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
      module: 'GURU',
      description: `Menambahkan guru baru ${guru.user.name} (NIP: ${guru.nip || '-'})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        guruId: guru.id
      }
    });

    // Invalidate cache for guru list
    invalidateCache('guru-list');

    return NextResponse.json(guru, { status: 201 });
  } catch (error) {
    console.error('Error creating guru:', error);
    return NextResponse.json(
      { error: 'Failed to create guru' },
      { status: 500 }
    );
  }
}