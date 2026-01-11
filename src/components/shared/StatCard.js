export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor = 'from-emerald-100 to-emerald-200',
  iconColor = 'text-emerald-700',
  textColor = 'text-emerald-900',
  iconBg = 'bg-emerald-400'
}) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 ${iconBg} bg-opacity-30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
          {(() => {
            if (!Icon) return null;
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
              return <IconComp size={28} className={iconColor} />;
            }
            
            return null;
          })()}
        </div>
        <div className="flex-1">
          <p className={`${iconColor} text-sm font-medium mb-1`}>{title}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          {subtitle && (
            <p className={`${iconColor} text-xs mt-1 opacity-75`}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
