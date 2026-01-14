export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;

    const categories = await prisma.awardCategory.findMany({
      where: { eventId },
      include: {
        template: { select: { name: true } },
        _count: { select: { recipients: true } },
      },
      orderBy: { groupName: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const { groupName, categoryName, quota, reward, templateId } = body;

    if (!groupName || !categoryName || !quota) {
      return NextResponse.json({ message: 'Field wajib diisi' }, { status: 400 });
    }

    const category = await prisma.awardCategory.create({
      data: {
        eventId,
        groupName,
        categoryName,
        quota: parseInt(quota),
        reward,
        templateId,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
