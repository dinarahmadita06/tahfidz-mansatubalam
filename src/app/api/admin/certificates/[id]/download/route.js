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

    const { id } = await params; // certificate id

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        template: true,
        tasmi: {
          include: {
            siswa: {
              include: {
                user: { select: { name: true, nisn: true } },
                kelas: { select: { nama: true } },
              },
            },
            guruPenguji: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        awardRecipient: {
          include: {
            student: {
              include: {
                user: { select: { name: true, nisn: true } },
                kelas: { select: { nama: true } },
              },
            },
            event: true,
            category: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
    }

    // Prepare data for generation
    let data = {};
    if (certificate.type === 'NON_AWARD') {
      data = {
        nama: certificate.tasmi.siswa.user.name,
        nisn: certificate.tasmi.siswa.user.nisn || '-',
        kelas: certificate.tasmi.siswa.kelas?.nama || '-',
        tanggalUjian: certificate.tasmi.tanggalUjian ? new Date(certificate.tasmi.tanggalUjian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
        penguji: certificate.tasmi.guruPenguji?.user?.name || '-',
        juz: certificate.tasmi.juzYangDitasmi,
        predicate: certificate.tasmi.predikat || '-',
        certificateNumber: certificate.certificateNumber,
      };
    } else {
      data = {
        nama: certificate.awardRecipient.student.user.name,
        nisn: certificate.awardRecipient.student.user.nisn || '-',
        kelas: certificate.awardRecipient.student.kelas?.nama || '-',
        eventName: certificate.awardRecipient.event.name,
        eventDate: new Date(certificate.awardRecipient.event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        groupAward: certificate.awardRecipient.category.groupName,
        categoryAward: certificate.awardRecipient.category.categoryName,
        reward: certificate.awardRecipient.category.reward || '-',
        certificateNumber: certificate.certificateNumber,
      };
    }

    return NextResponse.json({ 
      data, 
      htmlTemplate: certificate.template?.htmlTemplate || '',
      type: certificate.type
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
