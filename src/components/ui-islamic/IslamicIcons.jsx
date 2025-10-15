/**
 * Islamic Icons Component
 * Collection of Islamic-themed icons and decorative elements
 */

import { designSystem } from '@/styles/design-system';

// Base Icon wrapper
function Icon({ children, size = 'md', color = 'currentColor', className = '', ...props }) {
  const sizeMap = {
    xs: designSystem.islamic.iconSizes.xs,
    sm: designSystem.islamic.iconSizes.sm,
    md: designSystem.islamic.iconSizes.md,
    lg: designSystem.islamic.iconSizes.lg,
    xl: designSystem.islamic.iconSizes.xl,
    '2xl': designSystem.islamic.iconSizes['2xl'],
  };

  return (
    <svg
      width={sizeMap[size]}
      height={sizeMap[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

// Islamic Icons
export function MosqueIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <path d="M12 2L8 6H4v10h16V6h-4l-4-4z" />
      <circle cx="12" cy="6" r="1" />
      <path d="M4 16h16v4H4z" />
      <circle cx="7" cy="10" r="1" />
      <circle cx="17" cy="10" r="1" />
    </Icon>
  );
}

export function QuranIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 6h8M9 10h8M9 14h5" />
    </Icon>
  );
}

export function PrayerIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <path d="M12 2v20M6 8l6-2 6 2" />
      <circle cx="12" cy="4" r="2" />
      <path d="M8 14h8v6H8z" />
    </Icon>
  );
}

export function KaabaIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <path d="M12 2L4 6v12l8 4 8-4V6l-8-4z" />
      <path d="M12 2v20M4 6l8 4M20 6l-8 4M4 18l8-4M20 18l-8-4" />
    </Icon>
  );
}

export function TasbihIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="9" cy="10" r="1.5" />
      <circle cx="15" cy="10" r="1.5" />
      <circle cx="8" cy="14" r="1.5" />
      <circle cx="16" cy="14" r="1.5" />
      <circle cx="10" cy="17" r="1.5" />
      <circle cx="14" cy="17" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </Icon>
  );
}

export function StarCrescentIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <path d="M9 2a8 8 0 0 1 8 8 8 8 0 0 1-8 8A8 8 0 0 0 9 2z" />
      <path d="M19 7l-1.5 3 3.5 1-3.5 1L19 15l-1.5-3-3.5 1 3.5-1L19 7z" />
    </Icon>
  );
}

export function HijabIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-4 2.5-8 6-8s6 4 6 8" />
      <path d="M8 12c-2 1-4 3-4 8M16 12c2 1 4 3 4 8" />
    </Icon>
  );
}

export function CalendarIslamicIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <path d="M12 14a2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1 2 2z" />
    </Icon>
  );
}

export function LanternIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <path d="M9 2h6l1 4H8l1-4z" />
      <path d="M8 6h8l2 8H6l2-8z" />
      <path d="M6 14h12l-2 6H8l-2-6z" />
      <path d="M10 20h4v2h-4z" />
    </Icon>
  );
}

export function ZakatIcon({ size = 'md', color = 'currentColor', ...props }) {
  return (
    <Icon size={size} color={color} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9h6M8 15h8" />
    </Icon>
  );
}

// Decorative Islamic Pattern Components
export function ArabesquePattern({ width = '100%', height = '100px', opacity = 0.1 }) {
  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, opacity }}
    >
      <defs>
        <pattern id="arabesque" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M0 20 Q10 10 20 20 T40 20 M20 0 Q30 10 20 20 T20 40"
            fill="none"
            stroke={designSystem.colors.primary[400]}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arabesque)" />
    </svg>
  );
}

export function GeometricPattern({ width = '100%', height = '100px', opacity = 0.1 }) {
  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, opacity }}
    >
      <defs>
        <pattern id="geometric" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon
            points="30,0 60,30 30,60 0,30"
            fill="none"
            stroke={designSystem.colors.primary[400]}
            strokeWidth="1"
          />
          <circle cx="30" cy="30" r="10" fill="none" stroke={designSystem.colors.primary[400]} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geometric)" />
    </svg>
  );
}

export function MosqueSilhouette({ width = '200px', height = '100px', color }) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 100" fill={color || designSystem.colors.primary[300]}>
      {/* Main dome */}
      <ellipse cx="100" cy="50" rx="30" ry="20" />
      {/* Side domes */}
      <ellipse cx="60" cy="60" rx="15" ry="10" />
      <ellipse cx="140" cy="60" rx="15" ry="10" />
      {/* Minarets */}
      <rect x="30" y="50" width="8" height="50" />
      <rect x="162" y="50" width="8" height="50" />
      {/* Minaret tops */}
      <circle cx="34" cy="45" r="6" />
      <circle cx="166" cy="45" r="6" />
      {/* Base */}
      <rect x="50" y="70" width="100" height="30" />
    </svg>
  );
}

// Icon container with decorative border
export function IconContainer({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default: {
      background: designSystem.colors.background.secondary,
      border: `1px solid ${designSystem.colors.border.DEFAULT}`,
    },
    gradient: {
      background: designSystem.islamic.gradients.gold,
      border: 'none',
    },
    outlined: {
      background: 'transparent',
      border: `2px solid ${designSystem.colors.primary[400]}`,
    },
  };

  const sizeMap = {
    sm: {
      width: '2.5rem',
      height: '2.5rem',
    },
    md: {
      width: '3.5rem',
      height: '3.5rem',
    },
    lg: {
      width: '4.5rem',
      height: '4.5rem',
    },
    xl: {
      width: '6rem',
      height: '6rem',
    },
  };

  return (
    <div
      className={className}
      style={{
        ...sizeMap[size],
        ...variants[variant],
        borderRadius: designSystem.borderRadius.xl,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: variant === 'gradient' ? designSystem.colors.text.inverse : designSystem.colors.primary[600],
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Feature icon with badge
export function FeatureIcon({ icon, badge, size = 'lg', ...props }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <IconContainer size={size} variant="gradient" {...props}>
        {icon}
      </IconContainer>
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: '-0.25rem',
            right: '-0.25rem',
            background: designSystem.colors.error.DEFAULT,
            color: designSystem.colors.text.inverse,
            borderRadius: designSystem.borderRadius.full,
            width: '1.5rem',
            height: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: designSystem.typography.fontSize.xs,
            fontWeight: designSystem.typography.fontWeight.bold,
            border: `2px solid ${designSystem.colors.background.primary}`,
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}
