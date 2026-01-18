"use client";

import { StartFreshButton } from "@/components/StartFreshButton";
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
  const rest = ranked.slice(5);

  const captureRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const bg =
    getComputedStyle(document.body).getPropertyValue("--background") ||
    (document.documentElement.classList.contains("dark")
      ? "#0f1115"
      : "#ffffff");

  useEffect(() => {
    if (books.length === 0) {
      router.push("/");
    }
  }, [books, router]);

  async function downloadImage() {
    if (!captureRef.current) return;

    try {
      setExporting(true);

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg.trim(),
      });

      const link = document.createElement("a");
      link.download = "my-book-ranking-2025.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }

  async function downloadPDF() {
    if (!captureRef.current) return;

    try {
      setExporting(true);

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg.trim(),
      });

      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(img, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("book-ranking-2025.pdf");
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

      <div ref={captureRef} className="p-4 rounded-2xl">
        <section className="mb-12">
          <p className="text-sm uppercase tracking-widest text-violet-500 mb-4 text-center">
            Your Top 5 Books of 2025
          </p>

          <div className="space-y-3 max-w-2xl mx-auto">
            {topFive.map((book, index) => {
              const isHero = index === 0;

              return (
                <div
                  key={book.id}
                  className={`
              flex items-center gap-4 rounded-xl
              border transition-all

              ${
                isHero
                  ? // ===== HERO STYLE =====
                    "p-4 sm:p-6 bg-linear-to-r from-violet-100 to-white dark:from-violet-950 dark:to-gray-900 border-violet-300 dark:border-violet-800 shadow-lg"
                  : // ===== NORMAL ROWS =====
                    "p-3 sm:p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-800"
              }
            `}
                >
                  <div
                    className={`
                rounded-full flex items-center justify-center
                font-bold shrink-0

                ${
                  isHero
                    ? "w-9 h-9 sm:w-10 sm:h-10 bg-violet-600 text-white text-base"
                    : "w-7 h-7 sm:w-8 sm:h-8 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-sm"
                }
              `}
                  >
                    {index + 1}
                  </div>

                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className={`
                  object-contain rounded shadow shrink-0

                  ${
                    isHero
                      ? "h-20 w-14 sm:h-28 sm:w-20"
                      : "h-16 w-12 sm:h-20 sm:w-14"
                  }
                `}
                    />
                  ) : (
                    <div
                      className={`
                  bg-gray-200 dark:bg-gray-800 rounded shrink-0
                  ${
                    isHero
                      ? "h-20 w-14 sm:h-28 sm:w-20"
                      : "h-16 w-12 sm:h-20 sm:w-14"
                  }
                `}
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-semibold line-clamp-5 whitespace-normal overflow-hidden 
      ${isHero ? "text-base sm:text-xl" : "text-sm sm:text-base"}
    `}
                      title={book.title}
                    >
                      {book.title}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {book.authors.join(", ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {rest.length > 0 && (
          <section>
            <div className="space-y-2">
              {rest.map((book, i) => (
                <div
                  key={book.id}
                  className="
              flex items-center gap-4 rounded-lg px-2 py-2
              hover:bg-violet-50 dark:hover:bg-gray-800 transition
            "
                >
                  <span className="w-6 text-sm font-semibold text-violet-500">
                    {i + 6}
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

        {exporting && (
          <div className="text-center text-xs text-gray-400 mt-6">
            Generated with Rank Your Books
          </div>
        )}
      </div>
    </main>
  );
}
