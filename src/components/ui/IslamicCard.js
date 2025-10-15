/**
 * IslamicCard - Modern Islamic-themed card component
 * Reusable card dengan desain modern islami
 */

export function IslamicCard({
  children,
  className = "",
  hover = true,
  pattern = true,
  decorative = false,
  gradient = false
}) {
  return (
    <div className={`
      relative bg-white rounded-3xl p-6 md:p-8
      shadow-md border border-sage-100 overflow-hidden
      ${hover ? 'hover:shadow-xl transition-all duration-300' : ''}
      ${className}
    `}>
      {/* Islamic Pattern Background */}
      {pattern && (
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      )}

      {/* Decorative Elements */}
      {decorative && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-100/20 to-transparent rounded-tr-full"></div>
        </>
      )}

      {/* Gradient Overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-amber-50/50 to-orange-50/50 rounded-3xl"></div>
      )}

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

export function IslamicCardHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-sage-800">{title}</h3>
          {subtitle && <p className="text-sm text-sage-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
