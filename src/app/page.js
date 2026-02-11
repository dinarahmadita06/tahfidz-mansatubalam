"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import { 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  User, 
  Menu, 
  X, 
  GraduationCap, 
  Heart, 
  Star, 
  Calendar, 
  Clock,
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight,
  Info,
  TrendingUp,
  Layout,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import Link
const Link = dynamic(() => import("next/link"), { ssr: false });

// UI Preview Cards for Hero
const UIPreviewStack = () => (
  <div className="relative w-full h-[400px] md:h-[500px]">
    {/* Glow background */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-400/20 rounded-full blur-[100px] -z-10" />
    
    {/* Card 3: Orang Tua (Bottom) */}
    <motion.div 
      initial={{ opacity: 0, x: 40, y: 40, rotate: 5 }}
      animate={{ opacity: 1, x: 20, y: 20, rotate: 2 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[40%] w-[280px] md:w-[320px] bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-2xl p-5 z-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
          <Heart size={16} />
        </div>
        <div className="h-3 w-24 bg-slate-100 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-12 bg-emerald-50 rounded-2xl border border-emerald-100/50 p-3 flex justify-between items-center">
          <div className="h-2 w-20 bg-emerald-200 rounded" />
          <div className="h-4 w-4 bg-emerald-400 rounded-full" />
        </div>
        <div className="h-20 bg-slate-50 rounded-2xl border border-slate-100 p-3">
          <div className="h-2 w-full bg-slate-200 rounded mb-2" />
          <div className="h-2 w-2/3 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <div className="h-6 w-16 bg-blue-500 rounded-lg" />
      </div>
    </motion.div>

    {/* Card 2: Guru (Middle) */}
    <motion.div 
      initial={{ opacity: 0, x: -40, y: 20, rotate: -5 }}
      animate={{ opacity: 1, x: -30, y: 0, rotate: -2 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[50%] w-[280px] md:w-[320px] bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-2xl p-5 z-20"
    >
      <div className="bg-emerald-500 rounded-2xl p-4 text-white mb-4">
        <div className="h-2 w-20 bg-white/30 rounded mb-2" />
        <div className="h-4 w-32 bg-white rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center justify-between p-2 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 rounded-full" />
              <div className="h-2 w-16 bg-slate-200 rounded" />
            </div>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              <div className="w-3 h-3 bg-emerald-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-8 bg-emerald-50 rounded-xl border border-emerald-100" />
    </motion.div>

    {/* Card 1: Siswa (Top) */}
    <motion.div 
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: -20, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[60%] w-[300px] md:w-[340px] bg-white border border-emerald-100 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.2)] p-6 z-30"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-rose-400 rounded-full" />
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <Zap size={14} />
        </div>
      </div>
      
      <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <div className="h-2 w-12 bg-emerald-200 rounded mb-2" />
          <div className="h-6 w-16 bg-emerald-500 rounded-lg" />
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <div className="h-2 w-12 bg-blue-200 rounded mb-2" />
          <div className="h-6 w-16 bg-blue-500 rounded-lg" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-2 w-24 bg-slate-100 rounded" />
          <div className="h-2 w-8 bg-emerald-400 rounded" />
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ delay: 1, duration: 1 }}
            className="h-full bg-gradient-to-r from-emerald-400 to-green-500" 
          />
        </div>
      </div>
    </motion.div>
  </div>
);

// Reusable Components
const Section = ({ id, children, className = "", dark = false }) => (
  <section id={id} className={`py-10 lg:py-16 px-4 md:px-8 overflow-hidden ${dark ? 'bg-[#F0FDFA]' : 'bg-white'} ${className}`}>
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white/70 backdrop-blur-md border border-emerald-100 p-6 lg:p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-500 group"
  >
    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-400 via-green-400 to-teal-400 rounded-xl flex items-center justify-center mb-4 lg:mb-6 text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
      <Icon size={24} />
    </div>
    <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 lg:mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, sub, index, loading }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white/70 backdrop-blur-md border border-emerald-100 p-4 lg:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border-b-4 border-b-emerald-400 group"
  >
    <div className="flex items-center gap-3 mb-3 lg:mb-4">
      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
        <Icon size={18} />
      </div>
      <div className="text-[10px] lg:text-xs font-bold text-slate-800 uppercase tracking-widest leading-tight">{label}</div>
    </div>
    
    <div className="mb-1.5 lg:mb-2">
      {loading ? (
        <div className="h-8 lg:h-10 w-16 lg:w-20 bg-slate-100 animate-pulse rounded-lg" />
      ) : (
        <div className="text-2xl lg:text-4xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
          {value || 0}{label.includes('Nilai') ? '' : '+'}
        </div>
      )}
    </div>

    <div className="flex items-start gap-1.5">
      <Info size={10} className="text-slate-400 mt-0.5" />
      <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
        {sub || "Data akan terisi otomatis setelah penggunaan"}
      </p>
    </div>
  </motion.div>
);

