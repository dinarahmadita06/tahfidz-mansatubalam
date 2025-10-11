'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import SiswaLayout from '@/components/layout/SiswaLayout';

export default function JadwalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchAgenda();
    }
  }, [status, router]);

  const fetchAgenda = async () => {
    try {
      // Fetch agenda for the student's class
      const res = await fetch('/api/agenda');
      const data = await res.json();

      // If response is an array, use it; otherwise use empty array
      setAgenda(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching agenda:', error);
      setAgenda([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      berlangsung: 'bg-green-100 text-green-700 border-green-200',
      selesai: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.upcoming;
  };

  const getStatusText = (status) => {
    const texts = {
      upcoming: 'Akan Datang',
      berlangsung: 'Berlangsung',
      selesai: 'Selesai',
    };
    return texts[status] || 'Akan Datang';
  };

  const groupAgendaByDate = (agendaList) => {
    const grouped = {};
    agendaList.forEach(item => {
      const date = new Date(item.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const groupedAgenda = groupAgendaByDate(agenda);

  return (
    <SiswaLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jadwal & Agenda</h1>
            <p className="text-sm text-gray-600">Lihat jadwal setoran dan agenda kelas</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tentang Jadwal</h3>
            <p className="text-sm text-gray-700 mb-2">
              Berikut adalah jadwal setoran hafalan dan agenda kelas yang telah dibuat oleh guru Anda.
              Pastikan Anda hadir tepat waktu sesuai jadwal yang telah ditentukan.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Persiapkan hafalan Anda sebelum jadwal setoran</li>
              <li>Hadir tepat waktu sesuai jadwal</li>
              <li>Hubungi guru jika ada kendala</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Agenda List */}
      {Object.keys(groupedAgenda).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar size={48} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium">Belum ada agenda</p>
          <p className="text-sm text-gray-500 mt-1">Guru belum membuat jadwal setoran</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAgenda).map(([date, items]) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{date}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.judul}
                        </h4>
                        {item.deskripsi && (
                          <p className="text-sm text-gray-600 mb-3">
                            {item.deskripsi}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span>
                              {item.waktuMulai}
                              {item.waktuSelesai && ` - ${item.waktuSelesai}`}
                            </span>
                          </div>
                          {item.kelas && (
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-gray-400" />
                              <span>{item.kelas.nama}</span>
                            </div>
                          )}
                          {item.guru && (
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span>{item.guru.user.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips:</strong> Siapkan hafalan Anda dengan baik sebelum jadwal setoran.
          Latihan muroja'ah secara rutin akan membantu Anda lebih lancar saat setoran.
        </p>
      </div>
    </SiswaLayout>
  );
}
