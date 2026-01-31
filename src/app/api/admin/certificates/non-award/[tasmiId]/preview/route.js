export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCertificate } from '@/lib/certificate-generator';
import { getActiveTemplateBuffer } from '@/lib/template-service';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tasmiId } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';
    const customDate = searchParams.get('date');

    const tasmi = await prisma.tasmi.findUnique({
      where: { id: tasmiId },
      include: {
        siswa: {
          select: {
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        guruPenguji: {
          include: { user: { select: { name: true } } },
        },
        certificate: true,
      },
    });

    if (!tasmi) {
      return NextResponse.json({ message: 'Data Tasmi tidak ditemukan' }, { status: 404 });
    }

    // Fetch Signers
    const signers = await prisma.adminSignature.findMany({
      where: { type: { in: ['SIGNER_1', 'SIGNER_2'] } }
    });
    const s1 = signers.find(s => s.type === 'SIGNER_1');
    const s2 = signers.find(s => s.type === 'SIGNER_2');

    // Get active template from database
    let templateBuffer;
    try {
      templateBuffer = await getActiveTemplateBuffer();
    } catch (error) {
      console.error('Failed to load template:', error);
      return NextResponse.json({ 
        message: 'Template sertifikat tidak ditemukan. Silakan upload template terlebih dahulu.',
        error: error.message 
      }, { status: 400 });
    }

    // Format date
    const formatDate = (date) => {
      const d = new Date(date);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    // Prepare certificate data
    const certificateData = {
      nama_siswa: tasmi.siswa.user.name,
      juz: tasmi.juzYangDitasmi, // Correct field name from database
      tanggal_cetak: customDate ? formatDate(new Date(customDate)) : formatDate(tasmi.tanggalUjian || new Date()),
      tempat: 'Bandar Lampung',
      jabatan_kiri: s1?.position || 'Kepala MAN 1 Bandar Lampung',
      nama_pejabat_kiri: s1?.nama || 'Lukman Hakim, S.Pd., M.M',
      ttd_kepala_man: s1?.signatureData || null,
      cap_kepala_man: s1?.capData || null,
      cap_kepala_man_scale: s1?.capScale || 1.0,
      cap_kepala_man_offsetX: s1?.capOffsetX || 0,
      cap_kepala_man_offsetY: s1?.capOffsetY || 0,
      cap_kepala_man_opacity: s1?.capOpacity || 0.4,
      jabatan_kanan: s2?.position || 'Sekretaris Asrama MAN 1 Bandar Lampung',
      nama_pejabat_kanan: s2?.nama || 'Siti Rowiyah, M.Pd',
      ttd_ketua_asrama: s2?.signatureData || null,
      cap_ketua_asrama: s2?.capData || null,
      cap_ketua_asrama_scale: s2?.capScale || 1.0,
      cap_ketua_asrama_offsetX: s2?.capOffsetX || 0,
      cap_ketua_asrama_offsetY: s2?.capOffsetY || 0,
      cap_ketua_asrama_opacity: s2?.capOpacity || 0.4
    };

    // 🐛 Debug: Log data JUZ yang diambil dari database
    console.log(`[Certificate Preview] tasmiId=${tasmiId}, juzYangDitasmi="${tasmi.juzYangDitasmi}", nama="${tasmi.siswa.user.name}"`);

    // Generate certificate using template
    const pdfBytes = await generateCertificate(templateBuffer, 'A4', certificateData);

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="Sertifikat_${tasmi.siswa.user.name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ message: 'Gagal membuat sertifikat', error: error.message }, { status: 500 });
  }
}
