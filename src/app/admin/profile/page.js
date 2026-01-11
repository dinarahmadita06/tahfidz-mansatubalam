export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/layout/AdminLayout';
import ProfileClient from './ProfileClient';
import { redirect } from 'next/navigation';


export default async function ProfileAdminPage() {
  const startTotal = performance.now();
  
  // Profiling session
  const startAuth = performance.now();
  const session = await auth();
  const endAuth = performance.now();
  const authDuration = (endAuth - startAuth).toFixed(2);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Profiling Prisma query
  const startPrisma = performance.now();
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phoneNumber: true,
      nip: true,
      jabatan: true,
      alamat: true,
      createdAt: true,
      ttdUrl: true,
      signatureUrl: true
    }
  });
  const endPrisma = performance.now();
  const prismaDuration = (endPrisma - startPrisma).toFixed(2);

  if (!admin) {
    redirect('/login');
  }

  // Formatting profile data for initial render
  const profileData = {
    nama: admin.name,
    email: admin.email,
    role: 'Administrator',
    phoneNumber: admin.phoneNumber || '0812-3456-7890',
    jabatan: admin.jabatan || 'Koordinator Tahfidz',
    nip: admin.nip || '',
    alamat: admin.alamat || 'MAN 1 Bandar Lampung, Jl. Raden Intan No. 12',
    tanggalBergabung: admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : '15 Agustus 2024',
    lastLogin: new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB',
    ttdUrl: admin.ttdUrl,
    signatureUrl: admin.signatureUrl
  };

  const endTotal = performance.now();
  const totalDuration = (endTotal - startTotal).toFixed(2);

  console.log(`[RSC PROFILE] total: ${totalDuration} ms`);
  console.log(`[RSC PROFILE] session/auth: ${authDuration} ms`);
  console.log(`[RSC PROFILE] prisma.user.findUnique: ${prismaDuration} ms`);

  return (
    <AdminLayout>
      <ProfileClient initialData={profileData} />
    </AdminLayout>
  );
}
