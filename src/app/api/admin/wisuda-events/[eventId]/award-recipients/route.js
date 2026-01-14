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
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const whereClause = { eventId };
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const recipients = await prisma.awardRecipient.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        category: true,
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recipients });
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
    const { categoryId, studentId, sourceTasmiId } = body;

    if (!categoryId || !studentId) {
      return NextResponse.json({ message: 'Category and Student are required' }, { status: 400 });
    }

    // Check quota
    const category = await prisma.awardCategory.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { recipients: true } } },
    });

    if (category._count.recipients >= category.quota) {
      return NextResponse.json({ message: 'Kuota kategori ini sudah penuh' }, { status: 400 });
    }

    // Check if student already in this event for this category
    const existing = await prisma.awardRecipient.findFirst({
      where: { eventId, categoryId, studentId },
    });

    if (existing) {
      return NextResponse.json({ message: 'Siswa sudah terdaftar di kategori ini' }, { status: 400 });
    }

    const recipient = await prisma.awardRecipient.create({
      data: {
        eventId,
        categoryId,
        studentId,
        sourceTasmiId,
      },
    });

    return NextResponse.json({ recipient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
