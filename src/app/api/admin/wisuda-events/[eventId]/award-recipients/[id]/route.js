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

    const { id } = await params;

    const recipient = await prisma.awardRecipient.findUnique({
      where: { id },
      select: {
        id: true,
        student: {
          select: {
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        event: true,
        category: {
          select: {
            groupName: true,
            categoryName: true,
            reward: true,
            template: true,
          },
        },
        certificate: true,
      },
    });

    if (!recipient) {
      return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });
    }

    // Find template
    let template = recipient.category.template;
    if (!template) {
      template = await prisma.certificateTemplate.findFirst({
        where: { type: 'AWARD', isDefault: true, isActive: true },
      });
    }

    if (!template) {
      return NextResponse.json({ message: 'Template tidak ditemukan' }, { status: 404 });
    }

    // Prepare placeholders data
    const data = {
      nama: recipient.student?.user?.name || '-',
      nisn: recipient.student?.nisn || '-',
      kelas: recipient.student?.kelas?.nama || '-',
      eventName: recipient.event?.name || '-',
      eventDate: recipient.event?.date ? new Date(recipient.event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
      groupAward: recipient.category?.groupName || '-',
      categoryAward: recipient.category?.categoryName || '-',
      reward: recipient.category?.reward || '-',
      certificateNumber: recipient.certificate?.certificateNumber || 'DRAFT',
    };

    return NextResponse.json({ data, htmlTemplate: template.htmlTemplate });
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

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'approve') {
      const recipient = await prisma.awardRecipient.update({
        where: { id },
        data: {
          approvedBy: session.user.id,
          approvedAt: new Date(),
        },
      });
      return NextResponse.json({ recipient });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
