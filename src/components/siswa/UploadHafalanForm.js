"use client";
import { useState, useRef } from "react";
import { 
  Upload, 
  Mic, 
  Play, 
  Pause, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Clock,
  FileAudio
} from "lucide-react";

function AudioRecorder({ onRecordingComplete, maxDuration = 600 }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon sudah diberikan.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    onRecordingComplete(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="text-center">
        <div className="mb-4">
          <Mic size={48} className={`mx-auto ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
        </div>

        {!audioBlob && (
          <div>
            <h3 className="text-lg font-medium text-[#1F1F1F] mb-2">Rekam Hafalan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Klik tombol rekam untuk memulai merekam hafalan Anda
            </p>
            
            {isRecording ? (
              <div className="space-y-4">
                <div className="text-2xl font-mono text-red-600">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-gray-600">
                  Maksimal: {formatTime(maxDuration)}
                </div>
                <button
                  onClick={stopRecording}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Berhenti Rekam
                </button>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="px-6 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#874D14] transition-colors"
              >
                Mulai Rekam
              </button>
            )}
          </div>
        )}

        {audioBlob && (
          <div>
            <div className="mb-4">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
              <h3 className="text-lg font-medium text-[#1F1F1F] mb-1">Rekaman Selesai</h3>
              <p className="text-sm text-gray-600">Durasi: {formatTime(recordingTime)}</p>
            </div>

            <div className="flex justify-center space-x-3">
              <button
                onClick={playRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Putar'}</span>
              </button>
              
              <button
                onClick={deleteRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileUploader({ onFileSelect, acceptedFormats = ".mp3,.wav,.m4a,.aac" }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Harap pilih file audio yang valid (.mp3, .wav, .m4a, .aac)');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
        dragOver 
          ? 'border-[#FFB030] bg-orange-50' 
          : 'border-gray-300 hover:border-[#FFB030]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!selectedFile ? (
        <div className="text-center">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-[#1F1F1F] mb-2">Upload File Audio</h3>
          <p className="text-sm text-gray-600 mb-4">
            Seret dan lepas file audio di sini atau klik untuk memilih
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#874D14] transition-colors"
          >
            Pilih File
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Format yang didukung: MP3, WAV, M4A, AAC (Maksimal 50MB)
          </p>
        </div>
      ) : (
        <div className="text-center">
          <FileAudio size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-[#1F1F1F] mb-1">{selectedFile.name}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ukuran: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <button
            onClick={removeFile}
            className="flex items-center space-x-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            <span>Hapus File</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function UploadHafalanForm({ onSubmit, onCancel }) {
  const [surah, setSurah] = useState("");
  const [verses, setVerses] = useState("");
  const [uploadMethod, setUploadMethod] = useState("record"); // "record" or "upload"
  const [audioData, setAudioData] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const surahList = [
    "Al-Fatihah", "Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Maidah",
    "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus",
    // Add more surahs as needed
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!surah || !verses || !audioData) {
      alert('Harap lengkapi semua field yang diperlukan');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('surah', surah);
      formData.append('verses', verses);
      formData.append('notes', notes);
      
      if (audioData instanceof Blob) {
        formData.append('audio', audioData, 'hafalan-recording.wav');
      } else if (audioData instanceof File) {
        formData.append('audio', audioData);
      }

      // Call the onSubmit callback with form data
      await onSubmit(formData);
      
    } catch (error) {
      console.error('Error submitting hafalan:', error);
      alert('Terjadi kesalahan saat mengirim hafalan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-[#1F1F1F] mb-6">Upload Hafalan</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Surah Selection */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
              Surah <span className="text-red-500">*</span>
            </label>
            <select
              value={surah}
              onChange={(e) => setSurah(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB030] focus:border-[#FFB030]"
              required
            >
              <option value="">Pilih Surah</option>
              {surahList.map((surahName) => (
                <option key={surahName} value={surahName}>
                  {surahName}
                </option>
              ))}
            </select>
          </div>

          {/* Verses */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
              Ayat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={verses}
              onChange={(e) => setVerses(e.target.value)}
              placeholder="Contoh: 1-10, 25-30"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB030] focus:border-[#FFB030]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Masukkan rentang ayat yang akan disetorkan
            </p>
          </div>

          {/* Upload Method Selection */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-3">
              Metode Upload Audio <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="record"
                  checked={uploadMethod === "record"}
                  onChange={(e) => {
                    setUploadMethod(e.target.value);
                    setAudioData(null);
                  }}
                  className="mr-2 text-[#FFB030] focus:ring-[#FFB030]"
                />
                <Mic size={16} className="mr-1" />
                Rekam Langsung
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="upload"
                  checked={uploadMethod === "upload"}
                  onChange={(e) => {
                    setUploadMethod(e.target.value);
                    setAudioData(null);
                  }}
                  className="mr-2 text-[#FFB030] focus:ring-[#FFB030]"
                />
                <Upload size={16} className="mr-1" />
                Upload File
              </label>
            </div>

            {/* Audio Input */}
            {uploadMethod === "record" ? (
              <AudioRecorder onRecordingComplete={setAudioData} />
            ) : (
              <FileUploader onFileSelect={setAudioData} />
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB030] focus:border-[#FFB030]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!audioData || isSubmitting}
              className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#874D14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengirim...</span>
                </div>
              ) : (
                "Kirim Hafalan"
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <AlertCircle size={16} className="mr-2" />
            Tips Upload Hafalan
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pastikan suara jelas dan tidak ada noise berlebihan</li>
            <li>• Rekam dalam ruangan yang tenang</li>
            <li>• Bacaan dimulai dengan &quot;A&apos;uzu billahi...&quot; dan &quot;Bismillah...&quot;</li>
            <li>• Durasi maksimal rekaman adalah 10 menit</li>
            <li>• File akan otomatis tersimpan setelah upload berhasil</li>
          </ul>
        </div>
      </div>
    </div>
  );
}