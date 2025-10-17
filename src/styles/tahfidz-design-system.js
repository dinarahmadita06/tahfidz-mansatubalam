/**
 * Tahfidz App - Islamic Modern Design System
 *
 * Sistem desain dengan gaya islami-modern yang konsisten
 * untuk aplikasi web Tahfidz Qur'an
 */

export const tahfidzDesign = {
  // ============================================
  // COLORS - Palet Warna Islami Modern
  // ============================================
  colors: {
    // Primary - Hijau Zamrud (Spiritual & Menenangkan)
    primary: {
      50: '#E6F7F1',
      100: '#B8EBD8',
      200: '#8ADFBF',
      300: '#5CD3A6',
      400: '#2EC78D',
      500: '#1A936F',  // Main - Hijau Zamrud
      600: '#157A5C',
      700: '#106149',
      800: '#0B4836',
      900: '#062F23',
    },

    // Secondary - Emas Lembut (Kehangatan & Keberkahan)
    secondary: {
      50: '#FEF8E7',
      100: '#FDEAB8',
      200: '#FBDC89',
      300: '#F9CE5A',
      400: '#F7C873',  // Main - Emas Lembut
      500: '#E5A93D',
      600: '#C78D2A',
      700: '#A97120',
      800: '#8B5516',
      900: '#6D390C',
    },

    // Accent - Teal (Segar & Modern)
    accent: {
      50: '#E0F5F5',
      100: '#B3E5E6',
      200: '#80D4D6',
      300: '#4DC3C6',
      400: '#26B7BA',
      500: '#00ABAD',
      600: '#009DA6',
      700: '#008A9C',
      800: '#007893',
      900: '#005882',
    },

    // Background - Gradasi Pastel Hangat
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAF8',
      emerald: '#F0F9F4',     // emerald-50
      amber: '#FFFBEB',       // amber-50
      gradient: 'linear-gradient(135deg, #F0F9F4 0%, #FFFBEB 50%, #F0F9F4 100%)',
    },

    // Text Colors
    text: {
      primary: '#1F2937',     // gray-800
      secondary: '#4B5563',   // gray-600
      tertiary: '#6B7280',    // gray-500
      emerald: '#065F46',     // emerald-800
      amber: '#78350F',       // amber-900
      white: '#FFFFFF',
    },

    // Status Colors
    status: {
      success: {
        light: '#D1FAE5',
        DEFAULT: '#10B981',
        dark: '#065F46',
      },
      warning: {
        light: '#FEF3C7',
        DEFAULT: '#F59E0B',
        dark: '#92400E',
      },
      error: {
        light: '#FEE2E2',
        DEFAULT: '#EF4444',
        dark: '#991B1B',
      },
      info: {
        light: '#DBEAFE',
        DEFAULT: '#3B82F6',
        dark: '#1E40AF',
      },
    },

    // Pastel Palette untuk Cards
    pastel: {
      emerald: {
        light: '#ECFDF5',
        DEFAULT: '#D1FAE5',
        medium: '#A7F3D0',
      },
      teal: {
        light: '#F0FDFA',
        DEFAULT: '#CCFBF1',
        medium: '#99F6E4',
      },
      amber: {
        light: '#FFFBEB',
        DEFAULT: '#FEF3C7',
        medium: '#FDE68A',
      },
      purple: {
        light: '#FAF5FF',
        DEFAULT: '#F3E8FF',
        medium: '#E9D5FF',
      },
      blue: {
        light: '#EFF6FF',
        DEFAULT: '#DBEAFE',
        medium: '#BFDBFE',
      },
      rose: {
        light: '#FFF1F2',
        DEFAULT: '#FFE4E6',
        medium: '#FECDD3',
      },
    },
  },

  // ============================================
  // TYPOGRAPHY - Font System
  // ============================================
  typography: {
    fontFamily: {
      primary: "'Poppins', sans-serif",
      secondary: "'Nunito', sans-serif",
      rounded: "'Nunito Sans', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // ============================================
  // SPACING - Consistent Spacing System
  // ============================================
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // ============================================
  // BORDER RADIUS - Rounded Corners
  // ============================================
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // ============================================
  // SHADOWS - Depth & Elevation
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    emerald: '0 10px 25px -5px rgba(26, 147, 111, 0.2)',
    amber: '0 10px 25px -5px rgba(247, 200, 115, 0.3)',
  },

  // ============================================
  // GRADIENTS - Islamic Themed Gradients
  // ============================================
  gradients: {
    emerald: 'linear-gradient(135deg, #1A936F 0%, #00ABAD 100%)',
    emeraldSoft: 'linear-gradient(135deg, #2EC78D 0%, #26B7BA 100%)',
    amber: 'linear-gradient(135deg, #F7C873 0%, #E5A93D 100%)',
    sunset: 'linear-gradient(135deg, #F7C873 0%, #F59E0B 100%)',
    ocean: 'linear-gradient(135deg, #00ABAD 0%, #3B82F6 100%)',
    background: 'linear-gradient(135deg, #F0F9F4 0%, #FFFBEB 50%, #F0F9F4 100%)',
    card: {
      emerald: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      teal: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)',
      amber: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      purple: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
    },
  },

  // ============================================
  // COMPONENTS - Pre-defined Component Styles
  // ============================================
  components: {
    // Button Styles
    button: {
      primary: {
        background: 'linear-gradient(135deg, #2EC78D 0%, #1A936F 100%)',
        color: '#FFFFFF',
        hover: 'linear-gradient(135deg, #1A936F 0%, #106149 100%)',
        shadow: '0 4px 6px -1px rgba(26, 147, 111, 0.3)',
      },
      secondary: {
        background: 'linear-gradient(135deg, #F7C873 0%, #E5A93D 100%)',
        color: '#FFFFFF',
        hover: 'linear-gradient(135deg, #E5A93D 0%, #C78D2A 100%)',
        shadow: '0 4px 6px -1px rgba(247, 200, 115, 0.3)',
      },
      outline: {
        background: 'transparent',
        color: '#1A936F',
        border: '2px solid #1A936F',
        hover: '#F0F9F4',
      },
      ghost: {
        background: 'transparent',
        color: '#1A936F',
        hover: '#F0F9F4',
      },
    },

    // Card Styles
    card: {
      default: {
        background: '#FFFFFF',
        border: '2px solid #E5E7EB',
        borderRadius: '1rem',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
      },
      elevated: {
        background: '#FFFFFF',
        border: '2px solid #D1FAE5',
        borderRadius: '1.5rem',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
      },
      pastel: {
        emerald: {
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: 'none',
          borderRadius: '1.5rem',
          shadow: '0 4px 6px -1px rgba(26, 147, 111, 0.1)',
        },
        amber: {
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: 'none',
          borderRadius: '1.5rem',
          shadow: '0 4px 6px -1px rgba(247, 200, 115, 0.1)',
        },
      },
    },

    // Input Styles
    input: {
      default: {
        border: '2px solid #D1FAE5',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        focus: {
          border: '2px solid #1A936F',
          ring: '0 0 0 4px rgba(26, 147, 111, 0.1)',
        },
      },
    },

    // Badge Styles
    badge: {
      success: {
        background: 'linear-gradient(135deg, #2EC78D 0%, #1A936F 100%)',
        color: '#FFFFFF',
        borderRadius: '0.75rem',
      },
      warning: {
        background: 'linear-gradient(135deg, #F7C873 0%, #F59E0B 100%)',
        color: '#FFFFFF',
        borderRadius: '0.75rem',
      },
      error: {
        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        color: '#FFFFFF',
        borderRadius: '0.75rem',
      },
    },
  },

  // ============================================
  // ANIMATIONS - Smooth Transitions
  // ============================================
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    fadeIn: `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    slideIn: `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  },

  // ============================================
  // ISLAMIC PATTERNS - SVG Patterns
  // ============================================
  patterns: {
    star8Point: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z"
              fill="currentColor" opacity="0.05"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor"
                stroke-width="2" opacity="0.05"/>
      </svg>
    `,
    geometric: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <pattern id="islamic-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <circle cx="25" cy="25" r="3" fill="currentColor" opacity="0.1"/>
          <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.1"/>
          <circle cx="50" cy="0" r="3" fill="currentColor" opacity="0.1"/>
          <circle cx="0" cy="50" r="3" fill="currentColor" opacity="0.1"/>
          <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.1"/>
        </pattern>
        <rect width="100" height="100" fill="url(#islamic-pattern)"/>
      </svg>
    `,
  },

  // ============================================
  // UTILITY CLASSES - Helper Styles
  // ============================================
  utils: {
    // Glass morphism effect
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },

    // Hover lift effect
    hoverLift: {
      transition: 'all 300ms ease-out',
      hover: {
        transform: 'translateY(-4px)',
        shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },

    // Focus ring
    focusRing: {
      outline: 'none',
      ring: '0 0 0 4px rgba(26, 147, 111, 0.1)',
    },
  },
};

export default tahfidzDesign;
