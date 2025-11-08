/**
 * Responsive Wrapper Components for Admin Pages
 * Provides consistent responsive behavior across all admin pages
 */

export function ResponsiveContainer({ children, className = '' }) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = ''
}) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-5 lg:gap-6',
    lg: 'gap-5 sm:gap-6 lg:gap-8',
  };

  const gridCols = `grid-cols-${cols.sm} sm:grid-cols-${cols.md} lg:grid-cols-${cols.lg} xl:grid-cols-${cols.xl}`;

  return (
    <div className={`grid ${gridCols} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveCard({ children, className = '', padding = 'default' }) {
  const paddingClasses = {
    default: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-6 sm:p-7 lg:p-8',
    sm: 'p-3 sm:p-4 lg:p-5',
  };

  return (
    <div className={`rounded-xl sm:rounded-2xl lg:rounded-3xl ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveHeading({
  level = 1,
  children,
  className = '',
  gradient = false
}) {
  const Tag = `h${level}`;

  const sizeClasses = {
    1: 'text-2xl sm:text-3xl lg:text-4xl',
    2: 'text-xl sm:text-2xl lg:text-3xl',
    3: 'text-lg sm:text-xl lg:text-2xl',
    4: 'text-base sm:text-lg lg:text-xl',
  };

  const gradientClass = gradient
    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent'
    : '';

  return (
    <Tag className={`font-bold ${sizeClasses[level]} ${gradientClass} ${className}`}>
      {children}
    </Tag>
  );
}

export function ResponsiveText({
  size = 'base',
  children,
  className = ''
}) {
  const sizeClasses = {
    xs: 'text-xs sm:text-xs',
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  };

  return (
    <p className={`${sizeClasses[size]} ${className}`}>
      {children}
    </p>
  );
}

export function ResponsiveButton({
  children,
  className = '',
  size = 'default',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
    default: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base',
    lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
  };

  return (
    <button
      className={`rounded-lg sm:rounded-xl transition-all ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ResponsiveTableWrapper({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 sm:rounded-xl lg:rounded-2xl ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ResponsiveStatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'emerald',
  className = ''
}) {
  const colorSchemes = {
    emerald: {
      bg: 'from-emerald-50 to-teal-50/50',
      border: 'border-emerald-100/50',
      iconBg: 'from-emerald-400 to-emerald-500',
      text: 'text-emerald-700',
    },
    amber: {
      bg: 'from-amber-50 to-yellow-50/50',
      border: 'border-amber-100/50',
      iconBg: 'from-amber-400 to-amber-500',
      text: 'text-amber-700',
    },
    blue: {
      bg: 'from-blue-50 to-sky-50/50',
      border: 'border-blue-100/50',
      iconBg: 'from-blue-400 to-blue-500',
      text: 'text-blue-700',
    },
    purple: {
      bg: 'from-purple-50 to-violet-50/50',
      border: 'border-purple-100/50',
      iconBg: 'from-purple-400 to-purple-500',
      text: 'text-purple-700',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.emerald;

  return (
    <div className={`
      bg-gradient-to-br ${scheme.bg}
      rounded-2xl sm:rounded-3xl
      p-4 sm:p-5 lg:p-6
      shadow-lg border ${scheme.border}
      hover:shadow-xl transition-all duration-300
      ${className}
    `}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`
          w-12 h-12 sm:w-14 sm:h-14
          bg-gradient-to-br ${scheme.iconBg}
          rounded-xl sm:rounded-2xl
          flex items-center justify-center
          shadow-md flex-shrink-0
        `}>
          {Icon && <Icon className="text-white" size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
            {title}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${scheme.text} truncate`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'xl',
  className = ''
}) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`
        bg-white rounded-2xl sm:rounded-3xl
        p-6 sm:p-8
        w-full ${maxWidthClasses[maxWidth]}
        shadow-2xl my-8
        ${className}
      `}>
        {title && (
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}

export function ResponsiveChartContainer({ children, className = '', title }) {
  return (
    <ResponsiveCard className={`bg-white shadow-xl border border-gray-100/30 ${className}`}>
      {title && (
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          {title}
        </h3>
      )}
      <div className="w-full h-64 sm:h-72 lg:h-80">
        {children}
      </div>
    </ResponsiveCard>
  );
}
