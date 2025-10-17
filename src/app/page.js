"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, Award, Target, Phone, Mail, MapPin, ExternalLink, User, Menu, X, GraduationCap, Heart, Star, Calendar, Clock } from "lucide-react";

function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-neutral-800/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB030] rounded-lg flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MAN 1 Bandar Lampung</h1>
              <p className="text-xs text-[#874D14] dark:text-[#FFB030]">Program Tahfidz Al-Qur'an</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030] transition-colors">
              Beranda
            </a>
            <a href="#tentang" className="text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030] transition-colors">
              Tentang
            </a>
            <a href="#program" className="text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030] transition-colors">
              Program
            </a>
            <a href="#kontak" className="text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030] transition-colors">
              Kontak
            </a>
            <Link 
              href="/login" 
              className="bg-[#FFB030] hover:bg-[#874D14] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <User size={16} />
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030]">
                Beranda
              </a>
              <a href="#tentang" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030]">
                Tentang
              </a>
              <a href="#program" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030]">
                Program
              </a>
              <a href="#kontak" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#874D14] dark:hover:text-[#FFB030]">
                Kontak
              </a>
              <div className="pt-2">
                <Link 
                  href="/login" 
                  className="block bg-[#FFB030] hover:bg-[#874D14] text-white px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="home" className="pt-16 pb-20 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#1F1F1F] dark:via-neutral-900 dark:to-[#874D14]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              MAN 1 <span className="text-[#FFB030]">Bandar Lampung</span>
            </h1>
            <h2 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6">
              Program Tahfidz Al-Qur'an
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Membentuk generasi Qur'ani yang berakhlak mulia, berprestasi akademik, dan siap menghadapi tantangan global
              dengan berlandaskan nilai-nilai Al-Qur'an dan As-Sunnah.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/login" 
                className="bg-[#FFB030] hover:bg-[#874D14] text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <User size={20} />
                Masuk ke Portal
              </Link>
              <a 
                href="#program" 
                className="border border-[#FFB030] text-[#874D14] hover:bg-[#FFB030] hover:text-white px-8 py-4 rounded-lg font-semibold transition-all"
              >
                Pelajari Program
              </a>
            </div>
          </div>

          {/* Right Content - School Logo/Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-[#FFB030] to-[#874D14] rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <GraduationCap size={80} className="text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">MAN 1</h3>
                    <p className="text-[#FFB030] font-semibold">Bandar Lampung</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <BookOpen size={24} className="text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <Star size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
            <Users size={32} className="text-[#FFB030] mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Siswa Aktif</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
            <BookOpen size={32} className="text-[#874D14] mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">30+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Juz Dihafal</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
            <Award size={32} className="text-[#FFB030] mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">50+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Penghargaan</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
            <Target size={32} className="text-[#874D14] mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">95%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Kelulusan</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="tentang" className="py-20 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tentang MAN 1 Bandar Lampung
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Sekolah yang berkomitmen mengintegrasikan pendidikan akademik dengan pembinaan karakter Islami
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Visi */}
          <div className="text-center lg:text-left">
            <div className="w-16 h-16 bg-orange-100 dark:bg-[#874D14]/30 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
              <Target size={32} className="text-[#874D14]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Visi</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Menjadi madrasah unggul yang menghasilkan lulusan beriman, bertakwa, berakhlak mulia, 
              berprestasi akademik, dan mampu menghadapi tantangan global.
            </p>
          </div>

          {/* Misi */}
          <div className="text-center lg:text-left">
            <div className="w-16 h-16 bg-amber-100 dark:bg-[#FFB030]/30 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
              <BookOpen size={32} className="text-[#FFB030]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Misi</h3>
            <div className="text-gray-600 dark:text-gray-400 text-left">
              <ul className="space-y-2">
                <li>• Menyelenggarakan pendidikan berkualitas</li>
                <li>• Mengembangkan program tahfidz Al-Qur'an</li>
                <li>• Membina akhlak mulia siswa</li>
                <li>• Mengintegrasikan IPTEK dan IMTAQ</li>
                <li>• Mempersiapkan siswa menghadapi era global</li>
              </ul>
            </div>
          </div>

          {/* Tujuan */}
          <div className="text-center lg:text-left">
            <div className="w-16 h-16 bg-orange-100 dark:bg-[#874D14]/30 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
              <Award size={32} className="text-[#874D14]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tujuan</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Menghasilkan lulusan yang hafal Al-Qur'an, unggul dalam prestasi akademik, 
              berkarakter Islami, dan siap melanjutkan ke perguruan tinggi terbaik.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramSection() {
  const programs = [
    {
      icon: BookOpen,
      title: "Tahfidz Al-Qur'an",
      description: "Program menghafal Al-Qur'an dengan target minimal 10 juz untuk setiap siswa dengan metode pembelajaran yang efektif dan menyenangkan.",
      features: ["Metode Talaqqi", "Muraja'ah Harian", "Evaluasi Berkala", "Sertifikasi Hafalan"],
      color: "primary"
    },
    {
      icon: Users,
      title: "Pembelajaran Akademik",
      description: "Kurikulum nasional yang diperkaya dengan mata pelajaran agama dan pengembangan karakter Islami untuk menciptakan keseimbangan IMTAQ dan IPTEK.",
      features: ["Kurikulum 2013", "Pembelajaran Aktif", "Laboratorium Lengkap", "Guru Berkualitas"],
      color: "secondary"
    },
    {
      icon: Heart,
      title: "Pembinaan Karakter",
      description: "Program pembinaan akhlak dan karakter melalui kegiatan keagamaan, bimbingan konseling, dan aktivitas ekstrakurikuler yang Islami.",
      features: ["Mentoring Agama", "Sholat Berjamaah", "Kajian Rutin", "Pesantren Kilat"],
      color: "accent"
    }
  ];

  const colorClasses = {
    primary: "bg-[#FFB030]",
    secondary: "bg-[#874D14]", 
    accent: "bg-[#1F1F1F]"
  };

  return (
    <section id="program" className="py-20 bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Program Unggulan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Program-program berkualitas yang dirancang untuk mengembangkan potensi siswa secara optimal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`w-16 h-16 ${colorClasses[program.color]} rounded-full flex items-center justify-center mb-6`}>
                <program.icon size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {program.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {program.description}
              </p>
              <div className="space-y-2">
                {program.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${colorClasses[program.color]} rounded-full`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="kontak" className="py-20 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hubungi Kami
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Dapatkan informasi lebih lanjut tentang program tahfidz dan pendaftaran siswa baru
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Informasi Kontak</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-[#FFB030]/30 rounded-lg flex items-center justify-center">
                  <MapPin size={24} className="text-[#FFB030]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Alamat</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Jl. Letkol Endro Suratmin No. 1<br/>
                    Sukarame, Bandar Lampung 35131<br/>
                    Lampung, Indonesia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-[#874D14]/30 rounded-lg flex items-center justify-center">
                  <Phone size={24} className="text-[#874D14]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Telepon</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    (0721) 704-371<br/>
                    +62 812 3456 7890
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-[#FFB030]/30 rounded-lg flex items-center justify-center">
                  <Mail size={24} className="text-[#FFB030]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    info@man1bandarlampung.sch.id<br/>
                    tahfidz@man1bandarlampung.sch.id
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-[#874D14]/30 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-[#874D14]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Jam Operasional</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Senin - Jumat: 07:00 - 16:00<br/>
                    Sabtu: 07:00 - 12:00<br/>
                    Minggu: Tutup
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Kirim Pesan</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  placeholder="Masukkan email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subjek
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  placeholder="Subjek pesan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pesan
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  placeholder="Tulis pesan Anda..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FFB030] hover:bg-[#874D14] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FFB030] rounded-lg flex items-center justify-center">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">MAN 1 Bandar Lampung</h3>
                <p className="text-[#FFB030] text-sm">Program Tahfidz Al-Qur'an</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Mendidik generasi Qur'ani yang berakhlak mulia, berprestasi akademik,
              dan siap menghadapi tantangan global dengan landasan Al-Qur'an dan As-Sunnah.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#FFB030] transition-colors">
                <ExternalLink size={16} />
              </div>
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#FFB030] transition-colors">
                <Mail size={16} />
              </div>
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#FFB030] transition-colors">
                <Phone size={16} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu</h4>
            <div className="space-y-2">
              <a href="#home" className="block text-gray-300 hover:text-[#FFB030] transition-colors">Beranda</a>
              <a href="#tentang" className="block text-gray-300 hover:text-[#FFB030] transition-colors">Tentang</a>
              <a href="#program" className="block text-gray-300 hover:text-[#FFB030] transition-colors">Program</a>
              <a href="#kontak" className="block text-gray-300 hover:text-[#FFB030] transition-colors">Kontak</a>
              <Link href="/login" className="block text-gray-300 hover:text-[#FFB030] transition-colors">Login</Link>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Program</h4>
            <div className="space-y-2">
              <div className="text-gray-300">Tahfidz Al-Qur'an</div>
              <div className="text-gray-300">Pembelajaran Akademik</div>
              <div className="text-gray-300">Pembinaan Karakter</div>
              <div className="text-gray-300">Ekstrakurikuler</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 MAN 1 Bandar Lampung. Hak Cipta Dilindungi. Dibuat dengan ❤️ untuk pendidikan.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <PublicNavbar />
      <HeroSection />
      <AboutSection />
      <ProgramSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
