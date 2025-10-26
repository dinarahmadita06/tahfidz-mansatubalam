'use client';

/**
 * PageWrapper Component
 *
 * Komponen wrapper untuk halaman dengan background konsisten seperti halaman Profil Admin.
 * Digunakan secara lokal di setiap halaman tanpa global styling.
 *
 * Features:
 * - Gradasi emerald-amber pastel lembut
 * - Ornamen geometris islami samar
 * - Font Poppins
 * - Background lokal per halaman
 *
 * Usage:
 * <PageWrapper>
 *   <YourPageContent />
 * </PageWrapper>
 */

export default function PageWrapper({
  children,
  showOrnaments = true,
  className = ''
}) {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .page-container {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #FAFFF8 0%, #FFFBE9 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Islamic ornament - bottom right */
        .islamic-ornament-br {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 400px;
          height: 400px;
          background-image:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04) 0%, transparent 70%),
            repeating-linear-gradient(-45deg, transparent, transparent 25px, rgba(16, 185, 129, 0.03) 25px, rgba(16, 185, 129, 0.03) 50px),
            conic-gradient(from 0deg, rgba(16, 185, 129, 0.06) 0deg, transparent 45deg, rgba(16, 185, 129, 0.06) 90deg, transparent 135deg, rgba(16, 185, 129, 0.06) 180deg, transparent 225deg, rgba(16, 185, 129, 0.06) 270deg, transparent 315deg);
          filter: blur(2px);
          pointer-events: none;
          opacity: 0.7;
          z-index: 0;
        }

        /* Islamic ornament - top left */
        .islamic-ornament-tl {
          position: absolute;
          top: 0;
          left: 0;
          width: 300px;
          height: 300px;
          background-image:
            radial-gradient(circle at center, rgba(245, 158, 11, 0.05) 0%, transparent 70%),
            repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(245, 158, 11, 0.04) 20px, rgba(245, 158, 11, 0.04) 40px);
          filter: blur(1px);
          pointer-events: none;
          opacity: 0.6;
          z-index: 0;
        }

        .page-content {
          position: relative;
          z-index: 1;
        }

        /* Card styling untuk konsistensi */
        :global(.page-card) {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }

        :global(.page-card:hover) {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        /* Header section styling */
        :global(.page-header) {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        /* Content section styling */
        :global(.page-content-section) {
          background: rgba(255, 249, 231, 0.3);
          backdrop-filter: blur(5px);
          border-radius: 16px;
          padding: 1.5rem;
        }
      `}</style>

      <div className={`page-container ${className}`}>
        {/* Islamic Ornaments */}
        {showOrnaments && (
          <>
            <div className="islamic-ornament-br"></div>
            <div className="islamic-ornament-tl"></div>
          </>
        )}

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );
}
