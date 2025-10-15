/**
 * IslamicPageHeader - Modern Islamic page header
 * Header dengan gradient background dan pattern
 */

export function IslamicPageHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  actions,
  gradient = "from-emerald-50 via-amber-50 to-orange-50"
}) {
  return (
    <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} p-8 shadow-lg border border-amber-100 overflow-hidden mb-8`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>

      {/* Islamic Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L61.8 38.2 100 38.2 69.1 61.8 80.9 100 50 76.4 19.1 100 30.9 61.8 0 38.2 38.2 38.2 Z' fill='%23059669' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sage-800 to-emerald-700 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sage-600 font-medium mt-1">
                {subtitle}
                {badge && (
                  <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {badge}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
