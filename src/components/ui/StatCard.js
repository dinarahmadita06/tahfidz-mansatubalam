"use client";

export default function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      icon: "text-blue-500"
    },
    green: {
      bg: "bg-green-50", 
      text: "text-green-600",
      icon: "text-green-500"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600", 
      icon: "text-purple-500"
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      icon: "text-orange-500"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colors.text} mt-1`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}