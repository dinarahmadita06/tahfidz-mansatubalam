/**
 * Islamic Modern Button Component
 * Reusable button component with Islamic design aesthetics
 */

import { designSystem } from '@/styles/design-system';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: {
      background: designSystem.islamic.gradients.gold,
      color: designSystem.colors.text.inverse,
      border: 'none',
      hover: {
        boxShadow: designSystem.shadows['glow-strong'],
        transform: 'translateY(-2px)',
      },
    },
    secondary: {
      background: designSystem.colors.background.secondary,
      color: designSystem.colors.text.primary,
      border: `1px solid ${designSystem.colors.border.DEFAULT}`,
      hover: {
        background: designSystem.colors.background.tertiary,
        borderColor: designSystem.colors.primary[400],
      },
    },
    outline: {
      background: 'transparent',
      color: designSystem.colors.primary[600],
      border: `2px solid ${designSystem.colors.primary[500]}`,
      hover: {
        background: designSystem.colors.primary[50],
        borderColor: designSystem.colors.primary[600],
      },
    },
    ghost: {
      background: 'transparent',
      color: designSystem.colors.text.primary,
      border: 'none',
      hover: {
        background: designSystem.colors.background.secondary,
      },
    },
    danger: {
      background: designSystem.colors.error.DEFAULT,
      color: designSystem.colors.text.inverse,
      border: 'none',
      hover: {
        background: designSystem.colors.error.dark,
      },
    },
    success: {
      background: designSystem.colors.success.DEFAULT,
      color: designSystem.colors.text.inverse,
      border: 'none',
      hover: {
        background: designSystem.colors.success.dark,
      },
    },
  };

  const sizeMap = {
    sm: {
      height: designSystem.components.button.height.sm,
      padding: designSystem.components.button.padding.sm,
      fontSize: designSystem.typography.fontSize.sm,
    },
    md: {
      height: designSystem.components.button.height.md,
      padding: designSystem.components.button.padding.md,
      fontSize: designSystem.typography.fontSize.base,
    },
    lg: {
      height: designSystem.components.button.height.lg,
      padding: designSystem.components.button.padding.lg,
      fontSize: designSystem.typography.fontSize.lg,
    },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designSystem.spacing[2],
    fontWeight: designSystem.typography.fontWeight.semibold,
    borderRadius: designSystem.components.button.borderRadius,
    transition: `all ${designSystem.transitions.duration.base} ${designSystem.transitions.timing.easeOut}`,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...variants[variant],
    ...sizeMap[size],
    border: variants[variant].border,
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`btn-islamic ${className}`}
      style={baseStyle}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size={size} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
        </>
      )}
      <style jsx>{`
        .btn-islamic:hover:not(:disabled) {
          ${variants[variant].hover.background ? `background: ${variants[variant].hover.background};` : ''}
          ${variants[variant].hover.borderColor ? `border-color: ${variants[variant].hover.borderColor};` : ''}
          ${variants[variant].hover.boxShadow ? `box-shadow: ${variants[variant].hover.boxShadow};` : ''}
          ${variants[variant].hover.transform ? `transform: ${variants[variant].hover.transform};` : ''}
        }
        .btn-islamic:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
    </button>
  );
}

function LoadingSpinner({ size = 'md' }) {
  const sizeMap = {
    sm: '14px',
    md: '16px',
    lg: '20px',
  };

  return (
    <div
      className="spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    >
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// Button Group Component
export function ButtonGroup({ children, className = '', spacing = 'md' }) {
  const spacingMap = {
    sm: designSystem.spacing[2],
    md: designSystem.spacing[3],
    lg: designSystem.spacing[4],
  };

  return (
    <div
      className={`button-group ${className}`}
      style={{
        display: 'flex',
        gap: spacingMap[spacing],
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
  );
}

// Icon Button Component
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = true,
  tooltip,
  className = '',
  ...props
}) {
  const sizeMap = {
    sm: {
      width: '2rem',
      height: '2rem',
      fontSize: designSystem.typography.fontSize.sm,
    },
    md: {
      width: '2.5rem',
      height: '2.5rem',
      fontSize: designSystem.typography.fontSize.base,
    },
    lg: {
      width: '3rem',
      height: '3rem',
      fontSize: designSystem.typography.fontSize.lg,
    },
  };

  return (
    <Button
      variant={variant}
      className={className}
      {...props}
      style={{
        ...sizeMap[size],
        padding: 0,
        borderRadius: rounded ? designSystem.borderRadius.full : designSystem.borderRadius.md,
      }}
      title={tooltip}
    >
      {icon}
    </Button>
  );
}
