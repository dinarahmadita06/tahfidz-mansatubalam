'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Trophy, AlertCircle } from 'lucide-react';

// ============================================================================
// TARGET KELAS CHART CARD - Horizontal Bar Chart
// ============================================================================
function TargetKelasChartCard({ data, loading, targetHafalan }) {
  const chartData = data || [];
  const hasData = chartData.length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 lg:p-4 border border-emerald-100/60 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
        <div className="p-2 lg:p-2.5 bg-emerald-500 rounded-xl text-white shadow-md ring-2 ring-emerald-200">
          <TrendingUp size={18} />
        </div>
        <div>
          <h3 className="text-base lg:text-lg font-bold text-gray-800 leading-tight">Statistik Kelas Mencapai Target</h3>
          <p className="text-[10px] lg:text-xs text-gray-600 font-medium opacity-80">Top 5 kelas dengan progres terbaik</p>
        </div>
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-full animate-pulse w-24"></div>
              <div className="h-6 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="p-4 bg-emerald-50 rounded-full mb-4">
            <TrendingUp className="text-emerald-400" size={32} />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Belum ada data kelas</h4>
          <p className="text-xs text-gray-500">Data akan muncul setelah siswa menyelesaikan hafalan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chartData.map((kelas, index) => {
            const isHighest = index === 0;
            return (
              <div key={kelas.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-700 truncate flex-1">
                    {kelas.nama}
                  </span>
                  {isHighest && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                      TERTINGGI
                    </span>
                  )}
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {kelas.persen}%
                  </span>
                </div>
                
                {/* Bar Chart */}
                <div className="relative h-6 lg:h-7 bg-emerald-100/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                      isHighest
                        ? 'from-emerald-600 to-emerald-500'
                        : 'from-emerald-500 to-teal-500'
                    } rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2.5`}
                    style={{ width: `${kelas.persen}%` }}
                  >
                    {kelas.persen > 15 && (
                      <span className="text-white text-[10px] lg:text-xs font-bold">{kelas.mencapai}/{kelas.total}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 lg:mt-5 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-3 lg:p-4">
        <p className="text-[11px] lg:text-sm text-emerald-800 font-medium leading-relaxed">
          <span className="font-bold">Target Kelas:</span> Kelas dianggap mencapai target jika ≥ 50% siswanya telah mencapai target hafalan (≥ {targetHafalan || 3} juz)
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// TARGET SISWA DONUT CARD
// ============================================================================
function TargetSiswaDonutCard({ data, loading, targetHafalan }) {
  const siswaData = data || { mencapai: 0, belum: 0, total: 0, persen: 0 };
  const { mencapai, belum, total, persen } = siswaData;

  // Calculate angles for donut
  const mencapaiAngle = total > 0 ? (mencapai / total) * 360 : 0;
  const belumAngle = total > 0 ? (belum / total) * 360 : 0;

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 lg:p-4 border border-blue-100/60 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
        <div className="p-2 lg:p-2.5 bg-blue-500 rounded-xl text-white shadow-md ring-2 ring-blue-200">
          <Users size={18} />
        </div>
        <div>
          <h3 className="text-base lg:text-lg font-bold text-gray-800 leading-tight">Statistik Siswa Mencapai Target</h3>
          <p className="text-[10px] lg:text-xs text-gray-600 font-medium opacity-80">Distribusi pencapaian siswa</p>
        </div>
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="mt-4 h-4 bg-gray-200 rounded-full w-24 animate-pulse"></div>
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <Users className="text-blue-400" size={32} />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Belum ada siswa mencapai target</h4>
          <p className="text-xs text-gray-500">Data akan muncul setelah siswa menyelesaikan hafalan</p>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {/* SVG Donut Chart */}
          <div className="flex justify-center">
            <svg className="w-32 h-32 lg:w-36 lg:h-36" viewBox="0 0 200 200">
              {/* Mencapai Target - Green */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#10b981"
                strokeWidth="28"
                strokeDasharray={`${(mencapaiAngle / 360) * 440} 440`}
                strokeDashoffset="0"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
              />
              {/* Belum Mencapai - Gray */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="28"
                strokeDasharray={`${(belumAngle / 360) * 440} 440`}
                strokeDashoffset={-((mencapaiAngle / 360) * 440)}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
              />
              {/* Center Circle */}
              <circle cx="100" cy="100" r="45" fill="white" />
              {/* Percentage Text */}
                <text
                x="100"
                y="100"
                textAnchor="middle"
                dy="0.3em"
                className="text-2xl lg:text-3xl font-bold fill-gray-900"
                fontSize="32"
              >
                {persen}%
              </text>
              <text
                x="100"
                y="125"
                textAnchor="middle"
                className="text-[10px] lg:text-xs fill-gray-600"
                fontSize="14"
              >
                Mencapai
              </text>
            </svg>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {/* Mencapai Target */}
            <div className="bg-emerald-50/70 rounded-xl p-2.5 lg:p-3 border border-emerald-100/60">
              <p className="text-[10px] lg:text-xs font-bold text-emerald-800 uppercase mb-0.5 lg:mb-1">Mencapai</p>
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 leading-tight">{mencapai}</p>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5 opacity-80">Siswa</p>
            </div>

            {/* Belum Mencapai */}
            <div className="bg-gray-50/70 rounded-xl p-2.5 lg:p-3 border border-gray-200/60">
              <p className="text-[10px] lg:text-xs font-bold text-gray-800 uppercase mb-0.5 lg:mb-1">Belum</p>
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 leading-tight">{belum}</p>
              <p className="text-[10px] text-gray-600 font-medium mt-0.5 opacity-80">Siswa</p>
            </div>
          </div>

          {/* Total Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-3 lg:p-4">
            <p className="text-[11px] lg:text-sm text-blue-800 leading-relaxed">
              <span className="font-bold">Total:</span> {total} siswa
            </p>
            <p className="text-[11px] lg:text-sm text-blue-800 mt-1 lg:mt-2 leading-relaxed">
              <span className="font-bold">Target:</span> Hafalan ≥ {targetHafalan || 3} juz
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN TARGET STATISTICS SECTION
// ============================================================================
export default function TargetStatisticsSection() {
  const [data, setData] = useState({
    kelasTop5: [],
    siswa: { mencapai: 0, belum: 0, total: 0, persen: 0 },
  });
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both active tahun ajaran and statistics in parallel
        const [taRes, statsRes] = await Promise.all([
          fetch('/api/tahun-ajaran/aktif', { cache: 'no-store' }),
          fetch('/api/admin/statistik/target', { cache: 'no-store' })
        ]);
        
        if (taRes.ok) {
          const taData = await taRes.json();
          if (taData.success && taData.data) {
            setTahunAjaranAktif(taData.data);
          }
        }
        
        if (statsRes.ok) {
          const result = await statsRes.json();
          if (result.success) {
            setData(result);
          }
        } else {
          throw new Error('Gagal mengambil data statistik target');
        }
      } catch (err) {
        console.error('[TargetStatisticsSection] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show placeholder if target not available
  if (!loading && !tahunAjaranAktif?.targetHafalan) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-amber-100/60 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="text-amber-500 mx-auto mb-3" size={32} />
            <p className="text-sm font-medium text-gray-700">Target hafalan belum diatur</p>
            <p className="text-xs text-gray-500 mt-1">Silakan atur target di halaman Tahun Ajaran</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-amber-100/60 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="text-amber-500 mx-auto mb-3" size={32} />
            <p className="text-sm font-medium text-gray-700">Target hafalan belum diatur</p>
            <p className="text-xs text-gray-500 mt-1">Silakan atur target di halaman Tahun Ajaran</p>
          </div>
        </div>
      </div>
    );
  }

  const targetHafalan = tahunAjaranAktif?.targetHafalan || 3;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TargetKelasChartCard data={data.kelasTop5} loading={loading} targetHafalan={targetHafalan} />
      <TargetSiswaDonutCard data={data.siswa} loading={loading} targetHafalan={targetHafalan} />
    </div>
  );
}
