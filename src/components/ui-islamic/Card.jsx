/**
 * Islamic Modern Card Component
 * Reusable card component with Islamic design aesthetics
 */

import React from 'react';
import { designSystem } from '@/styles/design-system';

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  pattern = false,
  onClick,
  ...props
}) {
  const variants = {
    default: {
      background: designSystem.colors.background.primary,
      border: `1px solid ${designSystem.colors.border.DEFAULT}`,
    },
    cream: {
      background: designSystem.colors.background.secondary,
      border: `1px solid ${designSystem.colors.border.light}`,
    },
    gradient: {
      background: designSystem.islamic.gradients.cream,
      border: 'none',
    },
    elevated: {
      background: designSystem.colors.background.primary,
      border: 'none',
      boxShadow: designSystem.shadows.lg,
    },
  };

  const paddingMap = {
    sm: designSystem.components.card.padding.sm,
    md: designSystem.components.card.padding.md,
    lg: designSystem.components.card.padding.lg,
  };

  const baseStyle = {
    backgroundColor: variants[variant].background,
    border: variants[variant].border,
    borderRadius: designSystem.components.card.borderRadius,
    padding: paddingMap[padding],
    transition: `all ${designSystem.transitions.duration.base} ${designSystem.transitions.timing.easeOut}`,
    ...(variants[variant].boxShadow && { boxShadow: variants[variant].boxShadow }),
    ...(pattern && {
      backgroundImage: designSystem.islamic.patterns.geometric,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }),
  };

  const hoverStyle = hover ? {
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: designSystem.shadows.xl,
    },
  } : {};

  return (
    <div
      className={`card-islamic ${className}`}
      style={baseStyle}
      onClick={onClick}
      {...props}
    >
      {children}
      <style jsx>{`
        .card-islamic:hover {
          ${hover ? `
            transform: translateY(-4px);
            box-shadow: ${designSystem.shadows.xl};
          ` : ''}
        }
      `}</style>
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`card-header ${className}`} style={{ marginBottom: designSystem.spacing[4] }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', variant = 'default' }) {
  const variants = {
    default: {
      fontSize: designSystem.typography.fontSize['2xl'],
      fontWeight: designSystem.typography.fontWeight.bold,
      color: designSystem.colors.text.primary,
    },
    large: {
      fontSize: designSystem.typography.fontSize['3xl'],
      fontWeight: designSystem.typography.fontWeight.bold,
      color: designSystem.colors.text.primary,
    },
    small: {
      fontSize: designSystem.typography.fontSize.xl,
      fontWeight: designSystem.typography.fontWeight.semibold,
      color: designSystem.colors.text.primary,
    },
  };

  return (
    <h3 className={`card-title ${className}`} style={variants[variant]}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p
      className={`card-description ${className}`}
      style={{
        fontSize: designSystem.typography.fontSize.sm,
        color: designSystem.colors.text.secondary,
        lineHeight: designSystem.typography.lineHeight.relaxed,
        marginTop: designSystem.spacing[2],
      }}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`card-content ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', align = 'right' }) {
  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  };

  return (
    <div
      className={`card-footer ${className}`}
      style={{
        marginTop: designSystem.spacing[6],
        display: 'flex',
        justifyContent: alignMap[align],
        gap: designSystem.spacing[3],
      }}
    >
      {children}
    </div>
  );
}

// Preset card variants for common use cases
export function StatsCard({ icon, title, value, trend, className = '' }) {
  return (
    <Card variant="elevated" hover className={className}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.text.secondary,
              marginBottom: designSystem.spacing[2],
            }}>
              {title}
            </p>
            <h3 style={{
              fontSize: designSystem.typography.fontSize['3xl'],
              fontWeight: designSystem.typography.fontWeight.bold,
              color: designSystem.colors.text.primary,
            }}>
              {value}
            </h3>
            {trend && (
              <p style={{
                fontSize: designSystem.typography.fontSize.xs,
                color: trend > 0 ? designSystem.colors.success.DEFAULT : designSystem.colors.error.DEFAULT,
                marginTop: designSystem.spacing[2],
              }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </p>
            )}
          </div>
          {icon && (
            <div style={{
              width: designSystem.islamic.iconSizes.lg,
              height: designSystem.islamic.iconSizes.lg,
              borderRadius: designSystem.borderRadius.lg,
              background: designSystem.islamic.gradients.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: designSystem.colors.text.inverse,
            }}>
              {(() => {
                if (!icon) return null;
                if (React.isValidElement(icon)) return icon;
                if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))) {
                  const IconComp = icon;
                  return <IconComp size={24} />;
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FeatureCard({ icon, title, description, onClick, className = '' }) {
  return (
    <Card variant="cream" hover onClick={onClick} className={className}>
      <CardContent>
        <div style={{ textAlign: 'center' }}>
          {icon && (
            <div style={{
              width: designSystem.islamic.iconSizes.xl,
              height: designSystem.islamic.iconSizes.xl,
              borderRadius: designSystem.borderRadius.xl,
              background: designSystem.islamic.gradients.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: designSystem.spacing[4],
              color: designSystem.colors.text.inverse,
            }}>
              {(() => {
                if (React.isValidElement(icon)) return icon;
                if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))) {
                  const IconComp = icon;
                  return <IconComp size={32} />;
                }
                return null;
              })()}
            </div>
          )}
          <h4 style={{
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing[2],
          }}>
            {title}
          </h4>
          {description && (
            <p style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.text.secondary,
              lineHeight: designSystem.typography.lineHeight.relaxed,
            }}>
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
