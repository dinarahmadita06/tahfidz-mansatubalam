import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Dashboard Admin - SIMTAQ',
  description: 'Dashboard utama administrator sistem manajemen tahfidz',
};

export default function Page() {
  return <DashboardClient />;
}
