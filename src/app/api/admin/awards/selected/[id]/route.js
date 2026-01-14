export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH Update Award Category
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { categoryId } = body;

    if (!categoryId) {
      return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    }

    const recipient = await prisma.awardRecipient.update({
      where: { id },
      data: { categoryId }
    });

    return NextResponse.json({ recipient });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE Remove Award Recipient
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.awardRecipient.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Recipient removed' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
