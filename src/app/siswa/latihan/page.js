'use client';

import { useState, useRef, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  Headphones,
  Mic,
  BookOpenCheck,
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  Sparkles,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  Zap,
  Circle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ModeLatihanPage() {
  const [activeMode, setActiveMode] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Sample quiz questions
  const quizQuestions = [
    {
      question: 'Apa hukum bacaan "Alif Lam Syamsiyah" pada lafadz الشَّمْسُ?',
      options: [
        'Idgham Syamsiyah',
        'Idzhar',
        'Ikhfa',
        'Iqlab'
      ],
      correct: 0,
      explanation: 'Alif Lam Syamsiyah adalah ketika Lam bertemu dengan huruf Syamsiyah (seperti Syin), maka Lam tidak dibaca dan terjadi idgham.'
    },
    {
      question: 'Berapa panjang bacaan Mad Wajib Muttashil?',
      options: [
        '2 harakat',
        '4-5 harakat',
        '6 harakat',
        '1 harakat'
      ],
      correct: 1,
      explanation: 'Mad Wajib Muttashil dibaca panjang 4-5 harakat karena Mad bertemu dengan hamzah dalam satu kata.'
    },
    {
      question: 'Apa hukum Nun Sukun/Tanwin bertemu dengan huruf ب (Ba)?',
      options: [
        'Idzhar',
        'Idgham',
        'Iqlab',
        'Ikhfa'
      ],
      correct: 2,
      explanation: 'Iqlab adalah membalik bunyi Nun Sukun atau Tanwin menjadi Mim (م) ketika bertemu dengan Ba (ب).'
    },
    {
      question: 'Huruf-huruf Idzhar Halqi ada berapa?',
      options: [
        '4 huruf',
        '5 huruf',
        '6 huruf',
        '7 huruf'
      ],
      correct: 2,
      explanation: 'Huruf Idzhar Halqi ada 6: ء، ه، ع، ح، غ، خ'
    },
    {
      question: 'Apa yang dimaksud dengan Qalqalah?',
      options: [
        'Memantulkan huruf ketika sukun',
        'Mendengung',
        'Panjang bacaan',
        'Tebal bacaan'
      ],
      correct: 0,
      explanation: 'Qalqalah adalah memantulkan suara ketika membaca huruf ق، ط، ب، ج، د yang sukun atau di akhir kalimat.'
    }
  ];

  const modes = [
    {
      id: 'dengar',
      title: 'Dengar & Ulangi',
      description: 'Dengarkan bacaan Al-Qur\'an dan ulangi dengan suara Anda',
      icon: Headphones,
      color: 'emerald',
      gradient: 'from-emerald-400 via-green-400 to-teal-400',
      features: ['Audio berkualitas tinggi', 'Repeat mode', 'Speed control']
    },
    {
      id: 'rekam',
      title: 'Rekam Diri Sendiri',
      description: 'Rekam bacaan Anda dan evaluasi sendiri',
      icon: Mic,
      color: 'amber',
      gradient: 'from-amber-400 via-orange-400 to-yellow-400',
      features: ['Rekam audio', 'Playback', 'Download hasil']
    },
    {
      id: 'kuis',
      title: 'Kuis Tajwid',
      description: 'Uji pemahaman tajwid dengan kuis interaktif',
      icon: BookOpenCheck,
      color: 'purple',
      gradient: 'from-purple-400 via-violet-400 to-indigo-400',
      features: ['5 soal tajwid', 'Skor real-time', 'Pembahasan lengkap']
    }
  ];

  // Handle recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Rekaman dimulai...');
    } catch (error) {
      toast.error('Gagal mengakses mikrofon');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Rekaman selesai!');
    }
  };

  const downloadRecording = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `rekaman-hafalan-${Date.now()}.wav`;
      a.click();
      toast.success('Download dimulai...');
    }
  };

  // Handle quiz
  const handleQuizAnswer = (selectedIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuestion] = selectedIndex;
    setQuizAnswers(newAnswers);

    if (selectedIndex === quizQuestions[currentQuestion].correct) {
      setQuizScore(quizScore + 1);
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowQuizResult(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setQuizScore(0);
    setQuizAnswers([]);
    setShowQuizResult(false);
  };

  // Simulate listening progress
  useEffect(() => {
    if (activeMode === 'dengar' && isPlaying) {
      const interval = setInterval(() => {
        setListeningProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeMode, isPlaying]);

  const resetListening = () => {
    setListeningProgress(0);
    setIsPlaying(false);
  };

  return (
    <SiswaLayout>
      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Zap className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Mode Latihan</h1>
                <div className="h-1 w-24 bg-white/30 rounded-full mt-2"></div>
              </div>
            </div>
            <p className="text-purple-50 text-lg flex items-center gap-2">
              <Sparkles size={18} />
              Tingkatkan kemampuan hafalan dengan berbagai mode latihan
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!activeMode ? (
          // Mode Selection
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setActiveMode(mode.id)}
                  className="cursor-pointer group"
                >
                  <div className={`bg-gradient-to-br ${mode.gradient} rounded-3xl p-1 shadow-xl`}>
                    <div className="bg-white rounded-[22px] p-8 h-full">
                      <div className={`p-4 bg-gradient-to-br ${mode.gradient} rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="text-white" size={32} />
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{mode.title}</h3>
                      <p className="text-gray-600 mb-6">{mode.description}</p>

                      <div className="space-y-2">
                        {mode.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mode.gradient}`}></div>
                            {feature}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className={`text-${mode.color}-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all`}>
                          Mulai Latihan
                          <Target size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          // Active Mode Content
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Back Button */}
            <button
              onClick={() => {
                setActiveMode(null);
                resetQuiz();
                resetListening();
                setAudioUrl(null);
              }}
              className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Kembali ke Menu
            </button>

            {/* Dengar & Ulangi Mode */}
            {activeMode === 'dengar' && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl">
                    <Headphones className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Dengar & Ulangi</h2>
                    <p className="text-gray-600">Dengarkan dan tirukan bacaan</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-6">
                  <div className="text-center mb-6">
                    <p className="text-sm text-emerald-700 font-semibold mb-2">Surah Al-Fatihah Ayat 1</p>
                    <p className="text-4xl font-arabic text-gray-900 mb-4" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                    <p className="text-lg text-gray-700 italic mb-2">Bismillāhir-Raḥmānir-Raḥīm</p>
                    <p className="text-gray-600">Dengan nama Allah Yang Maha Pengasih, Maha Penyayang</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${listeningProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">{listeningProgress}%</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                      onClick={resetListening}
                      className="p-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors"
                    >
                      <RotateCcw size={24} />
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    <strong>Tips:</strong> Dengarkan dengan seksama, perhatikan tajwid dan makhraj, lalu ulangi dengan suara Anda sendiri.
                  </p>
                </div>
              </div>
            )}

            {/* Rekam Diri Sendiri Mode */}
            {activeMode === 'rekam' && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl">
                    <Mic className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Rekam Diri Sendiri</h2>
                    <p className="text-gray-600">Rekam dan evaluasi bacaan Anda</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 mb-6">
                  <div className="text-center mb-8">
                    <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-6 ${isRecording ? 'animate-pulse' : ''}`}>
                      <Mic className="text-white" size={48} />
                    </div>

                    {isRecording ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <p className="text-red-600 font-bold">Merekam...</p>
                        </div>
                        <button
                          onClick={stopRecording}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
                        >
                          Berhenti Rekam
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Mic size={20} />
                        Mulai Rekam
                      </button>
                    )}
                  </div>

                  {audioUrl && !isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500 rounded-lg">
                          <CheckCircle className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">Rekaman Berhasil!</p>
                          <p className="text-sm text-gray-600">Dengarkan hasil rekaman Anda</p>
                        </div>
                      </div>

                      <audio controls className="w-full mb-4">
                        <source src={audioUrl} type="audio/wav" />
                      </audio>

                      <button
                        onClick={downloadRecording}
                        className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        Download Rekaman
                      </button>
                    </motion.div>
                  )}
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Tips:</strong> Rekam bacaan Anda, dengarkan kembali, dan evaluasi tajwid serta kelancaran bacaan.
                  </p>
                </div>
              </div>
            )}

            {/* Kuis Tajwid Mode */}
            {activeMode === 'kuis' && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl">
                    <BookOpenCheck className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Kuis Tajwid</h2>
                    <p className="text-gray-600">Uji pemahaman tajwid Anda</p>
                  </div>
                </div>

                {!showQuizResult ? (
                  <div className="space-y-6">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">
                        Soal {currentQuestion + 1} dari {quizQuestions.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="text-purple-500" size={20} />
                        <span className="font-bold text-purple-600">{quizScore} poin</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                      />
                    </div>

                    {/* Question */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
                      <p className="text-xl font-bold text-gray-900 mb-6">
                        {quizQuestions[currentQuestion].question}
                      </p>

                      <div className="space-y-3">
                        {quizQuestions[currentQuestion].options.map((option, index) => {
                          const isAnswered = quizAnswers[currentQuestion] !== undefined;
                          const isSelected = quizAnswers[currentQuestion] === index;
                          const isCorrect = index === quizQuestions[currentQuestion].correct;

                          return (
                            <motion.button
                              key={index}
                              whileHover={!isAnswered ? { scale: 1.02, x: 4 } : {}}
                              onClick={() => !isAnswered && handleQuizAnswer(index)}
                              disabled={isAnswered}
                              className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition-all ${
                                isAnswered
                                  ? isSelected
                                    ? isCorrect
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                      : 'border-red-500 bg-red-50 text-red-700'
                                    : isCorrect
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-gray-200 bg-gray-50 text-gray-500'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isAnswered && (isCorrect || isSelected) && (
                                  isCorrect ? (
                                    <CheckCircle className="text-emerald-500" size={20} />
                                  ) : isSelected ? (
                                    <XCircle className="text-red-500" size={20} />
                                  ) : null
                                )}
                                <span className="flex-1">{option}</span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {quizAnswers[currentQuestion] !== undefined && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-purple-100 border-l-4 border-purple-500 rounded-lg"
                        >
                          <p className="text-sm font-semibold text-purple-900 mb-1">Penjelasan:</p>
                          <p className="text-sm text-purple-800">
                            {quizQuestions[currentQuestion].explanation}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Quiz Result
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-12">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mb-6">
                        <Trophy className="text-white" size={64} />
                      </div>

                      <h3 className="text-3xl font-bold text-gray-900 mb-4">Kuis Selesai!</h3>

                      <div className="mb-6">
                        <p className="text-6xl font-bold text-purple-600 mb-2">{quizScore}/{quizQuestions.length}</p>
                        <p className="text-gray-600">Skor Anda</p>
                      </div>

                      <div className="mb-8">
                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            style={{ width: `${(quizScore / quizQuestions.length) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          {Math.round((quizScore / quizQuestions.length) * 100)}% Benar
                        </p>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={resetQuiz}
                          className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={20} />
                          Ulangi Kuis
                        </button>
                        <button
                          onClick={() => setActiveMode(null)}
                          className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                        >
                          Kembali ke Menu
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .font-arabic {
          font-family: 'Amiri', serif;
        }
      `}</style>
    </SiswaLayout>
  );
}
