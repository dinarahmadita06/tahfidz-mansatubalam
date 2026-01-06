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

    // 2. Validasi input dasar
    if (!student || !student.name || !student.nis || !student.kelasId || !student.password) {
      return NextResponse.json({ error: 'Data siswa tidak lengkap' }, { status: 400 });
    }

    if (parentMode === 'NEW' && (!parent || !parent.name || !parent.phone || !parent.email || !parent.password || !parent.nik || !parent.gender)) {
      return NextResponse.json({ error: 'Data orang tua baru tidak lengkap (Nama, No HP, Email, Password, NIK, dan Jenis Kelamin wajib diisi)' }, { status: 400 });
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
      // a. Create Student User
      const hashedStudentPassword = await bcrypt.hash(student.password, 10);
      const studentUser = await tx.user.create({
        data: {
          name: student.name,
          email: student.email,
          password: hashedStudentPassword,
          role: 'SISWA',
          isActive: true, // Akun aktif tapi status siswa pending validasi
        }
      });

      // b. Create Student Data
      const studentData = await tx.siswa.create({
        data: {
          userId: studentUser.id,
          nis: student.nis,
          nisn: student.nisn || null,
          kelasId: student.kelasId,
          jenisKelamin: student.gender,
          tanggalLahir: student.birthDate ? new Date(student.birthDate) : null,
          status: 'pending', // Menunggu validasi admin sesuai sistem existing
        }
      });

      // c. Handle Parent
      let parentId;
      if (parentMode === 'EXISTING') {
        const existingParent = await tx.orangTua.findUnique({
          where: { id: existingParentId }
        });
        if (!existingParent) throw new Error('Orang tua yang dipilih tidak ditemukan');
        parentId = existingParent.id;
      } else {
        // Create New Parent User
        const hashedParentPassword = await bcrypt.hash(parent.password, 10);
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
            nik: parent.nik,
            noTelepon: parent.phone,
            jenisKelamin: parent.gender,
            status: 'approved', // Wali biasanya langsung approved jika dibuat guru/admin
          }
        });
        parentId = newParent.id;
      }

      // d. Create Relation (OrangTuaSiswa)
      await tx.orangTuaSiswa.create({
        data: {
          siswaId: studentData.id,
          orangTuaId: parentId,
          hubungan: parent.relationType || 'Orang Tua',
        }
      });

      return {
        student: {
          id: studentData.id,
          name: studentUser.name,
          email: studentUser.email
        },
        parent: {
          id: parentId,
          email: parentMode === 'NEW' ? parent.email : null
        }
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Siswa dan Orang Tua berhasil didaftarkan',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error in teacher add student:', error);
    return NextResponse.json({ 
      error: error.message || 'Terjadi kesalahan saat memproses data',
      details: error.meta || null
    }, { status: 500 });
  }
}
