"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const nextIsDark = !html.classList.contains("dark");

    html.classList.toggle("dark", nextIsDark);

    localStorage.setItem("theme", nextIsDark ? "dark" : "light");

    setIsDark(nextIsDark);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="
          flex
          size-9
          items-center
          justify-center
          rounded-full
          border
          border-border/70
          bg-background
          sm:size-10
        "
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        group
        flex
        size-9
        items-center
        justify-center
        rounded-full
        border
        border-border/70
        bg-background
        text-foreground
        shadow-sm
        transition-all
        duration-200
        hover:bg-muted
        hover:shadow
        active:scale-95
        sm:size-10
      "
    >
      {isDark ? (
        <Sun
          className="
            size-4
            transition-transform
            duration-300
            group-hover:rotate-45
            sm:size-4.25
          "
        />
      ) : (
        <Moon
          className="
            size-4
            transition-transform
            duration-300
            group-hover:-rotate-12
            sm:size-4.25
          "
        />
      )}
    </button>
  );
}
