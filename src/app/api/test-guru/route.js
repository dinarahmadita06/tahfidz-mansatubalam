import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    console.log('🔍 Testing guru query...');

    // Test 1: Count users with GURU role
    const guruUserCount = await prisma.user.count({
      where: { role: 'GURU' }
    });
    console.log('✅ Guru users count:', guruUserCount);

    // Test 2: Count guru records
    const guruRecordCount = await prisma.guru.count();
    console.log('✅ Guru records count:', guruRecordCount);

    // Test 3: Get all guru WITHOUT relations
    const guruSimple = await prisma.guru.findMany({
      include: {
        user: true
      }
    });
    console.log('✅ Guru simple query count:', guruSimple.length);

    // Test 4: Get all guru WITH relations (like the main API)
    const guruFull = await prisma.guru.findMany({
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
    console.log('✅ Guru full query count:', guruFull.length);

    return NextResponse.json({
      success: true,
      counts: {
        guruUsers: guruUserCount,
        guruRecords: guruRecordCount,
        simpleQuery: guruSimple.length,
        fullQuery: guruFull.length
      },
      data: guruFull,
      message: 'All tests passed'
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
