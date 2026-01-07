import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Custom hook untuk fetch data dengan SWR
 * @param {string} url - API endpoint
 * @param {object} config - SWR configuration
 * @returns {object} { data, error, isLoading, isValidating, mutate }
 */
export function useData(url, config = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    url,
    null, // fetcher sudah di-define di SWRProvider
    {
      // Mewarisi konfigurasi global dari SWRProvider (smart focus revalidation)
      ...config,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

/**
 * Custom hook untuk POST/PUT/DELETE dengan optimistic updates
 * @param {string} url - API endpoint
 * @param {string} method - HTTP method (POST, PUT, DELETE, PATCH)
 * @returns {object} { trigger, isMutating, error }
 */
export function useMutation(url, method = 'POST') {
  async function sendRequest(url, { arg }) {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(arg),
    });

    if (!response.ok) {
      const error = new Error('An error occurred while saving.');
      error.info = await response.json();
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  const { trigger, isMutating, error } = useSWRMutation(url, sendRequest);

  return {
    trigger,
    isMutating,
    error,
  };
}

// Specific hooks untuk data umum
export function useSiswaList() {
  return useData('/api/admin/siswa');
}

export function useGuruList() {
  return useData('/api/admin/guru');
}

export function useKelasList() {
  return useData('/api/admin/kelas');
}

export function useTahunAjaranList() {
  return useData('/api/admin/tahun-ajaran');
}

export function usePengumumanList() {
  return useData('/api/admin/pengumuman');
}