export default function SIMTAQLandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('android');
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  // Dynamic Stats State
  const [stats, setStats] = useState({
    siswaAktif: 0,
    guruPembina: 0,
    setoranTercatat: 0,
    rataRataNilai: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch Dynamic Stats
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public/stats', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();

    // PWA Install Prompt Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Scroll Logic
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDFA] to-[#ECFDF5] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-lg border-b border-emerald-100 py-3 shadow-sm' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-man1.png" 
              alt="Logo MAN 1 Bandar Lampung" 
              className="h-7 w-auto object-contain"
              onError={(e) => {
                e.target.outerHTML = '<div class="w-10 h-10 bg-gradient-to-br from-emerald-400 via-green-400 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg></div>';
              }}
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SIMTAQ</span>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Portal Tahfidz</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Beranda', 'Fitur', 'Cara Install'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors"
              >
                {item}
              </a>
            ))}
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100 hover:shadow-emerald-200 flex items-center gap-2"
            >
              <User size={16} />
              Login Portal
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-emerald-100 overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {['Beranda', 'Fitur', 'Cara Install', 'Kontak'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase().replace(' ', '-')}`} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold text-slate-800"
                  >
                    {item}
                  </a>
                ))}
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-4 rounded-xl text-center font-bold"
                >
                  Login Portal
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Section */}
      <section id="beranda" className="relative pt-24 pb-10 md:pt-32 lg:pt-40 md:pb-20 px-4 overflow-hidden">
        {/* Subtle Blur Glows */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-200/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:pr-8"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold mb-4 lg:mb-6 border border-emerald-100">
              <Smartphone size={14} />
              Portal Aplikasi Berbasis PWA
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] mb-3 tracking-tight">
              <span className="block">SIMTAQ — Sistem Informasi</span>
              <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Manajemen Tahfidz
              </span>
              <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Qur&#39;an
              </span>
            </h1>
            <p className="text-base lg:text-lg text-slate-600 mb-8 lg:mb-10 leading-relaxed max-w-xl font-medium">
              Pantau hafalan, penilaian, dan perkembangan siswa secara realtime untuk guru, siswa, dan orang tua dalam satu portal aplikasi.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <Link 
                href="/login"
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-bold text-base lg:text-lg transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 group"
              >
                Masuk ke Portal
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button 
                onClick={handleInstallClick}
                className="bg-white hover:bg-emerald-50 text-emerald-600 border-2 border-emerald-100 px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-bold text-base lg:text-lg transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                {isInstalled ? (
                  <>
                    <CheckCircle2 size={20} />
                    Aplikasi Terpasang
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Install Aplikasi
                  </>
                )}
              </button>
            </div>

            <div className="mt-8">
              <a 
                href="https://man1balam.sch.id/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 text-sm font-bold transition-colors"
              >
                <ExternalLink size={14} />
                Website Resmi MAN 1 Bandar Lampung
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block lg:pl-4"
          >
            <UIPreviewStack />
          </motion.div>
        </div>
      </section>

      {/* 3. Statistik Section (Dynamic) */}
      <Section id="statistik" className="pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Users} 
            label="Siswa Aktif" 
            value={stats.siswaAktif} 
            sub={stats.siswaAktif > 0 ? "Data dari sistem SIMTAQ" : "Data akan terisi otomatis"}
            loading={loadingStats}
            index={0} 
          />
          <StatCard 
            icon={GraduationCap} 
            label="Guru Pembina" 
            value={stats.guruPembina} 
            sub={stats.guruPembina > 0 ? "Guru aktif pembina tahfidz" : "Data akan terisi otomatis"}
            loading={loadingStats}
            index={1} 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Setoran Tercatat" 
            value={stats.setoranTercatat} 
            sub={stats.setoranTercatat > 0 ? "Sejak awal penggunaan sistem" : "Belum ada setoran tercatat"}
            loading={loadingStats}
            index={2} 
          />
          <StatCard 
            icon={Award} 
            label="Rata-rata Nilai" 
            value={stats.rataRataNilai} 
            sub={stats.rataRataNilai > 0 ? "Update otomatis dari penilaian" : "Belum ada penilaian hafalan"}
            loading={loadingStats}
            index={3} 
          />
        </div>
      </Section>

      {/* 4. Fitur SIMTAQ */}
      <Section id="fitur">
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black text-slate-900 mb-3 lg:mb-4 tracking-tight">Kenapa SIMTAQ?</h2>
          
          <p className="text-slate-600 max-w-2xl mx-auto font-medium text-sm lg:text-base">SIMTAQ digunakan di MAN 1 Bandar Lampung untuk memudahkan kolaborasi antara Guru, Siswa, dan Orang Tua dalam monitoring tahfidz secara realtime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Target} 
            title="Monitoring Hafalan" 
            description="Pantau progres hafalan setiap siswa secara mendetail per juz, surah, hingga ayat secara realtime."
            index={0}
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Penilaian Standar" 
            description="Sistem penilaian terukur meliputi Tajwid, Makharij, dan Kelancaran untuk kualitas hafalan terbaik."
            index={1}
          />
          <FeatureCard 
            icon={Calendar} 
            title="Rekap Aktivitas" 
            description="Log kehadiran dan aktivitas setoran harian yang tersusun rapi untuk memantau konsistensi siswa."
            index={2}
          />
          <FeatureCard 
            icon={Heart} 
            title="Feedback Guru" 
            description="Orang tua mendapatkan catatan langsung dari guru pembina mengenai perkembangan karakter anak."
            index={3}
          />
          <FeatureCard 
            icon={FileText} 
            title="Laporan PDF" 
            description="Dapatkan rekap laporan bulanan dalam format PDF."
            index={4}
          />
          <FeatureCard 
            icon={Layout} 
            title="Akses Multi-role" 
            description="Satu portal dengan antarmuka yang disesuaikan untuk kebutuhan Guru, Siswa, maupun Orang Tua."
            index={5}
          />
        </div>
      </Section>

      {/* 5. Cara Install PWA */}
      <Section id="cara-install" dark>
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3 lg:mb-4 tracking-tight">Cara Install Aplikasi</h2>
          <p className="text-slate-600 max-w-xl mx-auto font-medium text-sm lg:text-base">SIMTAQ adalah aplikasi web modern yang bisa dipasang di smartphone Anda tanpa harus melalui Play Store atau App Store.</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur border border-emerald-100 p-4 shadow-lg rounded-[2rem]">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-emerald-50/50 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'android' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-500'}`}
            >
              <Smartphone size={18} />
              Android (Chrome)
            </button>
            <button 
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ios' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-500'}`}
            >
              <div className="w-5 h-5 bg-slate-700 rounded-lg flex items-center justify-center text-white text-[10px]">i</div>
              iPhone (Safari)
            </button>
          </div>

          <div className="p-4 md:p-8">
            <ul className="space-y-6">
              {(activeTab === 'android' ? [
                "Buka browser Google Chrome di HP Anda.",
                "Klik ikon titik tiga (⋮) di pojok kanan atas.",
                "Pilih menu 'Install App' atau 'Tambahkan ke Layar Utama'.",
                "Klik 'Install' dan tunggu hingga aplikasi muncul di home screen."
              ] : [
                "Buka browser Safari di iPhone Anda.",
                "Klik ikon 'Share' (kotak dengan panah ke atas) di bagian bawah.",
                "Scroll ke bawah dan pilih 'Add to Home Screen'.",
                "Klik 'Add' di pojok kanan atas."
              ]).map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 font-bold text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ul>

            <div className="mt-12 text-center">
              <button 
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 mx-auto"
              >
                <Download size={20} />
                {isInstalled ? "Aplikasi Sudah Terpasang" : "Install Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. Kontak & Footer */}
      <footer id="kontak" className="bg-slate-900 text-white pt-20 pb-10 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
            {/* Logo & Deskripsi - 5 kolom */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <GraduationCap size={24} />
                </div>
                <span className="text-2xl font-black tracking-tight uppercase">SIMTAQ</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8 font-medium max-w-sm">
                Membentuk generasi Qur&#39;ani dengan dukungan teknologi monitoring yang handal, transparan, dan mudah diakses.
              </p>
            </div>

            {/* Menu - 7 kolom dibagi 2 */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h4 className="font-bold text-lg mb-6 text-emerald-400">Navigasi</h4>
                <ul className="space-y-4 text-slate-400 text-sm font-bold">
                  <li><a href="#beranda" className="hover:text-emerald-400 transition-colors">Beranda</a></li>
                  <li><a href="#fitur" className="hover:text-emerald-400 transition-colors">Fitur</a></li>
                  <li><a href="#cara-install" className="hover:text-emerald-400 transition-colors">Cara Install</a></li>
                  <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Login Portal</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6 text-emerald-400">Legalitas</h4>
                <ul className="space-y-4 text-slate-400 text-sm font-bold">
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Kebijakan Privasi</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Syarat Ketentuan</a></li>
                  <li><a href="https://man1bandarlampung.sch.id" className="hover:text-emerald-400 transition-colors">Website Sekolah</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">© 2026 SIMTAQ — MAN 1 Bandar Lampung. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Manual Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              {/* Modal Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-100 rounded-full blur-3xl -z-10" />

              <button 
                onClick={() => setShowInstallModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                  <Smartphone size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Instalasi Manual</h3>
                <p className="text-slate-500 text-sm font-medium">Browser Anda tidak mendukung instalasi otomatis. Silakan ikuti panduan sederhana di bawah:</p>
              </div>

              <div className="space-y-4 mb-10">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                  <div className="w-7 h-7 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0">1</div>
                  <p className="text-sm text-slate-700 font-bold leading-relaxed">Klik menu browser (ikon titik tiga atau tombol share).</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                  <div className="w-7 h-7 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0">2</div>
                  <p className="text-sm text-slate-700 font-bold leading-relaxed">Pilih &#39;Tambahkan ke Layar Utama&#39; atau &#39;Install Aplikasi&#39;.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInstallModal(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black transition-all hover:bg-slate-800 shadow-lg shadow-slate-200"
              >
                Saya Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
