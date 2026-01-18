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
  const topBook = ranked[0];
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
        {topBook && (
          <section className="mb-10 text-center">
            <p className="text-sm uppercase tracking-widest text-violet-500 mb-3">
              Your favorite book of 2025
            </p>

            <div
              className="
                mx-auto w-[92%] sm:w-full max-w-85 sm:max-w-md rounded-2xl sm:rounded-3xl bg-linear-to-b from-violet-50 to-white dark:from-violet-950 dark:to-gray-900 border border-violet-100 dark:border-violet-900  p-3 sm:p-6 shadow-lg sm:shadow-xl
              "
            >
              {topBook.thumbnail && (
                <img
                  src={topBook.thumbnail}
                  alt={topBook.title}
                  className="mx-auto h-36 sm:h-60 object-contain mb-3 sm:mb-5 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.2)] "
                />
              )}

              <h2 className="text-lg sm:text-2xl font-bold mb-1 leading-tight">
                🥇 {topBook.title}
              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {topBook.authors.join(", ")}
              </p>
            </div>
          </section>
        )}

        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-5 text-center flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500 dark:fill-amber-400" />
            Top 5 Books
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {topFive.map((book, index) => (
              <div
                key={book.id}
                className=" group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-center hover:scale-[1.03] transition hover:bg-violet-50 dark:hover:bg-gray-800"
              >
                <span
                  className="
                    absolute -top-2 -left-2 
                    bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full
                  "
                >
                  #{index + 1}
                </span>

                {book.thumbnail && (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="mx-auto h-36 w-24 object-contain mb-2 rounded shadow-sm  transition"
                  />
                )}

                <p className="text-xs font-medium line-clamp-2">{book.title}</p>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {book.authors[0]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {rest.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-4">📚 Full Ranking</h3>

            <div className="space-y-2">
              {rest.map((book, i) => (
                <div
                  key={book.id}
                  className="
                   flex items-center gap-4 rounded-lg px-2 py-2 hover:bg-violet-50 dark:hover:bg-gray-800 transition
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
