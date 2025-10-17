'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Volume2,
  BookMarked,
  Search,
  Play,
  Pause,
  Star,
  ChevronDown,
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';
import SiswaLayout from '@/components/layout/SiswaLayout';

export default function ReferensiQuran() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('quran');
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahData, setSurahData] = useState(null);
  const [weeklyMaterial, setWeeklyMaterial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [jumpToAyah, setJumpToAyah] = useState('');
  const [showSurahContent, setShowSurahContent] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      console.log('User authenticated, fetching data...');
      fetchSurahs();
      fetchWeeklyMaterial();
    }
  }, [status]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        // Remove event listeners to prevent errors during cleanup
        audioElement.onended = null;
        audioElement.onerror = null;
        audioElement.onpause = null;
        audioElement.onplay = null;
      }
    };
  }, [audioElement]);

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/quran/surahs');
      if (!response.ok) {
        throw new Error('Failed to fetch surahs');
      }
      const data = await response.json();
      console.log('Surahs fetched:', data.length);
      if (Array.isArray(data)) {
        setSurahs(data);
      } else {
        console.error('Surahs data is not an array:', data);
        setSurahs([]);
      }
    } catch (error) {
      console.error('Error fetching surahs:', error);
      setSurahs([]);
    }
  };

  const fetchWeeklyMaterial = async () => {
    try {
      const response = await fetch('/api/weekly-material');
      const data = await response.json();
      setWeeklyMaterial(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching weekly material:', error);
    }
  };

  const fetchSurahData = async (surahNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quran/surah/${surahNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch surah');
      }
      const data = await response.json();

      // Validate data structure
      if (!data || !data.ayahs || !Array.isArray(data.ayahs)) {
        throw new Error('Invalid surah data format');
      }

      // Debug: log first ayah to see structure
      if (data.ayahs.length > 0) {
        console.log('📖 First ayah structure:', data.ayahs[0]);
      }

      setSurahData(data);
      setSelectedSurah(surahNumber);
      setShowSurahContent(true); // Show surah content view on mobile
    } catch (error) {
      console.error('Error fetching surah data:', error);
      alert('Gagal memuat data surah. Silakan coba lagi.');
      setSurahData(null);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (surahNumber, ayahNumberInSurah) => {
    try {
      console.log('🎵 playAudio called:', { surahNumber, ayahNumberInSurah });

      // Validate parameters
      if (!surahNumber || !ayahNumberInSurah) {
        console.error('❌ Invalid parameters:', { surahNumber, ayahNumberInSurah });
        alert('Error: Nomor surah atau ayat tidak valid');
        return;
      }

      // Cleanup previous audio properly
      if (audioElement) {
        console.log('🧹 Cleaning up previous audio');
        audioElement.pause();
        // Remove event listeners to prevent errors during cleanup
        audioElement.onended = null;
        audioElement.onerror = null;
        audioElement.onpause = null;
        audioElement.onplay = null;
        setAudioElement(null);
      }

      // Format surah and ayah numbers with leading zeros
      const formattedSurah = String(surahNumber).padStart(3, '0');
      const formattedAyah = String(ayahNumberInSurah).padStart(3, '0');

      console.log('📝 Formatted:', { formattedSurah, formattedAyah });

      // Try direct URL first (everyayah.com has CORS enabled)
      const audioUrl = `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${formattedSurah}${formattedAyah}.mp3`;

      // Alternative: Use proxy (uncomment if direct URL doesn't work)
      // const audioUrl = `/api/audio/Abdul_Basit_Murattal_192kbps/${formattedSurah}${formattedAyah}.mp3`;

      console.log('🎵 URL:', audioUrl);

      // Update state FIRST to show playing UI
      const playingId = `${surahNumber}-${ayahNumberInSurah}`;
      setAudioPlaying(playingId);

      // Create new audio element
      const audio = new Audio();
      audio.preload = 'auto';

      // Set up event listeners
      audio.addEventListener('loadstart', () => {
        console.log('📥 Loading started...');
      });

      audio.addEventListener('loadeddata', () => {
        console.log('📦 Audio data loaded');
      });

      audio.addEventListener('canplay', () => {
        console.log('✅ Can play, attempting to play...');
        audio.play()
          .then(() => {
            console.log('▶️ Playing successfully!');
          })
          .catch(err => {
            console.error('❌ Play error:', err);
            alert('Gagal memutar audio. Error: ' + err.message);
            setAudioPlaying(null);
            setAudioElement(null);
          });
      });

      audio.addEventListener('error', (e) => {
        // Ignore errors on empty src (cleanup errors)
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
          console.log('⚠️ Error on cleanup audio element (empty src), ignoring');
          return;
        }

        const errorCode = audio.error?.code;
        const errorMessages = {
          1: 'MEDIA_ERR_ABORTED - Loading dibatalkan',
          2: 'MEDIA_ERR_NETWORK - Error network',
          3: 'MEDIA_ERR_DECODE - Error decoding',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Format tidak didukung'
        };
        console.error('❌ Audio error:', errorMessages[errorCode] || 'Unknown error');
        console.error('❌ Error details:', {
          code: errorCode,
          message: audio.error?.message,
          src: audio.src,
          expectedUrl: audioUrl
        });

        alert(`Gagal memuat audio:\n${errorMessages[errorCode] || 'Unknown error'}\n\nURL: ${audioUrl}`);
        setAudioPlaying(null);
        setAudioElement(null);
      });

      audio.addEventListener('ended', () => {
        console.log('⏹️ Playback ended');
        setAudioPlaying(null);
        setAudioElement(null);
      });

      audio.addEventListener('pause', () => {
        console.log('⏸️ Paused');
      });

      audio.addEventListener('play', () => {
        console.log('▶️ Play event fired');
      });

      // Set source and load
      audio.src = audioUrl;
      audio.load();

      // Save audio element to state
      setAudioElement(audio);

      console.log('🎵 Audio element created and loading...');
    } catch (error) {
      console.error('❌ Error in playAudio:', error);
      setAudioPlaying(null);
      setAudioElement(null);
    }
  };

  const pauseAudio = () => {
    console.log('⏸️ pauseAudio called');
    if (audioElement) {
      audioElement.pause();
      // Remove event listeners to prevent errors during cleanup
      audioElement.onended = null;
      audioElement.onerror = null;
      audioElement.onpause = null;
      audioElement.onplay = null;
      // Don't set src to empty string to avoid error
      // Just pause and remove reference
      setAudioElement(null);
    }
    setAudioPlaying(null);
  };

  const handleJumpToAyah = () => {
    const ayahNumber = parseInt(jumpToAyah);
    if (ayahNumber && ayahNumber >= 1 && ayahNumber <= surahData?.numberOfAyahs) {
      const element = document.getElementById(`ayah-${ayahNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight effect
        element.classList.add('ring-4', 'ring-green-400');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-green-400');
        }, 2000);
      }
      setShowJumpModal(false);
      setJumpToAyah('');
    } else {
      alert(`Masukkan nomor ayat antara 1-${surahData?.numberOfAyahs}`);
    }
  };

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.number.toString().includes(searchTerm)
  );

  const isWeeklyMaterial = (surahNumber, ayahNumber) => {
    return weeklyMaterial.some(
      (material) =>
        material.surahNumber === surahNumber &&
        ayahNumber >= material.ayatMulai &&
        ayahNumber <= material.ayatSelesai &&
        material.isActive
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const Layout = session?.user?.role === 'GURU' ? GuruLayout : SiswaLayout;

  return (
    <Layout>
      {/* ... rest of the old component ... */}
    </Layout>
  );
}

// Tajwid Guide Component
function TajwidGuide() {
  // ... rest of tajwid component ...
}
