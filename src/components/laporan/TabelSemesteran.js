'use client';

import { colors } from './constants';

export default function TabelSemesteran({ data, onCatatanChange }) {
  const formatNilai = (nilai) => {
    if (nilai == null || nilai === '' || nilai === 0) return '-';
    
    // Ensure nilai is a number
    const numValue = typeof nilai === 'number' ? nilai : parseFloat(nilai);
    
    // Check if conversion resulted in valid number
    if (isNaN(numValue)) return '-';
    
    const rounded = Math.round(numValue);
    if (Math.abs(numValue - rounded) < 0.01) {
      return rounded.toString();
    }
    return numValue.toFixed(1);
  };

  const getNilaiColor = (nilai) => {
    if (nilai == null || nilai === '' || nilai === 0) return colors.text.tertiary;
    
    // Ensure nilai is a number for comparison
    const numValue = typeof nilai === 'number' ? nilai : parseFloat(nilai);
    if (isNaN(numValue)) return colors.text.tertiary;
    
    if (numValue >= 90) return colors.emerald[600];
    if (numValue >= 85) return colors.emerald[500];
    if (numValue >= 80) return colors.amber[500];
    if (numValue >= 75) return colors.amber[600];
    return colors.red[500];
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${colors.emerald[200]}` }}>
          <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>No</th>
          <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nama Lengkap</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Total Hadir</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Total Tidak Hadir</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Tajwid</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Kelancaran</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Makhraj</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Implementasi</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', background: `${colors.emerald[50]}` }}>Rata-rata Nilai Semesteran</th>
          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Status Hafalan</th>
          <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Performance Level</th>
          <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Catatan</th>
        </tr>
      </thead>
      <tbody>
        {data.map((siswa, idx) => {
          return (
            <tr key={siswa.siswaId} style={{ borderBottom: `1px solid ${colors.gray[200]}` }}>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {idx + 1}
              </td>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.namaLengkap}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.emerald[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.totalHadir || 0}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.totalTidakHadir || 0}
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
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '15px', fontWeight: 700, color: getNilaiColor(siswa.rataRataNilaiSemesteran), fontFamily: 'Poppins, system-ui, sans-serif', background: `${colors.emerald[50]}` }}>
                {formatNilai(siswa.rataRataNilaiSemesteran)}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: siswa.statusHafalan === 'LANJUT' ? colors.emerald[600] : colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.statusHafalan || '-'}
              </td>
              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: colors.emerald[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {siswa.performanceLevel || '-'}
              </td>
              <td style={{ padding: '16px' }}>
                <input
                  type="text"
                  defaultValue={siswa.catatanSemesteran || ''}
                  onBlur={(e) => onCatatanChange(siswa.siswaId, e.target.value)}
                  placeholder="Tambah catatan..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    color: colors.text.primary,
                    background: colors.white,
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = `2px solid ${colors.emerald[400]}`;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.emerald[50]}`;
                  }}
                  onBlurCapture={(e) => {
                    e.target.style.border = `1px solid ${colors.gray[300]}`;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
