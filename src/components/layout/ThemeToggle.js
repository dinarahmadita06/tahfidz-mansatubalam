"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const t = localStorage.getItem("theme");
      const isDark = (t && t === "dark") || (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setChecked(isDark);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const nextTheme = checked ? "dark" : "light";
    const html = document.documentElement;
    html.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {}
  }, [checked, mounted]);

  if (!mounted) return null;

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="text-xs text-gray-500 dark:text-gray-400">Light</span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => setChecked(v => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setChecked(v => !v); }}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-neutral-700'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white dark:bg-neutral-200 shadow transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">Dark</span>
    </label>
  );
}


