export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.wisudaEvent.findMany({
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { recipients: true, categories: true },
        },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, date, period, isActive } = body;

    if (!name || !date || !period) {
      return NextResponse.json({ message: 'Field wajib diisi' }, { status: 400 });
    }

    const event = await prisma.wisudaEvent.create({
      data: {
        name,
        date: new Date(date),
        period,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
