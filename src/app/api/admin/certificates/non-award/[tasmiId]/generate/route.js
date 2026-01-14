export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to generate certificate number
// Format: CERT/TASMI/YYYYMMDD/XXXX (X is random/seq)
async function generateCertNumber(type) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = type === 'NON_AWARD' ? 'TASMI' : 'AWARD';
  
  // Find last number today
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

    const { tasmiId } = await params;

    // Check tasmi result
    const tasmi = await prisma.tasmi.findUnique({
      where: { id: tasmiId },
      include: { certificate: true },
    });

    if (!tasmi) {
      return NextResponse.json({ message: 'Data Tasmi tidak ditemukan' }, { status: 404 });
    }

    if (!tasmi.isPassed || !tasmi.assessedAt) {
      return NextResponse.json({ message: 'Tasmi belum lulus atau belum dinilai' }, { status: 400 });
    }

    if (tasmi.certificate) {
      return NextResponse.json({ message: 'Sertifikat sudah pernah dibuat', certificate: tasmi.certificate });
    }

    // Find default template for NON_AWARD
    const template = await prisma.certificateTemplate.findFirst({
      where: { type: 'NON_AWARD', isDefault: true, isActive: true },
    });

    const certNumber = await generateCertNumber('NON_AWARD');

    const certificate = await prisma.certificate.create({
      data: {
        type: 'NON_AWARD',
        tasmiId: tasmiId,
        certificateNumber: certNumber,
        generatedById: session.user.id,
        templateId: template?.id || null,
      },
    });

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error('GENERATE NON-AWARD CERT ERROR:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
