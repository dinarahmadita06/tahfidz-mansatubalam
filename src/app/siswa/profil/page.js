export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfilClient from './ProfilClient';

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

const formatGender = (gender) => {
  const genderMap = {
    LAKI_LAKI: 'Laki-laki',
    PEREMPUAN: 'Perempuan',
  };
  return genderMap[gender] || '-';
};

async function getProfileData(userId) {
  const siswa = await prisma.siswa.findFirst({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          isActive: true,
        },
      },
      kelas: {
        select: {
          id: true,
          nama: true,
        },
      },
      orangTuaSiswa: {
        include: {
          orangTua: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!siswa) return null;

  const primaryGuardian = siswa.orangTuaSiswa?.[0]?.orangTua || null;

  return {
    id: siswa.id,
    userId: siswa.userId,
    nama: siswa.user?.name || '-',
    email: siswa.user?.email || '-',
    nis: siswa.nis || '-',
    nisn: siswa.nisn || '-',
    jenisKelamin: formatGender(siswa.jenisKelamin),
    tanggalLahir: formatDate(siswa.tanggalLahir),
    alamat: siswa.alamat || '-',
    kelas: siswa.kelas?.nama || '-',
    kelasId: siswa.kelas?.id || null,
    statusSiswa: siswa.user?.isActive ? 'AKTIF' : 'NONAKTIF',
    namaWali: primaryGuardian?.user?.name || '-',
    phoneWali: primaryGuardian?.noTelepon || '-',
    phone: siswa.noTelepon || '-',
  };
}

export default async function ProfileSiswaPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'SISWA') {
    redirect('/login');
  }

  const profileData = await getProfileData(session.user.id);

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profil Tidak Ditemukan</h2>
          <p className="text-gray-600">Maaf, kami tidak dapat menemukan data profil Anda.</p>
        </div>
      </div>
    );
  }

  return <ProfilClient initialData={profileData} />;
}
