import { useState, useEffect } from 'react';

/**
 * Custom hook untuk fetch target hafalan dari API
 * 
 * Usage:
 * const { targetJuz, loading, error, isNotSet } = useTargetHafalan();
 * 
 * Returns:
 * - targetJuz: number | null - Target juz dari tahun ajaran aktif
 * - loading: boolean - Sedang fetch data
 * - error: string | null - Error message jika ada
 * - isNotSet: boolean - True jika admin belum mengatur target
 * - tahunAjaran: string - Nama tahun ajaran (e.g. "2025/2026")
 * - semester: number - Semester (1 atau 2)
 */
export function useTargetHafalan() {
  const [targetJuz, setTargetJuz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotSet, setIsNotSet] = useState(false);
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [semester, setSemester] = useState(null);

  useEffect(() => {
    const fetchTargetHafalan = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsNotSet(false);

        const response = await fetch('/api/siswa/target-hafalan');
        
        if (!response.ok) {
          throw new Error('Failed to fetch target hafalan');
        }

        const data = await response.json();

        if (data.targetJuz === null) {
          setIsNotSet(true);
          setTargetJuz(null);
          console.log('[useTargetHafalan] Target not set:', data.message);
        } else {
          setTargetJuz(data.targetJuz);
          setTahunAjaran(data.tahunAjaran);
          setSemester(data.semester);
          console.log(`[useTargetHafalan] Target: ${data.targetJuz} juz`);
        }
      } catch (err) {
        console.error('[useTargetHafalan] Error:', err);
        setError(err.message || 'Gagal memuat target hafalan, silakan refresh');
      } finally {
        setLoading(false);
      }
    };

    fetchTargetHafalan();
  }, []);

  return {
    targetJuz,
    loading,
    error,
    isNotSet,
    tahunAjaran,
    semester
  };
}

/**
 * Helper function untuk validasi hafalan minimal
 * 
 * @param {number} totalJuzHafalan - Total juz yang sudah dihafal
 * @param {number} targetJuz - Target juz dari admin
 * @returns {boolean} True jika sudah memenuhi minimal
 */
export function validateMinimalHafalan(totalJuzHafalan, targetJuz) {
  if (!targetJuz) return false;
  return totalJuzHafalan >= targetJuz;
}
