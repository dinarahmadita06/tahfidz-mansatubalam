import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username required'
      }, { status: 400 });
    }

    const results = {
      siswa: null,
      orangTua: null
    };

    // Cari siswa
    const siswaUser = await prisma.user.findFirst({
      where: {
        username: username,
        role: 'SISWA'
      },
      include: {
        siswa: true
      }
    });

    // Cari orang tua
    const orangTuaUser = await prisma.user.findFirst({
      where: {
        username: username,
        role: 'ORANG_TUA'
      },
      include: {
        orangTua: {
          include: {
            orangTuaSiswa: {
              include: {
                siswa: true
              }
            }
          }
        }
      }
    });

    if (siswaUser?.siswa?.tanggalLahir) {
      const tanggalLahir = new Date(siswaUser.siswa.tanggalLahir);
      const passwordFormat = tanggalLahir.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const isValid = await bcrypt.compare(passwordFormat, siswaUser.password);
      
      results.siswa = {
        id: siswaUser.id,
        name: siswaUser.name,
        username: siswaUser.username,
        tanggalLahir: siswaUser.siswa.tanggalLahir,
        expectedPassword: passwordFormat,
        currentPasswordValid: isValid,
        fixed: false
      };

      if (!isValid) {
        const hashedPassword = await bcrypt.hash(passwordFormat, 10);
        await prisma.user.update({
          where: { id: siswaUser.id },
          data: { password: hashedPassword }
        });
        results.siswa.fixed = true;
      }
    }

    if (orangTuaUser) {
      const siswaRelation = orangTuaUser.orangTua?.orangTuaSiswa?.[0];
      if (siswaRelation?.siswa?.tanggalLahir) {
        const tanggalLahir = new Date(siswaRelation.siswa.tanggalLahir);
        const day = String(tanggalLahir.getDate()).padStart(2, '0');
        const month = String(tanggalLahir.getMonth() + 1).padStart(2, '0');
        const year = tanggalLahir.getFullYear();
        const passwordFormat = `${day}${month}${year}`; // DDMMYYYY
        
        const isValid = await bcrypt.compare(passwordFormat, orangTuaUser.password);
        
        results.orangTua = {
          id: orangTuaUser.id,
          name: orangTuaUser.name,
          username: orangTuaUser.username,
          siswaTanggalLahir: siswaRelation.siswa.tanggalLahir,
          expectedPassword: passwordFormat,
          currentPasswordValid: isValid,
          fixed: false
        };

        if (!isValid) {
          const hashedPassword = await bcrypt.hash(passwordFormat, 10);
          await prisma.user.update({
            where: { id: orangTuaUser.id },
            data: { password: hashedPassword }
          });
          results.orangTua.fixed = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error fixing password:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
