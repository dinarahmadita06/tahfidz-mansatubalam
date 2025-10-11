export function Table({ children, className = "" }) {
  return <table className={`w-full text-sm ${className}`}>{children}</table>;
}

export function TableHeader({ children }) {
  return <thead className="text-left border-b border-gray-200 dark:border-neutral-800">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }) {
  return <tr className="border-b last:border-0 border-gray-100 dark:border-neutral-900">{children}</tr>;
}

export function TableHead({ children }) {
  return <th className="px-4 py-3">{children}</th>;
}

export function TableCell({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}


