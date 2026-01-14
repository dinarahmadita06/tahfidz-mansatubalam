export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET Selected Award Recipients
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const query = searchParams.get('query');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (query) {
      where.student = {
        user: { name: { contains: query, mode: 'insensitive' } }
      };
    }

    const selected = await prisma.awardRecipient.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          }
        },
        category: true,
        certificate: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ selected });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST Create new Award Recipient
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, categoryId, sourceTasmiId } = body;

    if (!studentId || !categoryId) {
      return NextResponse.json({ message: 'Student and Category are required' }, { status: 400 });
    }

    // Find first event to link to (since we are simplifying UX and removing event selection)
    const event = await prisma.wisudaEvent.findFirst({
      orderBy: { date: 'desc' }
    });

    if (!event) {
      return NextResponse.json({ message: 'Belum ada event wisuda aktif. Silakan buat event terlebih dahulu di database.' }, { status: 400 });
    }

    const recipient = await prisma.awardRecipient.create({
      data: {
        eventId: event.id,
        studentId,
        categoryId,
        sourceTasmiId,
        approvedAt: new Date(), // Auto-approve for simplified flow
        approvedBy: session.user.id
      }
    });

    return NextResponse.json({ recipient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
