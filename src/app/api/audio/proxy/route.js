import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Audio providers dengan prioritas fallback
const AUDIO_PROVIDERS = [
  {
    name: 'everyayah',
    buildUrl: (reciter, surah, ayah) => {
      const surahStr = String(surah).padStart(3, '0');
      const ayahStr = String(ayah).padStart(3, '0');
      return `https://everyayah.com/data/${reciter}/${surahStr}${ayahStr}.mp3`;
    },
  },
  {
    name: 'quran.com',
    buildUrl: (reciter, surah, ayah) => {
      // Quran.com menggunakan format berbeda
      // Contoh: https://verses.quran.com/AbdulBaset/Mujawwad/mp3/001001.mp3
      const surahStr = String(surah).padStart(3, '0');
      const ayahStr = String(ayah).padStart(3, '0');
      // Map reciter name ke format quran.com
      const reciterMap = {
        'Abdul_Basit_Murattal_192kbps': 'AbdulBaset/Mujawwad',
        'Abdurrahmaan_As-Sudais_192kbps': 'Abdurrahman_As-Sudais',
        'Mishari_Rashid_al_Afasy_128kbps': 'MishariAlafasy',
      };
      const mappedReciter = reciterMap[reciter] || 'AbdulBaset/Mujawwad';
      return `https://verses.quran.com/${mappedReciter}/mp3/${surahStr}${ayahStr}.mp3`;
    },
  },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reciter = searchParams.get('reciter') || 'Abdul_Basit_Murattal_192kbps';
    const surah = searchParams.get('surah');
    const ayah = searchParams.get('ayah');

    // Validasi parameter
    if (!surah || !ayah) {
      return NextResponse.json(
        { error: 'Parameter surah dan ayah wajib diisi' },
        { status: 400 }
      );
    }

    const surahNum = parseInt(surah);
    const ayahNum = parseInt(ayah);

    if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114 || ayahNum < 1) {
      return NextResponse.json(
        { error: 'Nomor surah atau ayat tidak valid' },
        { status: 400 }
      );
    }

    // Coba fetch dari provider satu per satu sampai berhasil
    let lastError = null;

    for (const provider of AUDIO_PROVIDERS) {
      try {
        const audioUrl = provider.buildUrl(reciter, surahNum, ayahNum);

        const audioResponse = await fetch(audioUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (audioResponse.ok) {
          // Audio berhasil di-fetch
          const audioBuffer = await audioResponse.arrayBuffer();

          // Stream audio balik ke client dengan cache header
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=31536000, immutable', // Cache 1 tahun
              'X-Audio-Provider': provider.name,
              'X-Audio-URL': audioUrl,
            },
          });
        }
      } catch (err) {
        lastError = err;
        continue; // Coba provider berikutnya
      }
    }

    // Semua provider gagal
    return NextResponse.json(
      {
        error: 'Audio tidak tersedia dari semua provider',
        details: lastError?.message
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error in audio proxy:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', details: error.message },
      { status: 500 }
    );
  }
}
