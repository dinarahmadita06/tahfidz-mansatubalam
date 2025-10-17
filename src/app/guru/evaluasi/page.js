"use client";
import { useState } from "react";
import { Topbar } from "@/components/layout/Shell";
import { BookOpen, User, Calendar, Clock, Star, CheckCircle, XCircle, Edit, Save, Play, Pause, RotateCcw, Volume2, Users, Target, Award, TrendingUp, AlertCircle, FileText, Download, Filter, Plus, X } from "lucide-react";

// Mock data evaluasi
const mockEvaluations = [
  {
    id: 1,
    studentId: 1,
    studentName: "Ahmad Rizki",
    studentClass: "Kelas 10A",
    date: "2025-01-20",
    time: "09:00",
    surah: "Al-Baqarah",
    ayahRange: "1-10",
    pages: "1-2",
    type: "hafalan_baru",
    status: "completed",
    scores: {
      tajwid: 85,
      kelancaran: 90,
      makhroj: 88,
      overall: 88
    },
    notes: "Tajwid sudah baik, perlu perbaikan di huruf-huruf yang berdekatan",
    recommendations: ["Latih makhroj huruf Qaf dan Kaf", "Perbaiki bacaan Mad"],
    nextTarget: "Al-Baqarah ayat 11-20",
    duration: "15 menit"
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Fatimah Zahra",
    studentClass: "Kelas 11B",
    date: "2025-01-20",
    time: "10:30",
    surah: "Ali Imran",
    ayahRange: "1-15",
    pages: "3-5",
    type: "muraja'ah",
    status: "in_progress",
    scores: {
      tajwid: 92,
      kelancaran: 85,
      makhroj: 90,
      overall: 89
    },
    notes: "Sangat baik dalam tajwid, kelancaran perlu ditingkatkan",
    recommendations: ["Lebih sering muraja'ah", "Latihan tempo bacaan"],
    nextTarget: "Ali Imran ayat 16-30",
    duration: "12 menit"
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Muhammad Hasan",
    studentClass: "Kelas 12A",
    date: "2025-01-19",
    time: "14:00",
    surah: "An-Nisa",
    ayahRange: "1-25",
    pages: "6-10",
    type: "hafalan_baru",
    status: "completed",
    scores: {
      tajwid: 95,
      kelancaran: 98,
      makhroj: 94,
      overall: 96
    },
    notes: "Sangat baik dalam semua aspek, siap untuk target yang lebih tinggi",
    recommendations: ["Tingkatkan target harian", "Mulai fokus pada tilawah"],
    nextTarget: "An-Nisa ayat 26-50",
    duration: "18 menit"
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Aisyah Putri",
    studentClass: "Kelas 10B",
    date: "2025-01-19",
    time: "11:00",
    surah: "Al-Fatihah",
    ayahRange: "1-7",
    pages: "1",
    type: "hafalan_baru",
    status: "needs_review",
    scores: {
      tajwid: 65,
      kelancaran: 70,
      makhroj: 68,
      overall: 68
    },
    notes: "Masih perlu bimbingan lebih intensif, semangat belajar bagus",
    recommendations: ["Latihan dasar tajwid", "Bimbingan individual lebih sering"],
    nextTarget: "Al-Baqarah ayat 1-5",
    duration: "20 menit"
  }
];

const evaluationTypes = {
  hafalan_baru: "Hafalan Baru",
  muraja: "Muraja'ah",
  tilawah: "Tilawah",
  tartil: "Tartil"
};

const statusColors = {
  completed: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  in_progress: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  needs_review: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20",
  cancelled: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
};

const statusLabels = {
  completed: "Selesai",
  in_progress: "Sedang Berlangsung",
  needs_review: "Perlu Review",
  cancelled: "Dibatalkan"
};

