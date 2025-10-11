'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Users, Play, Settings } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function ModeLatihanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const latihanModes = [
    {
      id: 1,
      title: 'Latihan Hafalan Baru',
      description: 'Latihan menghafal ayat-ayat baru dengan siswa',
      icon: BookOpen,
      color: 'blue',
      comingSoon: true,
    },
    {
      id: 2,
      title: 'Muroja\'ah (Review)',
      description: 'Review hafalan lama untuk menjaga kekuatan hafalan',
      icon: GraduationCap,
      color: 'green',
      comingSoon: true,
    },
    {
      id: 3,
      title: 'Latihan Kelompok',
      description: 'Latihan bersama dengan beberapa siswa sekaligus',
      icon: Users,
      color: 'purple',
      comingSoon: true,
    },
    {
      id: 4,
      title: 'Tes Hafalan',
      description: 'Uji kemampuan hafalan siswa dengan tes acak',
      icon: Play,
      color: 'yellow',
      comingSoon: true,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-50',
      },
      green: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-50',
      },
      purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-50',
      },
      yellow: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-50',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <GuruLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mode Latihan</h1>
            <p className="text-sm text-gray-600">Latihan dan muroja'ah bersama siswa</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl">
        {/* Info Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">💡 Tentang Mode Latihan</h3>
              <p className="text-sm text-gray-700 mb-2">
                Mode Latihan membantu guru untuk melakukan sesi latihan hafalan dan muroja'ah bersama siswa secara terstruktur.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Latihan hafalan ayat-ayat baru</li>
                <li>Muroja'ah (review) hafalan lama</li>
                <li>Tes hafalan dengan sistem acak</li>
                <li>Latihan kelompok untuk meningkatkan motivasi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latihanModes.map((mode) => {
            const Icon = mode.icon;
            const colorClasses = getColorClasses(mode.color);

            return (
              <div
                key={mode.id}
                className={`bg-white border-2 ${colorClasses.border} rounded-lg p-6 ${
                  mode.comingSoon ? 'opacity-75' : colorClasses.hover
                } transition-all cursor-pointer relative overflow-hidden`}
              >
                {mode.comingSoon && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${colorClasses.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={28} className={colorClasses.icon} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {mode.description}
                    </p>
                  </div>
                </div>

                {!mode.comingSoon && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="text-sm font-medium text-green-600 hover:text-green-700">
                      Mulai Latihan →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📚 Tips Latihan Efektif</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Konsisten & Rutin</p>
                <p className="text-xs text-gray-600">Jadwalkan sesi latihan secara teratur</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Bertahap</p>
                <p className="text-xs text-gray-600">Mulai dari target kecil yang realistis</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Review Berkala</p>
                <p className="text-xs text-gray-600">Jangan lupakan muroja'ah hafalan lama</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Motivasi Positif</p>
                <p className="text-xs text-gray-600">Berikan apresiasi atas pencapaian siswa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}
