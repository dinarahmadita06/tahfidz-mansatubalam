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

    const signers = await prisma.adminSignature.findMany({
      where: {
        type: { in: ['SIGNER_1', 'SIGNER_2'] }
      },
      orderBy: { type: 'asc' }
    });

    return NextResponse.json({ signers });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { signers } = body; // Array of { type, jabatan, nama, signatureData, capData, capOpacity, capScale, capOffsetX, capOffsetY }

    if (!Array.isArray(signers)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const results = await Promise.all(
      signers.map(async (signer) => {
        return prisma.adminSignature.upsert({
          where: { type: signer.type },
          update: {
            jabatan: signer.jabatan,
            nama: signer.nama,
            signatureData: signer.signatureData,
            capData: signer.capData || null,
            capOpacity: signer.capOpacity !== undefined ? signer.capOpacity : 0.4,
            capScale: signer.capScale !== undefined ? signer.capScale : 1.0,
            capOffsetX: signer.capOffsetX !== undefined ? signer.capOffsetX : 0,
            capOffsetY: signer.capOffsetY !== undefined ? signer.capOffsetY : 0,
            updatedAt: new Date()
          },
          create: {
            type: signer.type,
            jabatan: signer.jabatan,
            nama: signer.nama,
            signatureData: signer.signatureData,
            capData: signer.capData || null,
            capOpacity: signer.capOpacity !== undefined ? signer.capOpacity : 0.4,
            capScale: signer.capScale !== undefined ? signer.capScale : 1.0,
            capOffsetX: signer.capOffsetX !== undefined ? signer.capOffsetX : 0,
            capOffsetY: signer.capOffsetY !== undefined ? signer.capOffsetY : 0
          }
        });
      })
    );

    return NextResponse.json({ signers: results });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