function EvaluationCard({ evaluation, onEdit, onStart, onComplete }) {
  const statusColor = statusColors[evaluation.status] || statusColors.completed;
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Sangat Baik";
    if (score >= 75) return "Baik";
    if (score >= 60) return "Cukup";
    return "Perlu Perbaikan";
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
            {evaluation.studentName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{evaluation.studentName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User size={14} />
              {evaluation.studentClass}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}>
            {statusLabels[evaluation.status]}
          </span>
          <button
            onClick={() => onEdit(evaluation)}
            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            title="Edit Evaluasi"
          >
            <Edit size={18} />
          </button>
        </div>
      </div>

      {/* Evaluation Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-emerald-600" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Surah</span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{evaluation.surah}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Ayat {evaluation.ayahRange}</div>
        </div>
        <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Jadwal</span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Date(evaluation.date).toLocaleDateString('id-ID')}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{evaluation.time}</div>
        </div>
      </div>

      {/* Type and Duration */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-md font-medium">
            {evaluationTypes[evaluation.type]}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Clock size={12} />
            {evaluation.duration}
          </div>
        </div>
      </div>

      {/* Scores */}
      {evaluation.status === 'completed' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nilai Evaluasi:</span>
            <span className={`text-lg font-bold ${getScoreColor(evaluation.scores.overall)}`}>
              {evaluation.scores.overall}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className={`font-semibold ${getScoreColor(evaluation.scores.tajwid)}`}>
                {evaluation.scores.tajwid}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Tajwid</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${getScoreColor(evaluation.scores.kelancaran)}`}>
                {evaluation.scores.kelancaran}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Kelancaran</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${getScoreColor(evaluation.scores.makhroj)}`}>
                {evaluation.scores.makhroj}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Makhroj</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${evaluation.scores.overall}%` }}
            ></div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs font-medium ${getScoreColor(evaluation.scores.overall)}`}>
              {getScoreLabel(evaluation.scores.overall)}
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      {evaluation.notes && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Catatan:</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg">
            {evaluation.notes}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {evaluation.recommendations && evaluation.recommendations.length > 0 && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Rekomendasi:</span>
          <div className="space-y-1">
            {evaluation.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Target */}
      {evaluation.nextTarget && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Target Selanjutnya:</span>
          </div>
          <span className="text-sm text-emerald-800 dark:text-emerald-300">{evaluation.nextTarget}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-neutral-700">
        {evaluation.status === 'in_progress' && (
          <>
            <button
              onClick={() => onComplete(evaluation)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <CheckCircle size={16} />
              <span className="text-sm">Selesaikan</span>
            </button>
            <button className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <Pause size={16} />
            </button>
          </>
        )}
        {evaluation.status === 'completed' && (
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all">
            <FileText size={16} />
            <span className="text-sm">Lihat Laporan</span>
          </button>
        )}
        {evaluation.status === 'needs_review' && (
          <button
            onClick={() => onStart(evaluation)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Play size={16} />
            <span className="text-sm">Mulai Evaluasi</span>
          </button>
        )}
      </div>
    </div>
  );
}

function EvaluationModal({ evaluation, onClose, type }) {
  const [scores, setScores] = useState(evaluation?.scores || { tajwid: 0, kelancaran: 0, makhroj: 0, overall: 0 });
  const [notes, setNotes] = useState(evaluation?.notes || '');
  const [recommendations, setRecommendations] = useState(evaluation?.recommendations?.join(', ') || '');
  const [nextTarget, setNextTarget] = useState(evaluation?.nextTarget || '');

  const handleScoreChange = (aspect, value) => {
    const newScores = { ...scores, [aspect]: parseInt(value) };
    const overall = Math.round((newScores.tajwid + newScores.kelancaran + newScores.makhroj) / 3);
    setScores({ ...newScores, overall });
  };

  if (!evaluation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {type === 'edit' ? 'Edit Evaluasi' : 'Evaluasi Hafalan'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Student Info */}
          <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                {evaluation.studentName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{evaluation.studentName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{evaluation.studentClass}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Surah:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{evaluation.surah}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Ayat:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{evaluation.ayahRange}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Tanggal:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {new Date(evaluation.date).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Waktu:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{evaluation.time}</span>
              </div>
            </div>
          </div>

          {/* Scoring Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Penilaian</h4>
              <div className="grid gap-4">
                {/* Tajwid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tajwid (0-100)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scores.tajwid}
                      onChange={(e) => handleScoreChange('tajwid', e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                    />
                    <span className="w-12 text-sm font-medium text-gray-900 dark:text-white">
                      {scores.tajwid}
                    </span>
                  </div>
                </div>

                {/* Kelancaran */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kelancaran (0-100)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scores.kelancaran}
                      onChange={(e) => handleScoreChange('kelancaran', e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                    />
                    <span className="w-12 text-sm font-medium text-gray-900 dark:text-white">
                      {scores.kelancaran}
                    </span>
                  </div>
                </div>

                {/* Makhroj */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Makhroj (0-100)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scores.makhroj}
                      onChange={(e) => handleScoreChange('makhroj', e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                    />
                    <span className="w-12 text-sm font-medium text-gray-900 dark:text-white">
                      {scores.makhroj}
                    </span>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Nilai Keseluruhan:
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {scores.overall}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-800/50 rounded-full h-2 mt-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${scores.overall}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan Evaluasi
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis catatan tentang performance siswa..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rekomendasi (pisahkan dengan koma)
              </label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Latih tajwid, Perbaiki kelancaran, Tingkatkan tempo..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* Next Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Selanjutnya
              </label>
              <input
                type="text"
                value={nextTarget}
                onChange={(e) => setNextTarget(e.target.value)}
                placeholder="Contoh: Al-Baqarah ayat 11-20"
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
            >
              <Save size={16} className="inline mr-2" />
              Simpan Evaluasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvaluasiHafalan() {
  const [evaluations, setEvaluations] = useState(mockEvaluations);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Filter evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesStatus = !filterStatus || evaluation.status === filterStatus;
    const matchesType = !filterType || evaluation.type === filterType;
    const matchesDate = !filterDate || evaluation.date === filterDate;
    
    return matchesStatus && matchesType && matchesDate;
  });

  const handleEdit = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setModalType('edit');
  };

  const handleStart = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setModalType('evaluate');
  };

  const handleComplete = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setModalType('evaluate');
  };

  const closeModal = () => {
    setSelectedEvaluation(null);
    setModalType(null);
  };

  // Summary stats
  const totalEvaluations = evaluations.length;
  const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
  const inProgressEvaluations = evaluations.filter(e => e.status === 'in_progress').length;
  const averageScore = evaluations
    .filter(e => e.status === 'completed')
    .reduce((acc, e) => acc + e.scores.overall, 0) / completedEvaluations || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <Topbar title="Evaluasi Hafalan" />
      
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalEvaluations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Evaluasi</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedEvaluations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Selesai</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Play size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressEvaluations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Berlangsung</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(averageScore)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Nilai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
            >
              <option value="">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="in_progress">Sedang Berlangsung</option>
              <option value="needs_review">Perlu Review</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
            >
              <option value="">Semua Tipe</option>
              <option value="hafalan_baru">Hafalan Baru</option>
              <option value="muraja">Muraja'ah</option>
              <option value="tilawah">Tilawah</option>
              <option value="tartil">Tartil</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
            />

            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all">
              <Plus size={20} />
              <span>Evaluasi Baru</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {filteredEvaluations.length} dari {totalEvaluations} evaluasi
            </p>
          </div>
        </div>

        {/* Evaluations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvaluations.map(evaluation => (
            <EvaluationCard
              key={evaluation.id}
              evaluation={evaluation}
              onEdit={handleEdit}
              onStart={handleStart}
              onComplete={handleComplete}
            />
          ))}
        </div>

        {filteredEvaluations.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tidak ada evaluasi ditemukan
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Coba ubah filter atau buat evaluasi baru
            </p>
          </div>
        )}

        {/* Evaluation Modal */}
        {modalType && (
          <EvaluationModal
            evaluation={selectedEvaluation}
            onClose={closeModal}
            type={modalType}
          />
        )}
      </div>
    </div>
  );
}