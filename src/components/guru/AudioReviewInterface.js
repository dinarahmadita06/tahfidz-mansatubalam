"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  SkipBack, 
  SkipForward, 
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  User,
  BookOpen
} from "lucide-react";

function AudioPlayer({ audioUrl, title, onTimeUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipSeconds = (seconds) => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="mb-4">
        <h4 className="font-medium text-[#1F1F1F] mb-1">{title}</h4>
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={14} className="mr-1" />
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-4"
        onClick={handleSeek}
      >
        <div 
          className="h-full bg-[#FFB030] rounded-full transition-all"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => skipSeconds(-10)}
            className="p-2 text-gray-600 hover:text-[#FFB030] transition-colors"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-3 bg-[#FFB030] text-white rounded-full hover:bg-[#874D14] transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={() => skipSeconds(10)}
            className="p-2 text-gray-600 hover:text-[#FFB030] transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Volume2 size={16} className="text-gray-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const vol = parseFloat(e.target.value);
              setVolume(vol);
              if (audioRef.current) {
                audioRef.current.volume = vol;
              }
            }}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ onSubmit, onCancel, submissionData }) {
  const [rating, setRating] = useState(5);
  const [verdict, setVerdict] = useState("");
  const [publicNotes, setPublicNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [mistakes, setMistakes] = useState([]);
  const [newMistake, setNewMistake] = useState({ timeStamp: "", description: "" });

  const addMistake = () => {
    if (newMistake.timeStamp && newMistake.description) {
      setMistakes([...mistakes, { ...newMistake, id: Date.now() }]);
      setNewMistake({ timeStamp: "", description: "" });
    }
  };

  const removeMistake = (id) => {
    setMistakes(mistakes.filter(m => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rating,
      verdict,
      publicNotes,
      privateNotes,
      mistakes,
      submissionId: submissionData.id
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
          Rating Hafalan (1-5 bintang)
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <Star fill="currentColor" />
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {rating === 5 ? "Sangat Baik" : 
           rating === 4 ? "Baik" :
           rating === 3 ? "Cukup" :
           rating === 2 ? "Perlu Perbaikan" : "Kurang"}
        </p>
      </div>

      {/* Verdict */}
      <div>
        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
          Keputusan
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="verdict"
              value="lulus"
              checked={verdict === "lulus"}
              onChange={(e) => setVerdict(e.target.value)}
              className="mr-2 text-[#FFB030] focus:ring-[#FFB030]"
            />
            <CheckCircle size={16} className="text-green-600 mr-1" />
            Lulus
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="verdict"
              value="perlu_perbaikan"
              checked={verdict === "perlu_perbaikan"}
              onChange={(e) => setVerdict(e.target.value)}
              className="mr-2 text-[#FFB030] focus:ring-[#FFB030]"
            />
            <XCircle size={16} className="text-red-600 mr-1" />
            Perlu Perbaikan
          </label>
        </div>
      </div>

      {/* Mistakes Tracking */}
      <div>
        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
          Catatan Kesalahan (Opsional)
        </label>
        
        {/* Add New Mistake */}
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            placeholder="Waktu (mis: 1:30)"
            value={newMistake.timeStamp}
            onChange={(e) => setNewMistake({...newMistake, timeStamp: e.target.value})}
            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB030] focus:border-[#FFB030]"
          />
          <input
            type="text"
            placeholder="Deskripsi kesalahan..."
            value={newMistake.description}
            onChange={(e) => setNewMistake({...newMistake, description: e.target.value})}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB030] focus:border-[#FFB030]"
          />
          <button
            type="button"
            onClick={addMistake}
            className="px-3 py-2 text-sm bg-[#FFB030] text-white rounded-lg hover:bg-[#874D14]"
          >
            Tambah
          </button>
        </div>

        {/* Mistakes List */}
        {mistakes.length > 0 && (
          <div className="space-y-2">
            {mistakes.map((mistake) => (
              <div key={mistake.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div>
                  <span className="font-medium text-red-700">{mistake.timeStamp}</span>
                  <span className="ml-2 text-red-600">{mistake.description}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMistake(mistake.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Notes */}
      <div>
        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
          Catatan untuk Siswa (Akan dilihat siswa)
        </label>
        <textarea
          value={publicNotes}
          onChange={(e) => setPublicNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB030] focus:border-[#FFB030]"
          placeholder="Berikan feedback konstruktif untuk siswa..."
        />
      </div>

      {/* Private Notes */}
      <div>
        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
          Catatan Pribadi Guru (Tidak akan dilihat siswa)
        </label>
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB030] focus:border-[#FFB030]"
          placeholder="Catatan internal untuk referensi pribadi..."
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#874D14] transition-colors"
          disabled={!verdict}
        >
          Simpan Penilaian
        </button>
      </div>
    </form>
  );
}

export default function AudioReviewInterface({ submissionData, onReviewComplete }) {
  const [currentTimeStamp, setCurrentTimeStamp] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSubmit = (reviewData) => {
    // Process the review data
    console.log("Review submitted:", reviewData);
    onReviewComplete(reviewData);
    setShowReviewForm(false);
  };

  const handleTimeUpdate = (time) => {
    setCurrentTimeStamp(Math.floor(time));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Submission Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F1F1F] mb-2">Review Hafalan</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User size={16} className="mr-1" />
                {submissionData.studentName}
              </div>
              <div className="flex items-center">
                <BookOpen size={16} className="mr-1" />
                {submissionData.surah} - Ayat {submissionData.verses}
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                {submissionData.submittedAt}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showReviewForm 
                  ? "bg-gray-100 text-gray-700" 
                  : "bg-[#FFB030] text-white hover:bg-[#874D14]"
              }`}
            >
              {showReviewForm ? "Tutup Form" : "Mulai Review"}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        audioUrl={submissionData.audioUrl || "/audio/sample-quran.mp3"}
        title={`${submissionData.surah} - Ayat ${submissionData.verses}`}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1F1F1F] mb-4">Form Penilaian</h3>
          <ReviewForm
            submissionData={submissionData}
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Quick Notes */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <MessageSquare size={16} className="mr-2" />
          Tips Review Audio
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Dengarkan rekaman secara lengkap terlebih dahulu</li>
          <li>• Gunakan kontrol mundur/maju 10 detik untuk review detail</li>
          <li>• Catat waktu spesifik jika ada kesalahan</li>
          <li>• Berikan feedback yang konstruktif dan memotivasi</li>
        </ul>
      </div>
    </div>
  );
}