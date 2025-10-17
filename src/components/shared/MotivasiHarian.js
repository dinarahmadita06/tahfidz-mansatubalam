import { Sparkles } from 'lucide-react';

export default function MotivasiHarian({ quote, source, icon: Icon = Sparkles }) {
  return (
    <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-2xl shadow-lg p-6 text-white mb-8 animate-fadeInUp-delay-1">
      <div className="flex items-start gap-3">
        <Icon size={24} className="flex-shrink-0 mt-1" />
        <div>
          <p className="text-sm font-medium mb-2 opacity-90">✨ Motivasi Harian</p>
          <p className="text-lg font-semibold italic leading-relaxed mb-2">
            "{quote}"
          </p>
          <p className="text-sm opacity-90">— {source}</p>
        </div>
      </div>
    </div>
  );
}
