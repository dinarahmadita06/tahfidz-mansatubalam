export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.awardCategory.findMany({
      orderBy: { categoryName: 'asc' }
    });

    // Filter manual di level aplikasi karena Prisma Client terkunci
    const activeCategories = categories.filter(cat => cat.isActive !== false);

    return NextResponse.json({ categories: activeCategories });
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
    const { categoryName, groupName, reward } = body;

    if (!categoryName) {
      return NextResponse.json({ message: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    // Workaround for stale Prisma Client on Windows
    // Find an existing event to satisfy the required relation until server restart
    const event = await prisma.wisudaEvent.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!event) {
      return NextResponse.json({ 
        message: 'Tidak ada event wisuda ditemukan. Prisma Client memerlukan setidaknya satu event untuk membuat kategori (Stale Client Workaround).' 
      }, { status: 400 });
    }

    const category = await prisma.awardCategory.create({
      data: {
        categoryName,
        groupName,
        reward,
        isActive: true,
        quota: 0,
        eventId: event.id
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
