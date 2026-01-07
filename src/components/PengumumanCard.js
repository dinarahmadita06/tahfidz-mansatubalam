'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Calendar, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

export default function PengumumanCard({ limit = 3 }) {
  const [pengumumanList, setPengumumanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pengumuman?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setPengumumanList(data.pengumuman || []);
      }
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
    } finally {
      setLoading(false);
    }
  };

  const tipeBadgeStyle = {
    UMUM: { bg: '#FFEFC1', text: '#92400E', icon: '📢' },
    WISUDA: { bg: '#E5D4FF', text: '#6B21A8', icon: '🎓' },
    KEGIATAN: { bg: '#D1FAE5', text: '#065F46', icon: '📅' },
    LIBUR: { bg: '#FEE2E2', text: '#991B1B', icon: '🏖️' }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-lg">
            <Megaphone className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Pengumuman Terbaru</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pengumumanList.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-lg">
            <Megaphone className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Pengumuman Terbaru</h3>
        </div>
        <EmptyState
          title="Belum ada pengumuman"
          description="Nantikan kabar terbaru dari sekolah di sini."
          icon={Megaphone}
          className="py-4 bg-transparent border-none shadow-none"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-lg">
          <Megaphone className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Pengumuman Terbaru</h3>
      </div>

      <div className="space-y-3">
        {pengumumanList.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: tipeBadgeStyle[item.tipePengumuman]?.bg,
                      color: tipeBadgeStyle[item.tipePengumuman]?.text
                    }}
                  >
                    {tipeBadgeStyle[item.tipePengumuman]?.icon} {item.tipePengumuman}
                  </span>
                  {item.isPenting && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      <AlertCircle size={12} /> Penting
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.judul}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleExpand(item.id)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
              >
                {expandedId === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Content - Collapsed */}
            {expandedId !== item.id && (
              <p className="text-gray-600 text-xs line-clamp-2 whitespace-pre-line">
                {item.isi}
              </p>
            )}

            {/* Content - Expanded */}
            {expandedId === item.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  {item.isi}
                </p>
                {item.wisuda && item.wisuda.siswa && item.wisuda.siswa.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-2">
                      🎓 Daftar Siswa Wisuda:
                    </p>
                    <div className="space-y-1">
                      {item.wisuda.siswa.map((ws, idx) => (
                        <div key={ws.id} className="text-xs text-purple-800">
                          {idx + 1}. {ws.siswa.user.name} - Kelas {ws.siswa.kelas.tingkat} {ws.siswa.kelas.nama}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
