// 🎨 DESIGN TOKENS - Tahfidz App
// Design system yang konsisten untuk semua halaman

export const colors = {
  // Primary Colors
  primary: '#1A936F',        // Hijau zamrud utama
  secondary: '#F7C873',      // Keemasan lembut
  accent: '#8B5CF6',         // Ungu lembut untuk variasi

  // Emerald Palette
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Amber/Gold Palette
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Teal Palette
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Purple Palette (untuk Rata-rata Nilai)
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Yellow/Amber (untuk Menunggu Validasi)
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Background
  background: {
    main: 'linear-gradient(to bottom right, #ECFDF5, #FEF3C7)',
    card: '#FFFFFF',
    soft: '#F9FAFB',
  },

  // Text
  text: {
    main: '#064E3B',      // Hijau tua untuk heading
    secondary: '#6B7280', // Abu-abu untuk subtitle
    muted: '#9CA3AF',     // Abu-abu muted
  },

  // Status Colors
  status: {
    active: '#10B981',    // Hijau untuk aktif
    pending: '#F59E0B',   // Kuning untuk pending
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  }
};

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const fonts = {
  primary: ['Poppins', 'system-ui', 'sans-serif'],
  secondary: ['Inter', 'system-ui', 'sans-serif'],
};

// Animation keyframes
export const animations = {
  fadeInUp: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
  slideIn: `
    @keyframes slideIn {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
};

// CSS Classes untuk animasi
export const animationClasses = `
  .animate-fadeInUp {
    animation: fadeInUp 0.5s ease-in-out;
  }

  .animate-fadeInUp-delay-1 {
    animation: fadeInUp 0.5s ease-in-out 0.1s both;
  }

  .animate-fadeInUp-delay-2 {
    animation: fadeInUp 0.5s ease-in-out 0.2s both;
  }

  .animate-fadeInUp-delay-3 {
    animation: fadeInUp 0.5s ease-in-out 0.3s both;
  }

  .animate-fadeInUp-delay-4 {
    animation: fadeInUp 0.5s ease-in-out 0.4s both;
  }
`;
