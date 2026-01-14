export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function generateCertNumber(type) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = type === 'NON_AWARD' ? 'TASMI' : 'AWARD';
  
  const countToday = await prisma.certificate.count({
    where: {
      certificateNumber: {
        startsWith: `CERT/${prefix}/${dateStr}`,
      },
    },
  });
  
  const seq = (countToday + 1).toString().padStart(4, '0');
  return `CERT/${prefix}/${dateStr}/${seq}`;
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const recipient = await prisma.awardRecipient.findUnique({
      where: { id },
      include: {
        certificate: true,
        category: true,
      },
    });

    if (!recipient) {
      return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });
    }

    if (!recipient.approvedAt) {
      return NextResponse.json({ message: 'Recipient must be approved first' }, { status: 400 });
    }

    if (recipient.certificate) {
      return NextResponse.json({ message: 'Certificate already generated', certificate: recipient.certificate });
    }

    const templateId = recipient.category.templateId;
    let template = null;
    if (templateId) {
      template = await prisma.certificateTemplate.findUnique({ where: { id: templateId } });
    }
    
    if (!template) {
      template = await prisma.certificateTemplate.findFirst({
        where: { type: 'AWARD', isDefault: true, isActive: true },
      });
    }

    const certNumber = await generateCertNumber('AWARD');

    const certificate = await prisma.certificate.create({
      data: {
        type: 'AWARD',
        awardRecipientId: id,
        certificateNumber: certNumber,
        generatedById: session.user.id,
        templateId: template?.id || null,
      },
    });

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error('GENERATE AWARD CERT ERROR:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
