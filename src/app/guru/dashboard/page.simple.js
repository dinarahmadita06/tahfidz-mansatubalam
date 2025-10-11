"use client";
import Link from "next/link";

export default function TestDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard Guru Tahfidz - Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/guru/kelola-siswa">
          <div className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600">
            <h2 className="text-2xl font-bold">3</h2>
            <p>Kelas yang Diampu</p>
            <p className="text-sm">kelas aktif</p>
          </div>
        </Link>
        
        <Link href="/guru/kelola-siswa">
          <div className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600">
            <h2 className="text-2xl font-bold">85</h2>
            <p>Total Siswa</p>
            <p className="text-sm">siswa terdaftar</p>
          </div>
        </Link>
        
        <Link href="/guru/laporan">
          <div className="bg-purple-500 text-white p-6 rounded-lg hover:bg-purple-600">
            <h2 className="text-2xl font-bold">82%</h2>
            <p>Progress Rata-rata</p>
            <p className="text-sm">semua kelas</p>
          </div>
        </Link>
        
        <Link href="/guru/kelola-siswa">
          <div className="bg-red-500 text-white p-6 rounded-lg hover:bg-red-600">
            <h2 className="text-2xl font-bold">4</h2>
            <p>Perlu Perhatian</p>
            <p className="text-sm">siswa</p>
          </div>
        </Link>
      </div>
    </div>
  );
}