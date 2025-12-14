import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Ambil semua target hafalan
export async function GET(request) {
  try {
    // Ambil semua kelas dengan relasi tahun ajaran
    const kelas = await prisma.kelas.findMany({
      include: {
        tahunAjaran: true,
        _count: {
          select: { siswa: true }
        }
      },
      orderBy: [
        { tahunAjaran: { tanggalMulai: 'desc' } },
        { tingkat: 'asc' },
        { nama: 'asc' }
      ]
    });

    // Ambil tahun ajaran aktif
    const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    // Format data untuk tabel
    const targets = kelas.map(k => ({
      id: k.id,
      tahunAjaran: k.tahunAjaran.nama,
      namaKelas: k.nama,
      tingkat: k.tingkat,
      targetSekolah: k.targetJuz || 2, // Default 2 juz
      targetKelas: k.targetJuz || 2,
      jumlahSiswa: k._count.siswa,
      tahunAjaranId: k.tahunAjaranId
    }));

    // Hitung statistik
    const totalKelas = kelas.length;
    const rataRataTarget = targets.length > 0
      ? (targets.reduce((sum, t) => sum + t.targetKelas, 0) / targets.length).toFixed(1)
      : 0;

    const statistics = {
      totalKelas,
      tahunAjaranAktif: tahunAjaranAktif?.nama || '-',
      rataRataTarget
    };

    return NextResponse.json({
      success: true,
      data: {
        targets,
        statistics
      }
    });

  } catch (error) {
    console.error('Error fetching target hafalan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data target hafalan' },
      { status: 500 }
    );
  }
}

// PUT - Update target hafalan kelas
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, targetKelas } = body;

    if (!id || targetKelas === undefined) {
      return NextResponse.json(
        { success: false, message: 'ID dan target kelas harus diisi' },
        { status: 400 }
      );
    }

    // Validasi target minimal 0.5 juz, maksimal 30 juz
    if (targetKelas < 0.5 || targetKelas > 30) {
      return NextResponse.json(
        { success: false, message: 'Target hafalan harus antara 0.5 - 30 juz' },
        { status: 400 }
      );
    }

    // Update target juz di kelas
    const updatedKelas = await prisma.kelas.update({
      where: { id },
      data: {
        targetJuz: Math.round(targetKelas) // Simpan sebagai integer
      },
      include: {
        tahunAjaran: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil diperbarui',
      data: updatedKelas
    });

  } catch (error) {
    console.error('Error updating target hafalan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui target hafalan' },
      { status: 500 }
    );
  }
}

// POST - Buat target hafalan baru (untuk kelas tertentu atau per siswa)
export async function POST(request) {
  try {
    const body = await request.json();
    const { kelasId, siswaId, targetJuz, bulan, tahun, deadline, keterangan } = body;

    if (!targetJuz || !bulan || !tahun) {
      return NextResponse.json(
        { success: false, message: 'Target juz, bulan, dan tahun harus diisi' },
        { status: 400 }
      );
    }

    // Buat target hafalan di tabel TargetHafalan
    const targetHafalan = await prisma.targetHafalan.create({
      data: {
        kelasId: kelasId || null,
        siswaId: siswaId || null,
        targetJuz: parseInt(targetJuz),
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
        deadline: deadline ? new Date(deadline) : null,
        keterangan: keterangan || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil ditambahkan',
      data: targetHafalan
    });

  } catch (error) {
    console.error('Error creating target hafalan:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan target hafalan' },
      { status: 500 }
    );
  }
}

// PATCH - Update target hafalan sekolah global (schoolTarget)
export async function PATCH(request) {
  try {
    const url = new URL(request.url);
    
    // Check if this is for school target update
    if (url.pathname.includes('/school-target')) {
      const body = await request.json();
      const { schoolTarget } = body;

      if (schoolTarget === undefined) {
        return NextResponse.json(
          { success: false, message: 'Target sekolah harus diisi' },
          { status: 400 }
        );
      }

      // Validasi target minimal 0.5 juz, maksimal 30 juz
      if (schoolTarget < 0.5 || schoolTarget > 30) {
        return NextResponse.json(
          { success: false, message: 'Target hafalan harus antara 0.5 - 30 juz' },
          { status: 400 }
        );
      }

      // Update schoolTarget di semua record TargetHafalan untuk menyimpan nilai global
      // (Opsional: Bisa disimpan di tabel terpisah untuk konfigurasi global)
      // Untuk saat ini, kita gunakan TargetHafalan sebagai storage
      
      // Update atau create record untuk menyimpan school target global
      const result = await prisma.targetHafalan.upsert({
        where: { id: 'school-target-global' }, // ID khusus untuk record global
        update: {
          targetJuz: Math.round(schoolTarget)
        },
        create: {
          id: 'school-target-global',
          targetJuz: Math.round(schoolTarget),
          bulan: new Date().getMonth() + 1,
          tahun: new Date().getFullYear()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Target hafalan sekolah berhasil diperbarui',
        data: result
      });
    }
  } catch (error) {
    console.error('Error updating school target:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui target sekolah' },
      { status: 500 }
    );
  }
}
