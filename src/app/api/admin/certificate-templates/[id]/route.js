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

    const { id } = await params;
    const body = await request.json();
    const { name, type, htmlTemplate, isDefault, isActive } = body;

    // If isDefault is true, set others of same type to false
    if (isDefault) {
      const currentTemplate = await prisma.certificateTemplate.findUnique({ where: { id } });
      await prisma.certificateTemplate.updateMany({
        where: { type: type || currentTemplate.type, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const template = await prisma.certificateTemplate.update({
      where: { id },
      data: {
        name,
        type,
        htmlTemplate,
        isDefault,
        isActive,
      },
    });

    return NextResponse.json({ template });
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
    
    // Check if used by certificates
    const usage = await prisma.certificate.count({ where: { templateId: id } });
    if (usage > 0) {
      return NextResponse.json({ message: 'Template sedang digunakan oleh sertifikat' }, { status: 400 });
    }

    await prisma.certificateTemplate.delete({ where: { id } });

    return NextResponse.json({ message: 'Template berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
