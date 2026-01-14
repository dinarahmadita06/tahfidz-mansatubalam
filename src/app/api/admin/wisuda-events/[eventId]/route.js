export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { eventId: id } = await params;
    const body = await request.json();
    const { name, date, period, isActive } = body;

    const event = await prisma.wisudaEvent.update({
      where: { id },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        period,
        isActive,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { eventId: id } = await params;
    
    // Check for recipients
    const count = await prisma.awardRecipient.count({ where: { eventId: id } });
    if (count > 0) {
      return NextResponse.json({ message: 'Event tidak bisa dihapus karena memiliki data peserta' }, { status: 400 });
    }

    await prisma.wisudaEvent.delete({ where: { id } });

    return NextResponse.json({ message: 'Event berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
