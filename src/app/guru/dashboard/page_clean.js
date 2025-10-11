"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Award,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  Bell,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

// Mock data
const mockData = {
  stats: {
    totalStudents: 24,
    averageProgress: 75,
    pendingReviews: 8,
    completedToday: 12
  },
  pendingReviews: [
    {
      id: 1,
      student: "Ahmad Zaki",
      surah: "Al-Baqarah",
      ayat: "1-10",
      type: "Audio",
      timestamp: "2025-09-26 08:30",
      duration: "5:30"
    },
    {
      id: 2,
      student: "Fatimah Sari",
      surah: "Ali Imran",
      ayat: "15-25",
      type: "Live",
      timestamp: "2025-09-26 07:45"
    },
    {
      id: 3,
      student: "Muhammad Hafiz",
      surah: "An-Nisa",
      ayat: "30-40",
      type: "Audio",
      timestamp: "2025-09-25 16:20",
      duration: "4:20"
    }
  ],
  students: [
    {
      id: 1,
      name: "Ahmad Zaki",
      class: "XII IPA 1",
      target: "Al-Baqarah",
      progress: 85,
      status: "Aktif",
      lastSubmission: "2025-09-26"
    },
    {
      id: 2,
      name: "Fatimah Sari",
      class: "XII IPA 1",
      target: "Ali Imran",
      progress: 70,
      status: "Perlu Perhatian",
      lastSubmission: "2025-09-25"
    },
    {
      id: 3,
      name: "Muhammad Hafiz",
      class: "XII IPA 2",
      target: "An-Nisa",
      progress: 90,
      status: "Aktif",
      lastSubmission: "2025-09-26"
    }
  ]
};

// Components
function StatCard({ title, value, icon: Icon, trend, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800"
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-[#1F1F1F]">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp size={14} className="mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function PendingReviewCard({ review, onReview, onPlayAudio }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-[#1F1F1F]">{review.student}</h4>
          <p className="text-sm text-gray-600">{review.surah} - Ayat {review.ayat}</p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className={`px-2 py-1 rounded-full ${
            review.type === "Audio" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
          }`}>
            <div className="flex items-center space-x-1">
              {review.type === "Audio" ? <Volume2 size={12} /> : <MessageSquare size={12} />}
              <span>{review.type}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mb-3">{review.timestamp}</p>
      
      <div className="flex space-x-2">
        {review.type === "Audio" && (
          <button
            onClick={() => onPlayAudio(review)}
            className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Play size={12} />
            <span>Putar Rekaman</span>
          </button>
        )}
        <button
          onClick={() => onReview(review)}
          className="flex-1 px-3 py-1 text-xs bg-[#FFB030] text-white rounded-md hover:bg-[#874D14] transition-colors"
        >
          Review Sekarang
        </button>
      </div>
    </div>
  );
}

function StudentCard({ student, onViewStudent, onEditStudent, onDeleteStudent }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[#1F1F1F]">{student.name}</h3>
          <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
            student.status === "Aktif" ? "bg-green-100 text-green-800" :
            student.status === "Perlu Perhatian" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {student.status}
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Kelas:</span>
          <span className="font-medium">{student.class}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Target:</span>
          <span className="font-medium">{student.target}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Progress:</span>
          <span className="font-medium">{student.progress}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Terakhir Setor:</span>
          <span className="font-medium">{student.lastSubmission}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onViewStudent(student)}
          className="flex items-center space-x-1 px-3 py-1 text-xs bg-[#FFB030] text-white rounded-md hover:bg-[#874D14] transition-colors"
        >
          <Eye size={12} />
          <span>Profil</span>
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditStudent(student)}
            className="text-[#874D14] hover:text-[#1F1F1F]"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDeleteStudent(student)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuruDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect if not guru
      if (parsedUser.role !== "guru") {
        router.push("/dashboard");
        return;
      }
    } else {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleViewStudent = (student) => {
    console.log("View student:", student);
  };

  const handleEditStudent = (student) => {
    console.log("Edit student:", student);
  };

  const handleDeleteStudent = (student) => {
    console.log("Delete student:", student);
  };

  const handleReview = (review) => {
    console.log("Review:", review);
  };

  const handlePlayAudio = (review) => {
    console.log("Play audio:", review);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB030] mx-auto"></div>
          <p className="mt-4 text-[#1F1F1F]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "guru") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F1F1F1]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-[#FFB030] p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F1F1F]">Dashboard Guru</h1>
                <p className="text-sm text-gray-600">Selamat datang, {user?.name || "Ustadz Muhammad"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-[#874D14] transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#874D14] text-white rounded-lg hover:bg-[#1F1F1F] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Siswa Bimbingan"
              value={mockData.stats.totalStudents}
              icon={Users}
              trend="+2 siswa bulan ini"
              color="blue"
            />
            <StatCard
              title="Progress Rata-rata"
              value={`${mockData.stats.averageProgress}%`}
              icon={TrendingUp}
              trend="+5% dari bulan lalu"
              color="green"
            />
            <StatCard
              title="Menunggu Review"
              value={mockData.stats.pendingReviews}
              icon={AlertTriangle}
              color="orange"
            />
            <StatCard
              title="Setor Hari Ini"
              value={mockData.stats.completedToday}
              icon={CheckCircle}
              trend="+3 dari kemarin"
              color="green"
            />
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Reviews */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#1F1F1F]">Setoran Menunggu Review</h2>
                <span className="bg-[#FFB030] text-white px-2 py-1 rounded-full text-sm">
                  {mockData.pendingReviews.length}
                </span>
              </div>
              
              <div className="space-y-4">
                {mockData.pendingReviews.map((review) => (
                  <PendingReviewCard
                    key={review.id}
                    review={review}
                    onReview={handleReview}
                    onPlayAudio={handlePlayAudio}
                  />
                ))}
              </div>
            </div>

            {/* Student Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-[#1F1F1F] mb-6">Aktivitas Siswa Terbaru</h2>
              
              <div className="space-y-4">
                {mockData.students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onViewStudent={handleViewStudent}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                ))}
              </div>
              
              <button className="w-full mt-4 px-4 py-2 text-sm text-[#874D14] border border-[#874D14] rounded-lg hover:bg-[#874D14] hover:text-white transition-colors">
                Lihat Semua Siswa
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}