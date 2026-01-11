import React from 'react';

/**
 * IslamicButton - Modern Islamic-themed buttons
 * Berbagai varian button dengan desain modern islami
 */

export function IslamicButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  onClick,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white",
    secondary: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white",
    outline: "border-2 border-sage-300 text-sage-700 hover:bg-sage-50",
    ghost: "text-sage-700 hover:bg-sage-100",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && (
        (() => {
          if (React.isValidElement(Icon)) return Icon;
          const isComponent = 
            typeof Icon === 'function' || 
            (typeof Icon === 'object' && Icon !== null && (
              Icon.$$typeof === Symbol.for('react.forward_ref') || 
              Icon.$$typeof === Symbol.for('react.memo') ||
              Icon.render || 
              Icon.displayName
            ));
          if (isComponent) {
            const IconComp = Icon;
            return <IconComp className="w-5 h-5" strokeWidth={2.5} />;
          }
          return null;
        })()
      )}
      {children}
    </button>
  );
}

export function IslamicIconButton({ icon: Icon, tooltip, onClick, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-gradient-to-br from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600",
    secondary: "bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600",
    danger: "bg-gradient-to-br from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600",
    info: "bg-gradient-to-br from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        group w-10 h-10 rounded-xl ${variants[variant]}
        flex items-center justify-center shadow-md
        hover:shadow-lg hover:scale-110
        transition-all duration-300
        ${className}
      `}
    >
      {(() => {
        if (React.isValidElement(Icon)) return Icon;
        const isComponent = 
          typeof Icon === 'function' || 
          (typeof Icon === 'object' && Icon !== null && (
            Icon.$$typeof === Symbol.for('react.forward_ref') || 
            Icon.$$typeof === Symbol.for('react.memo') ||
            Icon.render || 
            Icon.displayName
          ));
        if (isComponent) {
          const IconComp = Icon;
          return <IconComp className="w-5 h-5 text-white" strokeWidth={2.5} />;
        }
        return null;
      })()}
    </button>
  );
}
