'use client';

import { colors } from './constants';

export default function TabelBulanan({ data, onCatatanChange }) {
  const formatNilai = (nilai) => {
    if (nilai === '-' || nilai == null || nilai === 0) return '-';
    const rounded = Math.round(nilai);
    if (Math.abs(nilai - rounded) < 0.01) {
      return rounded.toString();
    }
    return nilai.toFixed(1);
  };

  const getNilaiColor = (nilai) => {
    if (nilai === '-' || nilai == null || nilai === 0) return colors.text.tertiary;
    if (nilai >= 90) return colors.emerald[600];
    if (nilai >= 85) return colors.emerald[500];
    if (nilai >= 80) return colors.amber[500];
    if (nilai >= 75) return colors.amber[600];
    return colors.red[500];
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', border: `1px solid ${colors.gray[200]}`, borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          {/* Group Header Row */}
          <tr style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}>
            <th colSpan="2" style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'none', letterSpacing: '0.05em', borderBottom: `2px solid ${colors.emerald[300]}` }}>Informasi Siswa</th>
            <th colSpan="4" style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'none', letterSpacing: '0.05em', borderBottom: `2px solid ${colors.emerald[300]}`, borderLeft: `2px solid ${colors.emerald[400]}`, borderRight: `2px solid ${colors.emerald[400]}` }}>Rekap Kehadiran</th>
            <th colSpan="8" style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'none', letterSpacing: '0.05em', borderBottom: `2px solid ${colors.emerald[300]}` }}>Capaian Hafalan & Nilai</th>
          </tr>
          <tr style={{ background: colors.emerald[50], borderBottom: `2px solid ${colors.emerald[200]}` }}>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif' }}>No</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '150px' }}>Nama Lengkap</th>
            <th style={{ padding: '12px', minWidth: '50px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', borderLeft: `1px solid ${colors.gray[200]}` }}>H</th>
            <th style={{ padding: '12px', minWidth: '50px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif' }}>I</th>
            <th style={{ padding: '12px', minWidth: '50px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif' }}>S</th>
            <th style={{ padding: '12px', minWidth: '50px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', borderRight: `1px solid ${colors.gray[200]}` }}>A</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '70px' }}>Setoran</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '120px' }}>Hafalan Terakhir</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '80px' }}>Avg Tajwid</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '80px' }}>Avg Lancar</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '80px' }}>Avg Makhraj</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '80px' }}>Avg Impl.</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', background: colors.emerald[100], minWidth: '100px' }}>Rata-rata Nilai</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.gray[800], fontFamily: 'Poppins, system-ui, sans-serif', minWidth: '80px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
        {data.map((siswa, idx) => {
          return (
            <tr key={siswa.siswaId} style={{ borderBottom: `1px solid ${colors.gray[100]}`, background: 'white' }}>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.no || (idx + 1)}
              </td>
              <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.namaLengkap}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', borderLeft: `1px solid ${colors.gray[50]}` }}>
                {siswa.hadir || 0}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.izin || 0}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.sakit || 0}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', borderRight: `1px solid ${colors.gray[50]}` }}>
                {siswa.alfa || 0}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.jumlahSetoran || 0}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: colors.text.secondary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.hafalanTerakhir || '-'}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataTajwid)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataKelancaran)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataMakhraj)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataImplementasi)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', background: colors.emerald[50] }}>
                {formatNilai(siswa.rataRataNilaiBulanan)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: siswa.statusHafalan === 'LANJUT' ? colors.emerald[600] : colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.statusHafalan || '-'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
