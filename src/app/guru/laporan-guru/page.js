'use client';
import { useState, useEffect } from 'react';
import { BarChart, TrendingUp, FileText, Download, Calendar, Users, Award } from 'lucide-react';

// Mock data untuk laporan
const mockReports = [
  {
    id: 1,
    title: "Laporan Hafalan Bulanan",
    period: "Januari 2024",
    type: "hafalan",
    students: 45,
    completed: 38,
    avgScore: 82,
    createdDate: "2024-01-31",
    status: "completed"
  },
  {
    id: 2,
    title: "Progress Report Semester",
    period: "Semester 1 2023/2024",
    type: "progress",
    students: 45,
    completed: 45,
    avgScore: 78,
    createdDate: "2024-01-15",
    status: "completed"
  }
];

const mockStats = {
  totalStudents: 45,
  completedHafalan: 38,
  averageScore: 82,
  totalSessions: 156,
  monthlyGrowth: 12
};

export default function LaporanPage() {
  const [reports, setReports] = useState(mockReports);
  const [stats, setStats] = useState(mockStats);
  const [activeTab, setActiveTab] = useState('hafalan');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+{trend}% bulan ini</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ReportCard = ({ report }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
          <p className="text-sm text-gray-600">{report.period}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          report.status === 'completed' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {report.status === 'completed' ? 'Selesai' : 'Proses'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#FFB030]">{report.students}</p>
          <p className="text-xs text-gray-500">Total Siswa</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{report.completed}</p>
          <p className="text-xs text-gray-500">Selesai</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{report.avgScore}</p>
          <p className="text-xs text-gray-500">Rata-rata</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">Dibuat: {new Date(report.createdDate).toLocaleDateString('id-ID')}</span>
        <div className="flex items-center gap-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(report.completed / report.students) * 100}%` }}
            />
          </div>
          <span className="text-sm ml-2">{Math.round((report.completed / report.students) * 100)}%</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Lihat Detail
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">Laporan</h1>
        <p className="text-gray-600">Analisis dan laporan progress tahfidz siswa</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Periode:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPeriod === 'monthly' 
                  ? 'bg-[#FFB030] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setSelectedPeriod('semester')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPeriod === 'semester' 
                  ? 'bg-[#FFB030] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semester
            </button>
            <button
              onClick={() => setSelectedPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPeriod === 'yearly' 
                  ? 'bg-[#FFB030] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tahunan
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-6 h-6 text-white" />}
          title="Total Siswa"
          value={stats.totalStudents}
          color="bg-[#FFB030]"
        />
        <StatCard 
          icon={<Award className="w-6 h-6 text-white" />}
          title="Hafalan Selesai"
          value={stats.completedHafalan}
          subtitle={`${Math.round((stats.completedHafalan / stats.totalStudents) * 100)}% completion rate`}
          color="bg-green-500"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          title="Rata-rata Nilai"
          value={stats.averageScore}
          trend={stats.monthlyGrowth}
          color="bg-blue-500"
        />
        <StatCard 
          icon={<BarChart className="w-6 h-6 text-white" />}
          title="Total Sesi"
          value={stats.totalSessions}
          subtitle="Sesi pembelajaran"
          color="bg-[#874D14]"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('hafalan')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'hafalan' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Laporan Hafalan
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'progress' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Progress Report
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'statistics' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Statistik
          </button>
        </div>

        <div className="p-6">
          {/* Hafalan Reports Tab */}
          {activeTab === 'hafalan' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Laporan Hafalan</h3>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Buat Laporan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.filter(r => r.type === 'hafalan').map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          )}

          {/* Progress Reports Tab */}
          {activeTab === 'progress' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Progress Report</h3>
                <button className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.filter(r => r.type === 'progress').map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Statistik Pembelajaran</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Performance Chart */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Performa Bulanan</h4>
                  <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Grafik Performa Siswa</p>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Siswa Terbaik</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Ahmad Rizki", score: 95, class: "XI IPA 1" },
                      { name: "Siti Aminah", score: 92, class: "XI IPS 2" },
                      { name: "Muhammad Fadli", score: 88, class: "X IPA 1" },
                    ].map((student, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.class}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className={`w-5 h-5 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 'text-orange-600'
                            }`} />
                            <span className="font-bold text-lg">{student.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold mb-4">Statistik Detail</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">Kelas</th>
                        <th className="text-left py-3 px-4">Siswa</th>
                        <th className="text-left py-3 px-4">Selesai</th>
                        <th className="text-left py-3 px-4">Rata-rata</th>
                        <th className="text-left py-3 px-4">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { class: "X IPA 1", students: 15, completed: 12, average: 82 },
                        { class: "X IPA 2", students: 15, completed: 14, average: 85 },
                        { class: "XI IPS 1", students: 15, completed: 12, average: 78 },
                      ].map((classData, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{classData.class}</td>
                          <td className="py-3 px-4">{classData.students}</td>
                          <td className="py-3 px-4">{classData.completed}</td>
                          <td className="py-3 px-4">{classData.average}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-[#FFB030] h-2 rounded-full" 
                                  style={{ width: `${(classData.completed / classData.students) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm">{Math.round((classData.completed / classData.students) * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Buat Laporan Baru</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Judul Laporan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                  placeholder="Contoh: Laporan Hafalan Februari 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipe Laporan</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]">
                  <option value="hafalan">Laporan Hafalan</option>
                  <option value="progress">Progress Report</option>
                  <option value="evaluation">Evaluasi Pembelajaran</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Periode</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]">
                  <option value="monthly">Bulanan</option>
                  <option value="semester">Semester</option>
                  <option value="yearly">Tahunan</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28]"
                >
                  Buat Laporan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}