'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import {
  MessageCircle,
  User,
  ChevronDown,
  CheckCircle,
  Send,
  Paperclip,
  Search,
  UserCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KomunikasiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [message, setMessage] = useState('');
  const [searchGuru, setSearchGuru] = useState('');
  const messagesEndRef = useRef(null);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Data dummy anak
  const children = [
    { id: 1, name: 'Ahmad Fauzan', kelas: '5A', avatar: '👦' },
    { id: 2, name: 'Fatimah Azzahra', kelas: '3B', avatar: '👧' },
  ];

  // Data dummy guru
  const guruList = [
    {
      id: 1,
      nama: 'Ustadz Ahmad',
      kelas: 'X A1',
      status: 'online',
      avatar: '👨‍🏫',
      lastMessage: 'Alhamdulillah, hafalan Ahmad sangat baik',
      lastTime: '10:30',
    },
    {
      id: 2,
      nama: 'Ustadzah Siti',
      kelas: 'XI A2',
      status: 'offline',
      avatar: '👩‍🏫',
      lastMessage: 'Baik, InsyaAllah besok akan saya cek',
      lastTime: '09:15',
    },
    {
      id: 3,
      nama: 'Ustadz Yusuf',
      kelas: 'X A1',
      status: 'online',
      avatar: '👨‍🏫',
      lastMessage: 'Terima kasih atas perhatiannya',
      lastTime: 'Kemarin',
    },
  ];

  // Data dummy chat messages
  const chatMessages = {
    1: [
      {
        id: 1,
        from: 'guru',
        text: 'Assalamu\'alaikum warahmatullahi wabarakatuh, Ibu/Bapak. Alhamdulillah hafalan Ahmad hari ini sangat baik.',
        time: '08:00',
        date: '28 Okt 2025',
      },
      {
        id: 2,
        from: 'orangtua',
        text: 'Wa\'alaikumsalam warahmatullahi wabarakatuh, Ustadz. Alhamdulillah, terima kasih atas informasinya.',
        time: '08:15',
        date: '28 Okt 2025',
      },
      {
        id: 3,
        from: 'orangtua',
        text: 'Mohon bimbingannya untuk Ahmad ya Ustadz, terutama dalam menjaga muroja\'ah.',
        time: '08:16',
        date: '28 Okt 2025',
      },
      {
        id: 4,
        from: 'guru',
        text: 'Baik Insya Allah, kami akan terus membimbing Ahmad. Untuk muroja\'ah, sebaiknya setiap hari minimal 1 juz.',
        time: '08:30',
        date: '28 Okt 2025',
      },
      {
        id: 5,
        from: 'guru',
        text: 'Jika ada kendala, silakan konsultasikan kepada kami.',
        time: '08:31',
        date: '28 Okt 2025',
      },
      {
        id: 6,
        from: 'orangtua',
        text: 'Baik Ustadz, terima kasih banyak. Semoga Allah mudahkan Ahmad dalam menghafal Al-Qur\'an.',
        time: '10:30',
        date: '28 Okt 2025',
      },
    ],
    2: [
      {
        id: 1,
        from: 'orangtua',
        text: 'Assalamu\'alaikum Ustadzah, bagaimana perkembangan hafalan Fatimah?',
        time: '09:00',
        date: '27 Okt 2025',
      },
      {
        id: 2,
        from: 'guru',
        text: 'Wa\'alaikumsalam, Alhamdulillah Fatimah hafalan nya lancar. Hanya perlu sedikit perbaikan di tajwid.',
        time: '09:15',
        date: '27 Okt 2025',
      },
    ],
    3: [
      {
        id: 1,
        from: 'guru',
        text: 'Assalamu\'alaikum, terima kasih atas dukungannya untuk Ahmad.',
        time: '15:00',
        date: '26 Okt 2025',
      },
    ],
  };

  const filteredGuru = guruList.filter((guru) =>
    guru.nama.toLowerCase().includes(searchGuru.toLowerCase())
  );

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedGuru]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedGuru) {
      // Di sini akan ada logic untuk mengirim pesan ke backend
      console.log('Sending message:', message, 'to guru:', selectedGuru.id);
      setMessage('');
      setTimeout(scrollToBottom, 100);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <OrangtuaLayout>
      <div className="min-h-screen animate-fade-in">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 relative"
        >
          <div className="bg-gradient-to-r from-emerald-400 via-mint-400 to-lilac-300 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-visible">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              {/* Header Content */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                {/* Left: Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="text-white flex-shrink-0" size={28} />
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      Komunikasi dengan Guru
                    </h1>
                  </div>
                  <p className="text-emerald-50 text-base md:text-lg">
                    Konsultasikan perkembangan hafalan dan kehadiran anak Anda secara langsung
                    dengan guru tahfidz.
                  </p>
                </div>

                {/* Right: Info Anak Card */}
                {selectedChild && (
                  <div className="w-full lg:w-auto flex-shrink-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:bg-white/25 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedChild.avatar}</span>
                        <div>
                          <p className="text-white font-bold text-lg">{selectedChild.name}</p>
                          <p className="text-emerald-100 text-sm">Kelas {selectedChild.kelas}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Child Selector Dropdown */}
              {children.length > 1 && (
                <div className="relative mt-2">
                  <button
                    onClick={() => setShowChildSelector(!showChildSelector)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/90 hover:bg-white hover:ring-1 hover:ring-emerald-400/60 backdrop-blur-sm rounded-xl transition-all duration-200 ease-in-out shadow-md min-w-[180px] max-w-[320px] w-full lg:w-auto"
                  >
                    <User size={18} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-emerald-900 font-semibold text-sm flex-1 truncate">
                      {selectedChild ? selectedChild.name : 'Pilih Anak'}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-emerald-600 flex-shrink-0 transition-transform duration-200 ${
                        showChildSelector ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showChildSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 min-w-[280px] max-w-[400px] w-full md:w-auto border border-emerald-100"
                      >
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => {
                              setSelectedChild(child);
                              setShowChildSelector(false);
                            }}
                            className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-emerald-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                              selectedChild?.id === child.id ? 'bg-emerald-50' : 'bg-white'
                            }`}
                          >
                            <span className="text-3xl flex-shrink-0">{child.avatar}</span>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{child.name}</p>
                              <p className="text-sm text-gray-600">Kelas {child.kelas}</p>
                            </div>
                            {selectedChild?.id === child.id && (
                              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}
        >
          <div className="flex h-full">
            {/* Sidebar Guru - Desktop */}
            <div className="hidden md:block w-80 bg-mint-50 border-r border-emerald-100 flex-shrink-0">
              {/* Search Bar */}
              <div className="p-4 bg-white border-b border-emerald-100">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Cari guru..."
                    value={searchGuru}
                    onChange={(e) => setSearchGuru(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* List Guru */}
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
                {filteredGuru.map((guru) => (
                  <button
                    key={guru.id}
                    onClick={() => setSelectedGuru(guru)}
                    className={`w-full p-4 flex items-start gap-3 border-b border-emerald-100 hover:bg-emerald-50 transition-colors text-left ${
                      selectedGuru?.id === guru.id ? 'bg-emerald-50' : ''
                    }`}
                  >
                    {/* Avatar & Status */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                        {guru.avatar}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          guru.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate">{guru.nama}</p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {guru.lastTime}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600 mb-1">{guru.kelas}</p>
                      <p className="text-sm text-gray-600 truncate">{guru.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedGuru ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-emerald-400 to-mint-300 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-xl">
                          {selectedGuru.avatar}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            selectedGuru.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        ></div>
                      </div>
                      <div>
                        <p className="font-bold text-white">{selectedGuru.nama}</p>
                        <p className="text-xs text-emerald-50">
                          {selectedGuru.status === 'online' ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <Paperclip className="text-white" size={20} />
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-mint-50/30"
                    style={{ backgroundImage: 'url(/pattern-light.svg)' }}
                  >
                    {chatMessages[selectedGuru.id]?.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.from === 'orangtua' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            msg.from === 'orangtua'
                              ? 'bg-emerald-100 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                              : 'bg-white border border-emerald-100 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'
                          } p-3 shadow-sm`}
                        >
                          <p className="text-gray-800 text-sm leading-relaxed">{msg.text}</p>
                          <p className="text-xs text-gray-400 mt-1 text-right">{msg.time}</p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 bg-white border-t border-emerald-100"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ketik pesan Anda..."
                        className="flex-1 px-4 py-3 border border-emerald-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!message.trim()}
                        className={`p-3 rounded-full transition-all ${
                          message.trim()
                            ? 'bg-amber-400 hover:bg-amber-500 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-mint-50/30">
                  <div className="text-center">
                    <MessageCircle className="mx-auto mb-4 text-emerald-300" size={64} />
                    <p className="text-gray-500 text-lg">
                      Pilih guru untuk memulai percakapan
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Motivasi Card */}
        {!message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 bg-amber-100 border-l-4 border-amber-400 text-amber-700 italic rounded-xl px-4 py-3"
          >
            <p className="text-sm">
              "Komunikasi yang baik antara orang tua dan guru adalah kunci keberhasilan hafalan
              anak." — Admin Tahfidz App
            </p>
          </motion.div>
        )}
      </div>
    </OrangtuaLayout>
  );
}
