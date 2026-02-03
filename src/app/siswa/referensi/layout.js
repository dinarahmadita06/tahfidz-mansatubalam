// Override parent /siswa/layout.js completely
// Al-Qur'an Digital page uses its own SiswaLayoutClient from QuranReaderPage
// This prevents double layout rendering
export default function ReferensiLayout({ children }) {
  // Return children directly without parent wrapper
  // Parent layout sidebar+padding will NOT apply here
  return <div className="min-h-screen bg-white">{children}</div>;
}

