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

    const templates = await prisma.certificateTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ templates });
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
    const { name, type, htmlTemplate, isDefault } = body;

    if (!name || !type || !htmlTemplate) {
      return NextResponse.json({ message: 'Field wajib diisi' }, { status: 400 });
    }

    // If isDefault is true, set others of same type to false
    if (isDefault) {
      await prisma.certificateTemplate.updateMany({
        where: { type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.certificateTemplate.create({
      data: { name, type, htmlTemplate, isDefault: !!isDefault },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
