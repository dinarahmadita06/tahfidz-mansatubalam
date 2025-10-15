/**
 * TAHFIDZ APP - ISLAMIC MODERN DESIGN SYSTEM
 * Inspired by DEEN MUSLIM app design
 *
 * This file contains the complete design system configuration
 * including colors, typography, spacing, shadows, and animations
 */

export const designSystem = {
  // ============================================
  // COLOR PALETTE - Warm Islamic Modern Theme
  // ============================================
  colors: {
    // Primary - Warm Gold/Bronze tones
    primary: {
      50: '#FFF9F0',
      100: '#FFF3E0',
      200: '#FFE4C2',
      300: '#FFD4A3',
      400: '#E8B67A',
      500: '#D4A574', // Main gold
      600: '#C9A961',
      700: '#B08C4F',
      800: '#8B6F3F',
      900: '#6B5530',
    },

    // Secondary - Cream/Beige
    secondary: {
      50: '#FDFCFA',
      100: '#FFF5E6',
      200: '#F5E6D3',
      300: '#EDD7BF',
      400: '#E4C8AB',
      500: '#D9B896',
      600: '#C9A882',
      700: '#A68968',
      800: '#836B52',
      900: '#5C4033',
    },

    // Accent - Soft Terracotta/Clay
    accent: {
      50: '#FFF4F0',
      100: '#FFE9E0',
      200: '#FFD4C2',
      300: '#FFBEA3',
      400: '#E8A285',
      500: '#D48B6E',
      600: '#C17456',
      700: '#A05D45',
      800: '#804A37',
      900: '#5C3527',
    },

    // Neutral - Warm Browns
    neutral: {
      50: '#FAF9F8',
      100: '#F5F3F0',
      200: '#EBE7E2',
      300: '#D4CEC6',
      400: '#B8AEA3',
      500: '#998C7E',
      600: '#7A6D60',
      700: '#5C524A',
      800: '#3E3833',
      900: '#2B2621',
    },

    // Semantic Colors
    success: {
      light: '#A8D5BA',
      DEFAULT: '#6FA882',
      dark: '#4A7046',
    },
    warning: {
      light: '#FFE4A3',
      DEFAULT: '#E8B67A',
      dark: '#C9A961',
    },
    error: {
      light: '#FFB8B8',
      DEFAULT: '#E88B8B',
      dark: '#C96666',
    },
    info: {
      light: '#B8D9E8',
      DEFAULT: '#7AB8D4',
      dark: '#5A98B8',
    },

    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#FFF9F0',
      tertiary: '#FFF5E6',
      overlay: 'rgba(255, 249, 240, 0.95)',
    },

    // Text Colors
    text: {
      primary: '#2B2621',
      secondary: '#5C524A',
      tertiary: '#998C7E',
      inverse: '#FFFFFF',
      muted: '#B8AEA3',
    },

    // Border Colors
    border: {
      light: '#F5F3F0',
      DEFAULT: '#EBE7E2',
      dark: '#D4CEC6',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Font Families
    fontFamily: {
      // Arabic fonts for Quranic text
      arabic: "'Amiri', 'Scheherazade New', serif",
      // Modern sans-serif for UI
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      // Serif for elegant headers
      serif: "'Playfair Display', 'Georgia', serif",
      // Monospace for code/numbers
      mono: "'JetBrains Mono', 'Consolas', monospace",
    },

    // Font Sizes (using rem for accessibility)
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },

    // Font Weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    // Line Heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },

    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ============================================
  // SPACING SYSTEM (8px base grid)
  // ============================================
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',
  },

  // ============================================
  // SHADOWS - Soft, warm shadows
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(91, 82, 74, 0.05)',
    DEFAULT: '0 2px 8px 0 rgba(91, 82, 74, 0.08)',
    md: '0 4px 12px 0 rgba(91, 82, 74, 0.10)',
    lg: '0 8px 24px 0 rgba(91, 82, 74, 0.12)',
    xl: '0 12px 32px 0 rgba(91, 82, 74, 0.15)',
    '2xl': '0 24px 48px 0 rgba(91, 82, 74, 0.18)',
    inner: 'inset 0 2px 4px 0 rgba(91, 82, 74, 0.06)',

    // Special Islamic decorative shadow
    glow: '0 0 20px rgba(212, 165, 116, 0.3)',
    'glow-strong': '0 0 30px rgba(212, 165, 116, 0.5)',
  },

  // ============================================
  // TRANSITIONS & ANIMATIONS
  // ============================================
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      medium: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Animation presets
  animations: {
    fadeIn: {
      keyframes: {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      duration: '300ms',
      timing: 'ease-out',
    },
    slideUp: {
      keyframes: {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      duration: '400ms',
      timing: 'ease-out',
    },
    slideDown: {
      keyframes: {
        from: { opacity: 0, transform: 'translateY(-20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      duration: '400ms',
      timing: 'ease-out',
    },
    scaleIn: {
      keyframes: {
        from: { opacity: 0, transform: 'scale(0.95)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
      duration: '200ms',
      timing: 'ease-out',
    },
    shimmer: {
      keyframes: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      duration: '2s',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
    pulse: {
      keyframes: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      duration: '2s',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
  },

  // ============================================
  // ISLAMIC DESIGN ELEMENTS
  // ============================================
  islamic: {
    // Geometric patterns
    patterns: {
      arabesque: "url('/patterns/arabesque.svg')",
      geometric: "url('/patterns/geometric.svg')",
      mosque: "url('/patterns/mosque-silhouette.svg')",
    },

    // Common gradients used in Islamic design
    gradients: {
      gold: 'linear-gradient(135deg, #FFD4A3 0%, #D4A574 50%, #B08C4F 100%)',
      cream: 'linear-gradient(135deg, #FFF5E6 0%, #F5E6D3 50%, #E4C8AB 100%)',
      sunset: 'linear-gradient(135deg, #FFE4A3 0%, #E8B67A 30%, #D48B6E 100%)',
      sky: 'linear-gradient(180deg, #FFE4C2 0%, #FFF5E6 50%, #FFFFFF 100%)',
    },

    // Icon sizes for Islamic symbols
    iconSizes: {
      xs: '16px',
      sm: '20px',
      md: '24px',
      lg: '32px',
      xl: '48px',
      '2xl': '64px',
    },
  },

  // ============================================
  // COMPONENT SPECIFIC STYLES
  // ============================================
  components: {
    // Card styles
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
      background: '#FFFFFF',
      border: '1px solid #EBE7E2',
      borderRadius: '1rem',
      shadow: '0 2px 8px 0 rgba(91, 82, 74, 0.08)',
      hoverShadow: '0 8px 24px 0 rgba(91, 82, 74, 0.12)',
    },

    // Button styles
    button: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
      borderRadius: '0.75rem',
    },

    // Input styles
    input: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      border: '1px solid #D4CEC6',
      focusBorder: '1px solid #D4A574',
      focusShadow: '0 0 0 3px rgba(212, 165, 116, 0.1)',
    },

    // Badge styles
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
  },

  // ============================================
  // BREAKPOINTS (Mobile-first approach)
  // ============================================
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================
  // Z-INDEX LAYERS
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default designSystem;
