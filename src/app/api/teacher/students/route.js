import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const session = await auth();

    // 1. Validasi role TEACHER
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized. Hanya Guru yang dapat menambahkan siswa.' }, { status: 401 });
    }

    const teacherUserId = session.user.id;
    const body = await request.json();
    const { student, parentMode, existingParentId, parent } = body;

    // 2. Validasi input dasar (Password now optional for standard generation)
    if (!student || !student.name || !student.nis || !student.kelasId) {
      return NextResponse.json({ error: 'Data siswa tidak lengkap' }, { status: 400 });
    }

    if (parentMode === 'NEW' && (!parent || !parent.name || !parent.phone || !parent.email || !parent.gender)) {
      return NextResponse.json({ error: 'Data orang tua baru tidak lengkap (Nama, No HP, Email, dan Jenis Kelamin wajib diisi)' }, { status: 400 });
    }

    if (parentMode === 'EXISTING' && !existingParentId) {
      return NextResponse.json({ error: 'ID orang tua harus dipilih' }, { status: 400 });
    }

    // 3. Cek apakah Guru mengampu kelas tersebut
    // GuruId di User table berbeda dengan Guru table ID. Kita butuh Guru ID.
    const guru = await prisma.guru.findUnique({
      where: { userId: teacherUserId },
      select: { id: true }
    });

    if (!guru) {
      return NextResponse.json({ error: 'Data Guru tidak ditemukan' }, { status: 404 });
    }

    const isAssigned = await prisma.guruKelas.findFirst({
      where: {
        guruId: guru.id,
        kelasId: student.kelasId,
        isActive: true
      }
    });

    if (!isAssigned) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk menambahkan siswa ke kelas ini.' }, { status: 403 });
    }

    // 4. Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      // a. Determine Student Password (Standard: NISN)
      let studentPassword = student.password;
      if (!studentPassword || studentPassword.trim() === '') {
        if (!student.nisn || student.nisn.trim().length !== 10) {
          throw new Error('NISN wajib 10 digit untuk generate password default');
        }
        studentPassword = student.nisn.trim();
      }

      // b. Create Student User
      const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);
      const studentUser = await tx.user.create({
        data: {
          name: student.name,
          email: student.email,
          password: hashedStudentPassword,
          role: 'SISWA',
          isActive: true, // Akun aktif tapi status siswa pending validasi
        }
      });

      // c. Create Student Data
      const studentData = await tx.siswa.create({
        data: {
          userId: studentUser.id,
          nis: student.nis,
          nisn: student.nisn || null,
          kelasId: student.kelasId,
          tahunAjaranMasukId: student.tahunAjaranMasukId || null,
          kelasAngkatan: student.kelasAngkatan || null,
          jenisKelamin: student.gender,
          tanggalLahir: student.birthDate ? new Date(student.birthDate) : null,
          status: 'pending', // Menunggu validasi admin sesuai sistem existing
        }
      });

      // d. Handle Parent
      let parentId;
      let finalParentPassword = '';

      if (parentMode === 'EXISTING') {
        const existingParent = await tx.orangTua.findUnique({
          where: { id: existingParentId }
        });
        if (!existingParent) throw new Error('Orang tua yang dipilih tidak ditemukan');
        parentId = existingParent.id;
      } else {
        // Determine Parent Password (Standard: NISN-YYYY)
        let parentPassword = parent.password;
        if (!parentPassword || parentPassword.trim() === '') {
          if (!student.nisn || student.nisn.trim().length !== 10) {
            throw new Error('NISN wajib 10 digit untuk generate password wali');
          }
          const baseNISN = student.nisn.trim();
          if (student.birthDate) {
            const date = new Date(student.birthDate);
            if (!isNaN(date.getTime())) {
              parentPassword = `${baseNISN}-${date.getFullYear()}`;
            } else {
              parentPassword = baseNISN;
            }
          } else {
            parentPassword = baseNISN;
          }
        }
        finalParentPassword = parentPassword;

        // Create New Parent User
        const hashedParentPassword = await bcrypt.hash(parentPassword, 10);
        const parentUser = await tx.user.create({
          data: {
            name: parent.name,
            email: parent.email,
            password: hashedParentPassword,
            role: 'ORANG_TUA',
            isActive: true,
          }
        });

        // Create New Parent Data
        const newParent = await tx.orangTua.create({
          data: {
            userId: parentUser.id,
            noTelepon: parent.phone,
            jenisKelamin: parent.gender,
            status: 'approved', // Wali biasanya langsung approved jika dibuat guru/admin
          }
        });
        parentId = newParent.id;
      }

      // e. Create Relation (OrangTuaSiswa)
      try {
        await tx.orangTuaSiswa.create({
          data: {
            siswaId: studentData.id,
            orangTuaId: parentId,
            hubungan: parent?.relationType || 'Orang Tua',
          }
        });
      } catch (relError) {
        console.error('❌ [Teacher API] Failed to create OrangTuaSiswa relation:', relError);
        throw new Error('Gagal menghubungkan siswa dengan orang tua');
      }

      return {
        student: {
          id: studentData.id,
          name: studentUser.name,
          email: studentUser.email,
          password: studentPassword // Return for success display if needed
        },
        parent: {
          id: parentId,
          email: parentMode === 'NEW' ? parent.email : null,
          password: finalParentPassword // Return for success display if needed
        }
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Siswa dan Orang Tua berhasil didaftarkan',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [Teacher API Error]:', error);
    
    // Return specific status code for known errors
    if (error.message === 'Orang tua yang dipilih tidak ditemukan') {
      return NextResponse.json({ 
        error: 'Relasi tidak ditemukan',
        message: error.message
      }, { status: 404 });
    }

    if (error.message === 'Gagal menghubungkan siswa dengan orang tua') {
      return NextResponse.json({ 
        error: 'Bad Request',
        message: error.message
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat memproses data',
      message: error.message,
      details: error.meta || null
    }, { status: 500 });
  }
}
