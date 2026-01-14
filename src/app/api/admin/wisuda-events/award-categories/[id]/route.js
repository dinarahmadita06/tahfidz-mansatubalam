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

    const { id } = await params; // category id
    const body = await request.json();
    const { groupName, categoryName, quota, reward, templateId } = body;

    const category = await prisma.awardCategory.update({
      where: { id },
      data: {
        groupName,
        categoryName,
        quota: quota ? parseInt(quota) : undefined,
        reward,
        templateId,
      },
    });

    return NextResponse.json({ category });
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

    const { id } = await params;
    
    // Check for recipients
    const count = await prisma.awardRecipient.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json({ message: 'Kategori tidak bisa dihapus karena memiliki data peserta' }, { status: 400 });
    }

    await prisma.awardCategory.delete({ where: { id } });

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
