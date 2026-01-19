"use client";

import { StartFreshButton } from "@/components/StartFreshButton";
import { TopFiveTheme, TopFiveThemes } from "@/lib/topFiveThemes";
import { useBookStore } from "@/store/useBookStore";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { FileText, Image, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ResultsPage() {
  const books = useBookStore((s) => s.books);
  const router = useRouter();
  const ranked = [...books].sort((a, b) => b.rating - a.rating);
  const topFive = ranked.slice(0, 5);
  const yearFilter = useBookStore((s) => s.yearFilter);

  const imageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const bg =
    getComputedStyle(document.body).getPropertyValue("--background") ||
    (document.documentElement.classList.contains("dark")
      ? "#0f1115"
      : "#ffffff");

  const [theme, setTheme] = useState<TopFiveTheme>("matcha");
  const t = TopFiveThemes[theme];

  useEffect(() => {
    if (books.length === 0) {
      router.push("/");
    }
  }, [books, router]);

  async function downloadImage() {
    if (!imageRef.current) return;

    try {
      setExporting(true);

      const canvas = await html2canvas(imageRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg.trim(),
      });

      const label = yearFilter === 2025 ? "2025" : "all-time";

      const link = document.createElement("a");
      link.download = `top-5-books-${label}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }

  async function downloadPDF() {
    try {
      setExporting(true);

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      pdf.setFont("helvetica");

      const titleText =
        yearFilter === 2025 ? "Book Ranking – 2025" : "All Time Book Ranking";

      const footerText =
        yearFilter === 2025
          ? "Generated for 2025 – Rank Your Books"
          : "Generated as All Time – Rank Your Books";

      pdf.setFillColor(17, 24, 39);
      pdf.rect(0, 0, 210, 18, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(13);
      pdf.text(titleText, 20, 12);

      pdf.setFontSize(9);
      pdf.text(new Date().toLocaleDateString(), 170, 12);

      pdf.setTextColor(0, 0, 0);

      let y = 30;

      ranked.forEach((book, index) => {
        if (y > 265) {
          pdf.addPage();

          pdf.setFillColor(17, 24, 39);
          pdf.rect(0, 0, 210, 18, "F");

          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(13);
          pdf.text(titleText, 20, 12);

          pdf.setTextColor(0, 0, 0);
          y = 30;
        }

        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(16, y - 6, 178, 12, 2, 2, "F");

        pdf.setFillColor(229, 231, 235);
        pdf.circle(26, y, 3.6, "F");

        pdf.setFontSize(10);
        pdf.text(String(index + 1), 25, y + 1);

        pdf.setFontSize(11);
        const title = pdf.splitTextToSize(book.title, 150);
        pdf.text(title, 34, y + 1);

        y += title.length * 8 + 2;
      });

      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(footerText, 20, 285);

      const fileLabel = yearFilter === 2025 ? "2025" : "all-time";
      pdf.save(`book-ranking-${fileLabel}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center">
        📊 Your 2025 Book Ranking
      </h1>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={downloadImage}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium"
        >
          <Image className="w-4 h-4" />
          Share as Image
        </button>

        <button
          onClick={downloadPDF}
          className="
      flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium
    "
        >
          <FileText className="w-4 h-4" />
          Download PDF
        </button>

        <StartFreshButton />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.keys(TopFiveThemes).map((key) => (
          <button
            key={key}
            onClick={() => setTheme(key as TopFiveTheme)}
            className={`
        px-3 py-1.5 rounded-lg text-sm capitalize transition
        ${
          theme === key
            ? "bg-black dark:bg-white text-white dark:text-black font-semibold scale-105"
            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        }
      `}
          >
            {key}
          </button>
        ))}
      </div>

      <div
        ref={imageRef}
        className={`
    p-10 pb-14 rounded-3xl relative overflow-hidden
    bg-linear-to-b ${t.bg}
    text-white shadow-2xl
  `}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" />

        <div className="flex justify-between items-start mb-10 relative">
          <div>
            <p
              className={`text-sm opacity-90 mb-1 flex items-center gap-1.5 tracking-wider ${t.accent}`}
            >
              <Star className="w-4 h-4" />
              RANK YOUR BOOKS
            </p>

            <h2 className="text-5xl font-black tracking-tight">
              {yearFilter === "all" ? "ALL TIME" : yearFilter}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-7xl font-extrabold leading-none text-white drop-shadow-lg">
              {books.length}
            </p>
            <p className="text-sm opacity-90 tracking-[0.2em] text-white">
              BOOKS READ
            </p>
          </div>
        </div>

        {topFive[0] && (
          <div className="mb-9 relative">
            <p
              className={`text-lg sm:text-xl font-extrabold mb-3 flex items-center gap-2 relative ${t.accent}`}
            >
              <Star className="w-6 h-6" />
              Favorite Book of {yearFilter === "all" ? "All Time" : yearFilter}
            </p>

            <div
              className="
        flex gap-6 items-center
        p-5 rounded-2xl relative
        bg-white/10 backdrop-blur
        border border-white/20
        shadow-[0_20px_40px_rgba(0,0,0,0.4)]
      "
            >
              {topFive[0].thumbnail && (
                <img
                  src={topFive[0].thumbnail}
                  className="
              h-44 w-30 object-contain rounded-lg
              shadow-[0_10px_30px_rgba(0,0,0,0.6)]
              relative
            "
                />
              )}

              <div className="min-w-0 relative">
                <h3
                  className="
            text-3xl font-black leading-tight
            mb-2 line-clamp-3 tracking-tight
          "
                >
                  {topFive[0].title}
                </h3>

                <p className={`${t.accent} mb-3 text-base`}>
                  {topFive[0].authors.join(", ")}
                </p>

                <p className="text-xs opacity-70 flex items-center gap-1 tracking-wide">
                  <FileText className="w-3 h-3" />
                  Top pick of {yearFilter === "all" ? "all time" : yearFilter}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 relative">
          {topFive.slice(1).map((book, i) => (
            <div
              key={book.id}
              className="
          p-4 rounded-xl
          bg-white/10 backdrop-blur
          border border-white/20
        "
            >
              <p className={`text-xs mb-1 flex items-center gap-1 ${t.accent}`}>
                <Star className="w-3 h-3" />
                {i + 2}
              </p>

              <p className="font-semibold leading-tight mb-1.5 line-clamp-2">
                {book.title}
              </p>

              <p className="text-xs opacity-70 line-clamp-1">
                {book.authors.join(", ")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-9 text-center text-xs opacity-60 flex items-center justify-center gap-1 relative tracking-wide">
          <FileText className="w-3 h-3" />
          Generated with Rank Your Books
        </div>
      </div>

      <div ref={pdfRef} className="p-4 rounded-2xl">
        {books.length > 0 && (
          <section className="mt-3">
            <h2 className="text-xl font-bold mb-4 text-center">
              Your {yearFilter === "all" ? "All Time" : yearFilter} Book Ranking
            </h2>
            <div className="space-y-2">
              {ranked.map((book, i) => (
                <div
                  key={book.id}
                  className="
              flex items-center gap-4 rounded-lg px-2 py-2
              hover:bg-violet-50 dark:hover:bg-gray-800 transition
            "
                >
                  <span className="w-6 text-sm font-semibold text-violet-500">
                    {i + 1}
                  </span>

                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="h-12 w-8 object-contain rounded-sm shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {book.title}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {book.authors.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <FileText className="w-3 h-3" />
          Generated with Rank Your Books
        </div>
      </div>
    </main>
  );
}
