'use client';

import { X, Save } from 'lucide-react';
import { surahList, colors } from './constants';

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
  const values = [tajwid, kelancaran, makhraj, implementasi].filter(v => v != null && v !== '');
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + parseFloat(v), 0) / values.length;
};

export default function PopupPenilaian({
  show,
  onClose,
  siswa,
  form,
  onFormChange,
  onSave
}) {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: colors.white,
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
          padding: '24px',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: colors.white,
            fontFamily: 'Poppins, system-ui, sans-serif',
            margin: 0,
          }}>
            Form Penilaian - {siswa?.namaLengkap}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.white,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Surah */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: colors.text.secondary,
              marginBottom: '8px',
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              Surah <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={form.surah}
              onChange={(e) => onFormChange({ ...form, surah: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: `2px solid ${colors.emerald[200]}`,
                borderRadius: '12px',
                outline: 'none',
                fontFamily: 'Poppins, system-ui, sans-serif',
                background: colors.white,
                cursor: 'pointer',
              }}
            >
              <option value="">Pilih Surah</option>
              {surahList.map((surah) => (
                <option key={surah} value={surah}>
                  {surah}
                </option>
              ))}
            </select>
          </div>

          {/* Ayat */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Ayat Mulai <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.ayatMulai}
                onChange={(e) => onFormChange({ ...form, ayatMulai: e.target.value })}
                placeholder="1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `2px solid ${colors.emerald[200]}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Ayat Selesai <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.ayatSelesai}
                onChange={(e) => onFormChange({ ...form, ayatSelesai: e.target.value })}
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `2px solid ${colors.emerald[200]}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{
            borderTop: `2px solid ${colors.gray[200]}`,
            margin: '24px 0',
          }} />

          {/* Penilaian 4 Aspek */}
          <h4 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '16px',
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}>
            Penilaian (0-100)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Tajwid <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.tajwid}
                onChange={(e) => onFormChange({ ...form, tajwid: e.target.value })}
                placeholder="85"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `2px solid ${colors.emerald[200]}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Kelancaran <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.kelancaran}
                onChange={(e) => onFormChange({ ...form, kelancaran: e.target.value })}
                placeholder="90"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `2px solid ${colors.emerald[200]}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Makhraj <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.makhraj}
                onChange={(e) => onFormChange({ ...form, makhraj: e.target.value })}
                placeholder="88"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `2px solid ${colors.emerald[200]}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Implementasi/Adab <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.implementasi}
                onChange={(e) => onFormChange({ ...form, implementasi: e.target.value })}
                placeholder="92"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `2px solid ${colors.emerald[200]}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Preview Rata-rata */}
          {form.tajwid && form.kelancaran && form.makhraj && form.implementasi && (
            <div style={{
              background: colors.emerald[50],
              borderRadius: '12px',
              padding: '16px',
              border: `2px solid ${colors.emerald[200]}`,
            }}>
              <div style={{
                fontSize: '14px',
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Rata-rata Nilai:{' '}
                <span style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: colors.emerald[600],
                }}>
                  {formatNilai(hitungRataRata(
                    parseFloat(form.tajwid),
                    parseFloat(form.kelancaran),
                    parseFloat(form.makhraj),
                    parseFloat(form.implementasi)
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: colors.gray[50],
          padding: '20px 24px',
          borderRadius: '0 0 20px 20px',
          borderTop: `2px solid ${colors.gray[200]}`,
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '12px',
              border: `2px solid ${colors.gray[300]}`,
              cursor: 'pointer',
              fontFamily: 'Poppins, system-ui, sans-serif',
              background: colors.white,
              color: colors.text.secondary,
              transition: 'all 0.2s',
            }}
          >
            Batal
          </button>
          <button
            onClick={onSave}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Poppins, system-ui, sans-serif',
              background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
              color: colors.white,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Save size={18} />
            Simpan Penilaian
          </button>
        </div>
      </div>
    </div>
  );
}
