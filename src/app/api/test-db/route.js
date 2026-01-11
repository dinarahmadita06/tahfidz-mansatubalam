export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    console.log('Testing database connection...');

    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database query successful:', result);

    // Test user count
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);

    // Test find admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@tahfidz.sch.id'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    console.log('Admin user:', adminUser);

    return NextResponse.json({
      status: 'OK',
      database: 'Connected',
      results: {
        queryTest: result,
        totalUsers: userCount,
        adminUser: adminUser
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'ERROR',
      error: error.message,
      code: error.code,
      details: {
        message: error.message,
        code: error.code,
        meta: error.meta
      }
    }, { status: 500 });
  }
}
