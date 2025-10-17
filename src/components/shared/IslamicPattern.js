export default function IslamicPattern() {
  return (
    <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none overflow-hidden">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Bintang 8 segi */}
        <path
          d="M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z"
          fill="#1A936F"
        />
        {/* Lingkaran */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="#F7C873"
          strokeWidth="2"
        />
        {/* Ornamen tambahan */}
        <circle cx="100" cy="100" r="40" fill="none" stroke="#1A936F" strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="#F7C873" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}
