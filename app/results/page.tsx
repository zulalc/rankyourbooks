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
    if (!pdfRef.current) return;

    try {
      setExporting(true);

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);

        heightLeft -= pageHeight;
      }

      pdf.save(
        `book-ranking-${yearFilter === "all" ? "all-time" : yearFilter}.pdf`,
      );
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
            p-5 sm:p-10 pb-8 sm:pb-14
            rounded-2xl sm:rounded-3xl
            relative overflow-hidden
            bg-linear-to-b ${t.bg}
            text-white shadow-2xl
          `}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" />

        <div
          className="
            flex flex-col sm:flex-row
            sm:justify-between sm:items-start
            gap-4 sm:gap-0
            mb-6 sm:mb-10
            relative
          "
        >
          <div>
            <p
              className={`text-sm opacity-90 mb-1 flex items-center gap-1.5 tracking-wider ${t.accent}`}
            >
              <Star className="w-4 h-4" />
              RANK YOUR BOOKS
            </p>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              {yearFilter === "all" ? "ALL TIME" : yearFilter}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-4xl sm:text-7xl font-extrabold leading-none text-white drop-shadow-lg">
              {books.length}
            </p>
            <p className="text-sm opacity-90 tracking-[0.2em] text-white">
              BOOKS READ
            </p>
          </div>
        </div>

        {topFive[0] && (
          <div className="mb-5 sm:mb-8 relative">
            <p
              className={`text-lg sm:text-xl font-extrabold mb-3 flex items-center gap-2 relative ${t.accent}`}
            >
              <Star className="w-6 h-6" />
              Favorite Book of {yearFilter === "all" ? "All Time" : yearFilter}
            </p>

            <div
              className="
              flex flex-col sm:flex-row
              gap-4 sm:gap-8
              items-center sm:items-start
              p-4 sm:p-7
              rounded-xl sm:rounded-2xl
              relative
            bg-white/10 backdrop-blur
            border border-white/20
            shadow-[0_20px_40px_rgba(0,0,0,0.4)]
      "
            >
              {topFive[0].thumbnail && (
                <img
                  src={topFive[0].thumbnail}
                  className="
                  h-44 w-30
                  object-contain rounded-lg
                  shadow-[0_10px_30px_rgba(0,0,0,0.6)]
            "
                />
              )}

              <div className="min-w-0 relative">
                <h3
                  className="
            text-2xl sm:text-3xl font-black leading-tight
            mb-2 line-clamp-3 tracking-tight
          "
                >
                  {topFive[0].title}
                </h3>

                <p className={`${t.accent} mb-3 text-base`}>
                  {topFive[0].authors.join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:gap-3 relative">
          {topFive.slice(1).map((book, i) => (
            <div
              key={book.id}
              className="
              p-2.5 sm:p-3
              rounded-lg sm:rounded-xl
              bg-white/10 backdrop-blur
              border border-white/20
      "
            >
              <p
                className={`text-[11px] mb-1 flex items-center gap-1 ${t.accent}`}
              >
                <Star className="w-3 h-3" />
                {i + 2}
              </p>

              <div className="flex gap-2.5 items-center">
                {book.thumbnail && (
                  <img
                    src={book.thumbnail}
                    className="
              h-16 sm:h-20
              w-12 sm:w-14
              object-contain rounded-md
              shadow-[0_6px_16px_rgba(0,0,0,0.4)]
              shrink-0
            "
                  />
                )}

                <div className="min-w-0">
                  <p
                    className="
                  font-semibold
                  text-[13px] sm:text-sm
                  leading-snug
                  mb-0.5
                  line-clamp-2
          "
                  >
                    {book.title}
                  </p>

                  <p className="text-[11px] opacity-70 line-clamp-1">
                    {book.authors.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="
          mt-6 sm:mt-9
          text-[10px] sm:text-xs
          opacity-60
          flex items-center justify-center gap-1
          text-center
          leading-tight
          px-2
"
        >
          <FileText className="w-3 h-3" />
          Generated with Rank Your Books
        </div>
      </div>

      <div ref={pdfRef} className="p-4 rounded-2xl ">
        {books.length > 0 && (
          <section className="mt-2">
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
