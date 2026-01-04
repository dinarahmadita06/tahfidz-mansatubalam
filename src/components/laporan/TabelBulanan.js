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
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${colors.emerald[200]}` }}>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>No</th>
          <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nama Lengkap</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Jumlah Setoran</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Hafalan Terakhir</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Tajwid</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Kelancaran</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Makhraj</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Implementasi</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', background: `${colors.emerald[50]}` }}>Rata-rata Nilai</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Status Hafalan</th>
        </tr>
      </thead>
      <tbody>
        {data.map((siswa, idx) => {
          return (
            <tr key={siswa.siswaId} style={{ borderBottom: `1px solid ${colors.gray[200]}` }}>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.no || (idx + 1)}
              </td>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.namaLengkap}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.jumlahSetoran || 0}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: colors.text.secondary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.hafalanTerakhir || '-'}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataTajwid), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataTajwid)}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataKelancaran), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataKelancaran)}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataMakhraj), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataMakhraj)}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataImplementasi), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {formatNilai(siswa.rataRataImplementasi)}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '15px', fontWeight: 700, color: getNilaiColor(siswa.rataRataNilaiBulanan), fontFamily: 'Poppins, system-ui, sans-serif', background: `${colors.emerald[50]}` }}>
                {formatNilai(siswa.rataRataNilaiBulanan)}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: siswa.statusHafalan === 'LANJUT' ? colors.emerald[600] : colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.statusHafalan || '-'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
