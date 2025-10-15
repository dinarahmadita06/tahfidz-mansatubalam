/**
 * Islamic Modern Typography Components
 * Reusable typography components with Islamic design aesthetics
 */

import { designSystem } from '@/styles/design-system';

export function Heading({
  level = 1,
  children,
  variant = 'default',
  align = 'left',
  className = '',
  ...props
}) {
  const Tag = `h${level}`;

  const variants = {
    default: {
      fontFamily: designSystem.typography.fontFamily.sans,
      color: designSystem.colors.text.primary,
    },
    serif: {
      fontFamily: designSystem.typography.fontFamily.serif,
      color: designSystem.colors.text.primary,
    },
    gradient: {
      fontFamily: designSystem.typography.fontFamily.sans,
      background: designSystem.islamic.gradients.gold,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  };

  const levelStyles = {
    1: {
      fontSize: designSystem.typography.fontSize['4xl'],
      fontWeight: designSystem.typography.fontWeight.bold,
      lineHeight: designSystem.typography.lineHeight.tight,
      marginBottom: designSystem.spacing[6],
    },
    2: {
      fontSize: designSystem.typography.fontSize['3xl'],
      fontWeight: designSystem.typography.fontWeight.bold,
      lineHeight: designSystem.typography.lineHeight.tight,
      marginBottom: designSystem.spacing[5],
    },
    3: {
      fontSize: designSystem.typography.fontSize['2xl'],
      fontWeight: designSystem.typography.fontWeight.semibold,
      lineHeight: designSystem.typography.lineHeight.normal,
      marginBottom: designSystem.spacing[4],
    },
    4: {
      fontSize: designSystem.typography.fontSize.xl,
      fontWeight: designSystem.typography.fontWeight.semibold,
      lineHeight: designSystem.typography.lineHeight.normal,
      marginBottom: designSystem.spacing[3],
    },
    5: {
      fontSize: designSystem.typography.fontSize.lg,
      fontWeight: designSystem.typography.fontWeight.medium,
      lineHeight: designSystem.typography.lineHeight.normal,
      marginBottom: designSystem.spacing[2],
    },
    6: {
      fontSize: designSystem.typography.fontSize.base,
      fontWeight: designSystem.typography.fontWeight.medium,
      lineHeight: designSystem.typography.lineHeight.normal,
      marginBottom: designSystem.spacing[2],
    },
  };

  const style = {
    ...variants[variant],
    ...levelStyles[level],
    textAlign: align,
  };

  return (
    <Tag className={className} style={style} {...props}>
      {children}
    </Tag>
  );
}

export function Text({
  children,
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  className = '',
  ...props
}) {
  const colorMap = {
    primary: designSystem.colors.text.primary,
    secondary: designSystem.colors.text.secondary,
    tertiary: designSystem.colors.text.tertiary,
    inverse: designSystem.colors.text.inverse,
    muted: designSystem.colors.text.muted,
  };

  const style = {
    fontSize: designSystem.typography.fontSize[size],
    fontWeight: designSystem.typography.fontWeight[weight],
    color: colorMap[color],
    lineHeight: designSystem.typography.lineHeight.relaxed,
    textAlign: align,
  };

  return (
    <p className={className} style={style} {...props}>
      {children}
    </p>
  );
}

export function ArabicText({
  children,
  size = 'xl',
  weight = 'normal',
  align = 'right',
  className = '',
  ...props
}) {
  const style = {
    fontFamily: designSystem.typography.fontFamily.arabic,
    fontSize: designSystem.typography.fontSize[size],
    fontWeight: designSystem.typography.fontWeight[weight],
    color: designSystem.colors.text.primary,
    lineHeight: designSystem.typography.lineHeight.loose,
    textAlign: align,
    direction: 'rtl',
  };

  return (
    <p className={`font-arabic ${className}`} style={style} {...props}>
      {children}
    </p>
  );
}

export function Label({
  children,
  htmlFor,
  required = false,
  size = 'sm',
  className = '',
  ...props
}) {
  const style = {
    display: 'block',
    fontSize: designSystem.typography.fontSize[size],
    fontWeight: designSystem.typography.fontWeight.medium,
    color: designSystem.colors.text.primary,
    marginBottom: designSystem.spacing[2],
  };

  return (
    <label htmlFor={htmlFor} className={className} style={style} {...props}>
      {children}
      {required && (
        <span style={{ color: designSystem.colors.error.DEFAULT, marginLeft: designSystem.spacing[1] }}>
          *
        </span>
      )}
    </label>
  );
}

export function Caption({
  children,
  color = 'tertiary',
  className = '',
  ...props
}) {
  const colorMap = {
    primary: designSystem.colors.text.primary,
    secondary: designSystem.colors.text.secondary,
    tertiary: designSystem.colors.text.tertiary,
    muted: designSystem.colors.text.muted,
  };

  const style = {
    fontSize: designSystem.typography.fontSize.xs,
    color: colorMap[color],
    lineHeight: designSystem.typography.lineHeight.normal,
  };

  return (
    <span className={className} style={style} {...props}>
      {children}
    </span>
  );
}

export function Quote({
  children,
  author,
  className = '',
  ...props
}) {
  return (
    <blockquote
      className={className}
      style={{
        padding: designSystem.spacing[6],
        borderLeft: `4px solid ${designSystem.colors.primary[400]}`,
        background: designSystem.colors.background.secondary,
        borderRadius: designSystem.borderRadius.lg,
        fontStyle: 'italic',
        color: designSystem.colors.text.secondary,
        fontSize: designSystem.typography.fontSize.lg,
        lineHeight: designSystem.typography.lineHeight.relaxed,
      }}
      {...props}
    >
      {children}
      {author && (
        <footer
          style={{
            marginTop: designSystem.spacing[3],
            fontSize: designSystem.typography.fontSize.sm,
            fontStyle: 'normal',
            color: designSystem.colors.text.tertiary,
          }}
        >
          — {author}
        </footer>
      )}
    </blockquote>
  );
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default: {
      background: designSystem.colors.neutral[100],
      color: designSystem.colors.text.primary,
    },
    primary: {
      background: designSystem.colors.primary[100],
      color: designSystem.colors.primary[800],
    },
    success: {
      background: designSystem.colors.success.light,
      color: designSystem.colors.success.dark,
    },
    warning: {
      background: designSystem.colors.warning.light,
      color: designSystem.colors.warning.dark,
    },
    error: {
      background: designSystem.colors.error.light,
      color: designSystem.colors.error.dark,
    },
    gradient: {
      background: designSystem.islamic.gradients.gold,
      color: designSystem.colors.text.inverse,
    },
  };

  const sizeMap = {
    sm: {
      fontSize: designSystem.typography.fontSize.xs,
      padding: '0.125rem 0.5rem',
    },
    md: {
      fontSize: designSystem.typography.fontSize.sm,
      padding: designSystem.components.badge.padding,
    },
    lg: {
      fontSize: designSystem.typography.fontSize.base,
      padding: '0.375rem 1rem',
    },
  };

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: designSystem.components.badge.fontWeight,
    borderRadius: designSystem.components.badge.borderRadius,
    whiteSpace: 'nowrap',
    ...variants[variant],
    ...sizeMap[size],
  };

  return (
    <span className={className} style={style} {...props}>
      {children}
    </span>
  );
}

