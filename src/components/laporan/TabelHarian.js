'use client';

import { colors } from './constants';
import { FileText } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

// Helper function untuk format nilai
const formatNilai = (nilai) => {
  if (nilai == null) return '-';
  const rounded = Math.round(nilai);
  if (Math.abs(nilai - rounded) < 0.01) {
    return rounded.toString();
  }
  return nilai.toFixed(1);
};

// Helper function untuk hitung rata-rata
const hitungRataRata = (tajwid, kelancaran, makhraj, implementasi) => {
  const values = [tajwid, kelancaran, makhraj, implementasi].filter(v => v != null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

const getNilaiColor = (nilai) => {
  if (!nilai) return colors.gray[300];
  if (nilai >= 90) return colors.emerald[500];
  if (nilai >= 80) return colors.amber[400];
  if (nilai >= 70) return colors.amber[600];
  return colors.gray[500];
};

export default function TabelHarian({
  data,
  onStatusChange,
  onPenilaianClick,
  onCatatanChange
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.emerald[200]}` }}>
            <th style={{
              padding: '16px',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
              width: '50px',
            }}>
              No
            </th>
            <th style={{
              padding: '16px',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
              minWidth: '200px',
            }}>
              Nama Lengkap
            </th>
            <th style={{
              padding: '16px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
              width: '150px',
            }}>
              Status Kehadiran
            </th>
            <th style={{
              padding: '16px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
              minWidth: '250px',
            }}>
              Penilaian
            </th>
            <th style={{
              padding: '16px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
              width: '120px',
              background: `${colors.emerald[50]}`,
            }}>
              Rata-rata Nilai
            </th>
            <th style={{
              padding: '16px',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
              minWidth: '200px',
            }}>
              Catatan
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((siswa, idx) => {
            const rataRata = hitungRataRata(
              siswa.pertemuan?.nilaiTajwid,
              siswa.pertemuan?.nilaiKelancaran,
              siswa.pertemuan?.nilaiMakhraj,
              siswa.pertemuan?.nilaiImplementasi
            );

            return (
              <tr key={siswa.siswaId} style={{
                borderBottom: `1px solid ${colors.gray[200]}`,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.gray[50]}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  {idx + 1}
                </td>

                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  {siswa.namaLengkap}
                </td>

                {/* Status Kehadiran - Dropdown */}
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <select
                    value={siswa.pertemuan?.statusKehadiran || 'HADIR'}
                    onChange={(e) => onStatusChange(siswa.siswaId, e.target.value)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '100px',
                      border: `2px solid ${colors.emerald[200]}`,
                      outline: 'none',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      background: colors.white,
                      cursor: 'pointer',
                      color: colors.text.primary,
                    }}
                  >
                    <option value="HADIR">Hadir</option>
                    <option value="SAKIT">Sakit</option>
                    <option value="IZIN">Izin</option>
                    <option value="ALFA">Alpa</option>
                  </select>
                </td>

                {/* Penilaian - Button to open popup */}
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => onPenilaianClick(siswa)}
                    style={{
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      background: siswa.pertemuan?.nilaiTajwid
                        ? `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`
                        : `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                      color: colors.white,
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    {siswa.pertemuan?.nilaiTajwid ? 'Edit Penilaian' : 'Input Penilaian'}
                  </button>
                  {siswa.pertemuan?.surah && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: colors.text.tertiary,
                      fontFamily: 'Poppins, system-ui, sans-serif',
                    }}>
                      {siswa.pertemuan.surah} ({siswa.pertemuan.ayatMulai}-{siswa.pertemuan.ayatSelesai})
                    </div>
                  )}
                </td>

                {/* Rata-rata Nilai */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  background: `${colors.emerald[50]}`,
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: getNilaiColor(rataRata),
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    {formatNilai(rataRata)}
                  </span>
                </td>

                {/* Catatan - Editable input */}
                <td style={{ padding: '16px' }}>
                  <input
                    type="text"
                    value={siswa.pertemuan?.catatan || ''}
                    onChange={(e) => {
                      // Update local display immediately
                      if (siswa.pertemuan) {
                        siswa.pertemuan.catatan = e.target.value;
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.gray[200];
                      onCatatanChange(siswa.siswaId, e.target.value);
                    }}
                    placeholder="Tambahkan catatan..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '8px',
                      outline: 'none',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      transition: 'border 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.emerald[500]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <EmptyState
          title="Tidak ada data siswa"
          description="Belum ada data penilaian siswa untuk tanggal terpilih."
          icon={FileText}
          className="py-12"
        />
      )}
    </div>
  );
}
