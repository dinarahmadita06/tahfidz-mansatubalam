import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // In Next.js 15, params must be awaited
    const resolvedParams = await params;
    const { number } = resolvedParams;

    // Fetch chapter info first
    const chapterResponse = await fetch(
      `https://api.quran.com/api/v4/chapters/${number}`,
      { cache: 'force-cache' }
    );

    const chapterData = await chapterResponse.json();

    // Using Quran.com API - more accurate and separate bismillah
    const response = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${number}`,
      { cache: 'force-cache' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch surah data');
    }

    const data = await response.json();

    // Fetch Indonesian translation (ID 134 = Indonesian Ministry of Religious Affairs)
    const translationResponse = await fetch(
      `https://api.quran.com/api/v4/quran/translations/134?chapter_number=${number}`,
      { cache: 'force-cache' }
    );

    const translationData = await translationResponse.json();

    // Combine both responses with proper mapping
    // Translations array is in the same order as verses array
    const combinedAyahs = data.verses.map((ayah, index) => {
      // Get translation by matching index
      const translation = translationData.translations[index];

      return {
        number: ayah.id,
        numberInSurah: ayah.verse_number,
        verseKey: ayah.verse_key,
        text: ayah.text_uthmani,
        translation: translation?.text?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
        juz: ayah.juz_number,
        page: ayah.page_number,
        hizbQuarter: ayah.hizb_number,
      };
    });

    return NextResponse.json({
      number: chapterData.chapter.id,
      name: chapterData.chapter.name_arabic,
      englishName: chapterData.chapter.name_simple,
      englishNameTranslation: chapterData.chapter.translated_name.name,
      numberOfAyahs: chapterData.chapter.verses_count,
      revelationType: chapterData.chapter.revelation_place,
      ayahs: combinedAyahs,
    });
  } catch (error) {
    console.error('Error fetching surah:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surah data' },
      { status: 500 }
    );
  }
}
