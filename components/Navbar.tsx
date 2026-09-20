"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { BookOpen } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="
    flex
    items-center
    gap-2
    text-lg
    font-semibold
    tracking-tight
    text-foreground
    transition-opacity
    hover:opacity-70
  "
        >
          <BookOpen className="size-5 shrink-0" />
          <span>RankYourBooks</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="
              hidden
              rounded-full
              px-4
              py-2
              text-sm
              font-medium
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
              sm:block
            "
          >
            Home
          </Link>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
