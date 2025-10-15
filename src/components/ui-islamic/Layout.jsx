/**
 * Islamic Modern Layout Components
 * Reusable layout components with Islamic design aesthetics
 */

import { designSystem } from '@/styles/design-system';

export function Container({
  children,
  size = 'default',
  padding = true,
  className = '',
  ...props
}) {
  const sizeMap = {
    sm: '640px',
    md: '768px',
    default: '1024px',
    lg: '1280px',
    xl: '1536px',
    full: '100%',
  };

  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: sizeMap[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: padding ? `0 ${designSystem.spacing[4]}` : '0',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  children,
  background = 'default',
  pattern = false,
  padding = 'default',
  className = '',
  ...props
}) {
  const backgroundMap = {
    default: designSystem.colors.background.primary,
    cream: designSystem.colors.background.secondary,
    gradient: designSystem.islamic.gradients.sky,
  };

  const paddingMap = {
    none: '0',
    sm: `${designSystem.spacing[8]} 0`,
    default: `${designSystem.spacing[12]} 0`,
    lg: `${designSystem.spacing[16]} 0`,
    xl: `${designSystem.spacing[20]} 0`,
  };

  return (
    <section
      className={className}
      style={{
        background: backgroundMap[background],
        padding: paddingMap[padding],
        position: 'relative',
        overflow: 'hidden',
      }}
      {...props}
    >
      {pattern && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            pointerEvents: 'none',
            backgroundImage: designSystem.islamic.patterns.geometric,
            backgroundSize: '200px 200px',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

export function Grid({
  children,
  cols = 3,
  gap = 'md',
  responsive = true,
  className = '',
  ...props
}) {
  const gapMap = {
    sm: designSystem.spacing[3],
    md: designSystem.spacing[6],
    lg: designSystem.spacing[8],
  };

  const responsiveStyles = responsive ? {
    gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
  } : {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
  };

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gap: gapMap[gap],
        ...responsiveStyles,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Flex({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'flex-start',
  gap = 'md',
  wrap = false,
  className = '',
  ...props
}) {
  const gapMap = {
    none: '0',
    sm: designSystem.spacing[2],
    md: designSystem.spacing[4],
    lg: designSystem.spacing[6],
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap: gapMap[gap],
        flexWrap: wrap ? 'wrap' : 'nowrap',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Stack({
  children,
  spacing = 'md',
  divider = false,
  className = '',
  ...props
}) {
  const spacingMap = {
    sm: designSystem.spacing[2],
    md: designSystem.spacing[4],
    lg: designSystem.spacing[6],
    xl: designSystem.spacing[8],
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacingMap[spacing],
      }}
      {...props}
    >
      {divider
        ? children.map((child, index) => (
            <div key={index}>
              {child}
              {index < children.length - 1 && (
                <hr
                  style={{
                    border: 'none',
                    borderTop: `1px solid ${designSystem.colors.border.DEFAULT}`,
                    margin: `${spacingMap[spacing]} 0`,
                  }}
                />
              )}
            </div>
          ))
        : children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  pattern = true,
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        background: designSystem.islamic.gradients.cream,
        padding: `${designSystem.spacing[8]} 0`,
        marginBottom: designSystem.spacing[8],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {pattern && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            pointerEvents: 'none',
            backgroundImage: designSystem.islamic.patterns.arabesque,
            backgroundSize: '100px 100px',
          }}
        />
      )}
      <Container>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {breadcrumbs && (
            <div
              style={{
                marginBottom: designSystem.spacing[4],
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.text.tertiary,
              }}
            >
              {breadcrumbs}
            </div>
          )}
          <Flex justify="space-between" align="center" wrap>
            <div>
              <h1
                style={{
                  fontSize: designSystem.typography.fontSize['4xl'],
                  fontWeight: designSystem.typography.fontWeight.bold,
                  color: designSystem.colors.text.primary,
                  marginBottom: subtitle ? designSystem.spacing[2] : 0,
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  style={{
                    fontSize: designSystem.typography.fontSize.lg,
                    color: designSystem.colors.text.secondary,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div>{actions}</div>}
          </Flex>
        </div>
      </Container>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        textAlign: 'center',
        padding: `${designSystem.spacing[12]} ${designSystem.spacing[4]}`,
      }}
    >
      {icon && (
        <div
          style={{
            width: designSystem.islamic.iconSizes['2xl'],
            height: designSystem.islamic.iconSizes['2xl'],
            margin: '0 auto',
            marginBottom: designSystem.spacing[4],
            borderRadius: designSystem.borderRadius.full,
            background: designSystem.colors.background.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: designSystem.colors.text.muted,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: designSystem.typography.fontSize['2xl'],
          fontWeight: designSystem.typography.fontWeight.semibold,
          color: designSystem.colors.text.primary,
          marginBottom: designSystem.spacing[2],
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.base,
            color: designSystem.colors.text.secondary,
            marginBottom: action ? designSystem.spacing[6] : 0,
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: designSystem.spacing[6] }}>{action}</div>}
    </div>
  );
}

export function LoadingState({
  size = 'md',
  text = 'Memuat...',
  fullScreen = false,
  className = '',
}) {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '60px',
  };

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: designSystem.spacing[4],
      }}
    >
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: `4px solid ${designSystem.colors.border.DEFAULT}`,
          borderTop: `4px solid ${designSystem.colors.primary[500]}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && (
        <p
          style={{
            fontSize: designSystem.typography.fontSize.base,
            color: designSystem.colors.text.secondary,
          }}
        >
          {text}
        </p>
      )}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: designSystem.colors.background.overlay,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: designSystem.zIndex.modal,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        padding: `${designSystem.spacing[12]} 0`,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {content}
    </div>
  );
}

export function Spacer({ size = 'md', orientation = 'vertical' }) {
  const sizeMap = {
    xs: designSystem.spacing[1],
    sm: designSystem.spacing[2],
    md: designSystem.spacing[4],
    lg: designSystem.spacing[6],
    xl: designSystem.spacing[8],
    '2xl': designSystem.spacing[12],
  };

  return (
    <div
      style={
        orientation === 'vertical'
          ? { height: sizeMap[size] }
          : { width: sizeMap[size] }
      }
    />
  );
}

export function Box({
  children,
  padding,
  margin,
  background,
  border,
  borderRadius,
  shadow,
  className = '',
  ...props
}) {
  return (
    <div
      className={className}
      style={{
        padding: padding,
        margin: margin,
        background: background,
        border: border,
        borderRadius: borderRadius,
        boxShadow: shadow,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
