"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  Plus,
  RotateCcw,
  ChevronDown,
  X,
  Check
} from "lucide-react";

export default function GuruDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data kelas yang diampu (default)
  const [kelasGuru, setKelasGuru] = useState(["X IPA 1", "XI IPS 2"]);
  
  // Daftar kelas lain yang bisa diambil sebagai pengganti
  const kelasLainnya = ["X IPA 2", "XII IPA 1", "X IPS 1", "XI IPA 3", "XII IPS 2"];
  
  // State untuk modal dan dropdown
  const [showModal, setShowModal] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // State untuk kelas pengganti
  const [kelasPengganti, setKelasPengganti] = useState([]);

  // Load data dari localStorage saat pertama kali
  useEffect(() => {
    const mockUser = {
      name: "Ustadz Muhammad",
      role: "guru",
      id: 1
    };
    
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.role !== "guru") {
        router.push("/dashboard");
        return;
      }
    } else {
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    }

    // Load kelas pengganti dari localStorage
    const savedKelasPengganti = localStorage.getItem("kelasPengganti");
    if (savedKelasPengganti) {
      setKelasPengganti(JSON.parse(savedKelasPengganti));
    }

    setIsLoading(false);
  }, [router]);

  // Fungsi untuk menambah kelas pengganti
  const handleAmbilKelasPengganti = () => {
    if (selectedKelas && !kelasPengganti.includes(selectedKelas)) {
      const updatedKelasPengganti = [...kelasPengganti, selectedKelas];
      setKelasPengganti(updatedKelasPengganti);
      localStorage.setItem("kelasPengganti", JSON.stringify(updatedKelasPengganti));
      setSelectedKelas("");
      setShowModal(false);
      setShowDropdown(false);
    }
  };

  // Fungsi untuk reset data
  const handleResetData = () => {
    localStorage.removeItem("kelasPengganti");
    setKelasPengganti([]);
  };

  // Filter kelas yang belum diambil sebagai pengganti
  const availableKelas = kelasLainnya.filter(kelas => 
    !kelasGuru.includes(kelas) && !kelasPengganti.includes(kelas)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "guru") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard Guru Tahfidz
              </h1>
              <p className="text-gray-600">Selamat datang, {user?.name || "Ustadz Muhammad"}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ambil Kelas Pengganti
              </button>
              
              <button
                onClick={handleResetData}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Data
              </button>
            </div>
          </div>
        </div>

        {/* Statistik Ringkas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kelas Tetap</p>
                <p className="text-2xl font-bold text-blue-600">{kelasGuru.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kelas Pengganti</p>
                <p className="text-2xl font-bold text-green-600">{kelasPengganti.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Kelas</p>
                <p className="text-2xl font-bold text-purple-600">{kelasGuru.length + kelasPengganti.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Kelas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Kelas yang Diampu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Kelas Tetap */}
            {kelasGuru.map((kelas, index) => (
              <div key={`tetap-${index}`} className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">{kelas}</h3>
                    <p className="text-sm text-blue-600">Kelas Tetap</p>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            ))}
            
            {/* Kelas Pengganti */}
            {kelasPengganti.map((kelas, index) => (
              <div key={`pengganti-${index}`} className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900">{kelas}</h3>
                    <p className="text-sm text-green-600">(Guru Pengganti Hari Ini)</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
          
          {kelasGuru.length + kelasPengganti.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada kelas yang diampu</p>
            </div>
          )}
        </div>

        {/* Modal untuk Ambil Kelas Pengganti */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Ambil Kelas Pengganti</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowDropdown(false);
                    setSelectedKelas("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-4 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center"
                  >
                    <span className={selectedKelas ? "text-gray-900" : "text-gray-500"}>
                      {selectedKelas || "Pilih kelas..."}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {availableKelas.length > 0 ? (
                        availableKelas.map((kelas, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedKelas(kelas);
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                          >
                            {kelas}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          Tidak ada kelas yang tersedia
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowDropdown(false);
                    setSelectedKelas("");
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleAmbilKelasPengganti}
                  disabled={!selectedKelas}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}