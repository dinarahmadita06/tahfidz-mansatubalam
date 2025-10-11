import { BarChart3, TrendingUp, Calendar, Target, BookOpen, Clock, Star, Download } from "lucide-react";

function MetricCard({ icon: Icon, title, value, change, changeType = "positive" }) {
  const changeColor = changeType === "positive" 
    ? "text-emerald-600 dark:text-emerald-400" 
    : "text-red-600 dark:text-red-400";
  
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900 p-3">
          <Icon size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className={`text-sm font-medium ${changeColor} flex items-center gap-1`}>
          <TrendingUp size={16} />
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
    </div>
  );
}

function ProgressChart() {
  const data = [
    { month: "Sep", hafalan: 45, murajaah: 30 },
    { month: "Okt", hafalan: 52, murajaah: 38 },
    { month: "Nov", hafalan: 38, murajaah: 45 },
    { month: "Des", hafalan: 65, murajaah: 42 },
    { month: "Jan", hafalan: 58, murajaah: 50 },
    { month: "Feb", hafalan: 72, murajaah: 55 },
  ];

  const maxValue = Math.max(...data.flatMap(d => [d.hafalan, d.murajaah]));

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Bulanan</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Hafalan baru vs Murajaah</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Hafalan Baru</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Murajaah</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex items-end justify-between h-64 gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end gap-1 mb-2 w-full">
                <div 
                  className="bg-emerald-500 rounded-t w-full transition-all duration-500 ease-out"
                  style={{ height: `${(item.hafalan / maxValue) * 200}px` }}
                  title={`Hafalan: ${item.hafalan} ayat`}
                ></div>
                <div 
                  className="bg-blue-500 rounded-t w-full transition-all duration-500 ease-out"
                  style={{ height: `${(item.murajaah / maxValue) * 200}px` }}
                  title={`Murajaah: ${item.murajaah} ayat`}
                ></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SurahProgress() {
  const surahData = [
    { name: "Al-Fatihah", progress: 100, ayat: "7/7" },
    { name: "Al-Baqarah", progress: 45, ayat: "130/286" },
    { name: "Ali Imran", progress: 15, ayat: "30/200" },
    { name: "An-Nisa", progress: 0, ayat: "0/176" },
    { name: "Al-Maidah", progress: 0, ayat: "0/120" },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress per Surah</h3>
        <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium">
          Lihat Semua
        </button>
      </div>
      
      <div className="space-y-4">
        {surahData.map((surah, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">{surah.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{surah.ayat}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${surah.progress}%` }}
              ></div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">{surah.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyActivity() {
  const weekData = [
    { day: "Sen", count: 8, active: true },
    { day: "Sel", count: 12, active: true },
    { day: "Rab", count: 6, active: true },
    { day: "Kam", count: 15, active: true },
    { day: "Jum", count: 10, active: true },
    { day: "Sab", count: 4, active: false },
    { day: "Min", count: 0, active: false },
  ];

  const maxCount = Math.max(...weekData.map(d => d.count));

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Aktivitas Mingguan</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => (
          <div key={index} className="text-center">
            <div className="mb-2">
              <div 
                className={`h-12 rounded-lg flex items-end justify-center transition-all duration-300 ${
                  day.active 
                    ? "bg-emerald-500" 
                    : "bg-gray-200 dark:bg-neutral-800"
                }`}
              >
                <div 
                  className={`w-full rounded-lg transition-all duration-500 ${
                    day.active ? "bg-emerald-600" : "bg-gray-300 dark:bg-neutral-700"
                  }`}
                  style={{ height: day.count > 0 ? `${(day.count / maxCount) * 100}%` : "8px" }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {day.day}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {day.count}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total minggu ini: <span className="font-semibold text-emerald-600 dark:text-emerald-400">55 ayat</span>
        </p>
      </div>
    </div>
  );
}

export default function LaporanPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analisis mendalam progress hafalan Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-neutral-600 px-4 py-2 rounded-lg font-medium transition-colors">
            <Calendar size={16} />
            Filter Periode
          </button>
          <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={BookOpen}
          title="Ayat Bulan Ini"
          value="72"
          change="+15.2%"
        />
        <MetricCard
          icon={Clock}
          title="Rata-rata Harian"
          value="2.4"
          change="+8.1%"
        />
        <MetricCard
          icon={Target}
          title="Target Tercapai"
          value="85%"
          change="+12%"
        />
        <MetricCard
          icon={Star}
          title="Streak Terpanjang"
          value="24"
          change="+4 hari"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        <WeeklyActivity />
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SurahProgress />
        
        {/* Achievement Summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pencapaian Terbaru</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <div className="rounded-full bg-emerald-500 p-2">
                <BookOpen size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-900 dark:text-emerald-100">Surah Completed</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Menyelesaikan Al-Fatihah</p>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">2 hari lalu</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="rounded-full bg-blue-500 p-2">
                <Target size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">Monthly Goal</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Mencapai target 100 ayat</p>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400">1 minggu lalu</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="rounded-full bg-purple-500 p-2">
                <Star size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-900 dark:text-purple-100">Consistency Master</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">20 hari berturut-turut</p>
              </div>
              <span className="text-xs text-purple-600 dark:text-purple-400">3 hari lalu</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-800">
            <button className="w-full text-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm">
              Lihat Semua Pencapaian
            </button>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-500 p-3 flex-shrink-0">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Insights & Rekomendasi
            </h3>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Progress Anda meningkat 15% bulan ini - pertahankan konsistensi!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Waktu terbaik untuk hafalan: pagi hari (07:00-09:00)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Tingkatkan frekuensi murajaah untuk memperkuat hafalan lama</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