export function Divider({
  orientation = 'horizontal',
  variant = 'default',
  spacing = 'md',
  className = '',
}) {
  const spacingMap = {
    sm: designSystem.spacing[2],
    md: designSystem.spacing[4],
    lg: designSystem.spacing[6],
  };

  const variants = {
    default: {
      background: designSystem.colors.border.DEFAULT,
    },
    gradient: {
      background: designSystem.islamic.gradients.gold,
    },
    dashed: {
      background: 'transparent',
      borderTop: orientation === 'horizontal' ? `2px dashed ${designSystem.colors.border.DEFAULT}` : 'none',
      borderLeft: orientation === 'vertical' ? `2px dashed ${designSystem.colors.border.DEFAULT}` : 'none',
    },
  };

  const style = orientation === 'horizontal' ? {
    width: '100%',
    height: variant === 'dashed' ? '0' : '1px',
    marginTop: spacingMap[spacing],
    marginBottom: spacingMap[spacing],
    ...variants[variant],
  } : {
    width: variant === 'dashed' ? '0' : '1px',
    height: '100%',
    marginLeft: spacingMap[spacing],
    marginRight: spacingMap[spacing],
    ...variants[variant],
  };

  return <div className={className} style={style} />;
}

export function Link({
  children,
  href,
  external = false,
  className = '',
  ...props
}) {
  const style = {
    color: designSystem.colors.primary[600],
    textDecoration: 'none',
    fontWeight: designSystem.typography.fontWeight.medium,
    transition: `color ${designSystem.transitions.duration.base} ${designSystem.transitions.timing.easeOut}`,
  };

  return (
    <a
      href={href}
      className={className}
      style={style}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {external && (
        <span style={{ marginLeft: designSystem.spacing[1] }}>↗</span>
      )}
      <style jsx>{`
        a:hover {
          color: ${designSystem.colors.primary[700]};
          text-decoration: underline;
        }
      `}</style>
    </a>
  );
}
