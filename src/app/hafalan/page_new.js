"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function HafalanPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect if not siswa
      if (parsedUser.role !== "siswa") {
        router.push("/dashboard");
        return;
      }
    } else {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center">
        <LoadingIndicator text="Loading..." />
      </div>
    );
  }

  if (!user || user.role !== "siswa") {
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
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F1F1F]">Tahfidz Digital</h1>
                <p className="text-sm text-gray-600">MAN 1 Bandar Lampung</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hi, {user?.name || "Siswa"}</span>
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  router.push("/login");
                }}
                className="px-4 py-2 bg-[#874D14] text-white rounded-lg hover:bg-[#1F1F1F] transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">Hafalan Saya</h2>
          <p className="text-gray-600">Pantau progress hafalan dan upload setoran baru</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hafalan Selesai</p>
                <p className="text-2xl font-semibold text-[#1F1F1F]">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sedang Review</p>
                <p className="text-2xl font-semibold text-[#1F1F1F]">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-[#FFB030] p-3 rounded-full">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Surah</p>
                <p className="text-2xl font-semibold text-[#1F1F1F]">15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section - Simple version for now */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#1F1F1F] mb-4">Upload Hafalan Baru</h3>
          <p className="text-gray-600 mb-6">Fitur upload audio akan segera tersedia</p>
          <button className="bg-[#FFB030] hover:bg-[#874D14] text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Coming Soon - Upload Audio
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#1F1F1F]">Aktivitas Terbaru</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { action: "Setoran Al-Fatihah", status: "Diterima", time: "2 jam lalu", score: 85 },
                { action: "Setoran Al-Baqarah 1-5", status: "Review", time: "1 hari lalu", score: null },
                { action: "Setoran An-Nas", status: "Diterima", time: "3 hari lalu", score: 92 },
                { action: "Setoran Al-Falaq", status: "Revisi", time: "5 hari lalu", score: 70 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === "Diterima" ? "bg-green-500" :
                      item.status === "Review" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}></div>
                    <div>
                      <p className="font-medium text-[#1F1F1F]">{item.action}</p>
                      <p className="text-sm text-gray-600">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {item.score && (
                      <span className="text-sm font-medium text-[#FFB030]">
                        {item.score}/100
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Diterima" ? "bg-green-100 text-green-800" :
                      item.status === "Review" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}