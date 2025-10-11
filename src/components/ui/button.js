"use client";

export function Button({ className = "", variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
    outline: "border border-gray-200 hover:bg-gray-100 text-foreground dark:border-neutral-800 dark:hover:bg-neutral-800",
    ghost: "hover:bg-gray-100 dark:hover:bg-neutral-800",
  };
  const sizes = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
    lg: "h-10 px-6",
  };
  const classes = [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
  return <button className={classes} {...props} />;
}


