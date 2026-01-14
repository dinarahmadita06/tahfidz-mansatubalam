export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Support partial updates
    const updateData = {};
    if (body.categoryName !== undefined) updateData.categoryName = body.categoryName;
    if (body.groupName !== undefined) updateData.groupName = body.groupName;
    if (body.reward !== undefined) updateData.reward = body.reward;
    // PENTING: Jangan gunakan filter isActive di query level jika client belum terupdate
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const category = await prisma.awardCategory.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
