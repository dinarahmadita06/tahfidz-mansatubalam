export function Card({ className = "", children }) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-black ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`p-4 border-b border-gray-200 dark:border-neutral-800 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <div className={`text-base font-semibold ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}


