"use client";

import { StartFreshButton } from "@/components/StartFreshButton";
import { TopFiveTheme, TopFiveThemes } from "@/lib/topFiveThemes";
import { useBookStore } from "@/store/useBookStore";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { FileText, Image, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getPeriodLabel(
  period: ReturnType<typeof useBookStore.getState>["readingPeriod"],
) {
  switch (period.type) {
    case "all":
      return "All Time";

    case "year":
      return `${period.year}`;

    case "month":
      return `${MONTHS[period.month - 1]} ${period.year}`;

    case "season":
      if (period.season === "winter") {
        return `Winter ${period.year}/${String(period.year + 1).slice(-2)}`;
      }

      return `${
        period.season.charAt(0).toUpperCase() + period.season.slice(1)
      } ${period.year}`;
  }
}

function getFileLabel(
  period: ReturnType<typeof useBookStore.getState>["readingPeriod"],
) {
  switch (period.type) {
    case "all":
      return "all-time";

    case "year":
      return String(period.year);

    case "month":
      return `${period.year}-${String(period.month).padStart(2, "0")}`;

    case "season":
      return period.season === "winter"
        ? `winter-${period.year}-${period.year + 1}`
        : `${period.season}-${period.year}`;
  }
}

export default function ResultsPage() {
  const router = useRouter();

  const books = useBookStore((s) => s.books);
  const readingPeriod = useBookStore((s) => s.readingPeriod);

  const ranked = [...books].sort((a, b) => b.rating - a.rating);
  const topFive = ranked.slice(0, 5);

  const imageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [exporting, setExporting] = useState(false);
  const [theme, setTheme] = useState<TopFiveTheme>("matcha");

  const t = TopFiveThemes[theme];

  const periodLabel = getPeriodLabel(readingPeriod);
  const fileLabel = getFileLabel(readingPeriod);

  useEffect(() => {
    if (books.length === 0) {
      router.push("/");
    }
  }, [books, router]);

  async function downloadImage() {
    if (!imageRef.current) return;

    try {
      setExporting(true);

      const bg =
        getComputedStyle(document.body).getPropertyValue("--background") ||
        (document.documentElement.classList.contains("dark")
          ? "#0f1115"
          : "#ffffff");

      const canvas = await html2canvas(imageRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg.trim(),
      });

      const link = document.createElement("a");
      link.download = `top-5-books-${fileLabel}.png`;
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

      pdf.save(`book-ranking-${fileLabel}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Rank Your Books
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your {periodLabel} Book Ranking
          </h1>

          <p className="mt-3 text-muted-foreground">
            Your books, ranked by your choices.
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={downloadImage}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image className="h-4 w-4" />
            {exporting ? "Exporting..." : "Share as Image"}
          </button>

          <button
            type="button"
            onClick={downloadPDF}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </button>

          <StartFreshButton />
        </div>

        {/* Theme selector */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {Object.keys(TopFiveThemes).map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setTheme(key as TopFiveTheme)}
              className={`
                rounded-lg px-3 py-1.5 text-sm capitalize transition
                ${
                  theme === key
                    ? "bg-foreground text-background font-semibold scale-105"
                    : "bg-muted hover:bg-muted/80"
                }
              `}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Share image */}
        <div
          ref={imageRef}
          className={`
            relative overflow-hidden rounded-2xl sm:rounded-3xl
            bg-linear-to-b ${t.bg}
            p-5 pb-8 text-white shadow-2xl
            sm:p-10 sm:pb-14
          `}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" />

          {/* Header inside export */}
          <div className="relative mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className={`mb-1 flex items-center gap-1.5 text-sm tracking-wider opacity-90 ${t.accent}`}
              >
                <Star className="h-4 w-4" />
                RANK YOUR BOOKS
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                {periodLabel.toUpperCase()}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-4xl font-extrabold leading-none text-white drop-shadow-lg sm:text-7xl">
                {books.length}
              </p>

              <p className="text-sm tracking-[0.2em] text-white opacity-90">
                BOOKS READ
              </p>
            </div>
          </div>

          {/* #1 */}
          {topFive[0] && (
            <div className="relative mb-5 sm:mb-8">
              <p
                className={`relative mb-3 flex items-center gap-2 text-lg font-extrabold sm:text-xl ${t.accent}`}
              >
                <Star className="h-6 w-6" />
                Favorite Book of {periodLabel}
              </p>

              <div className="relative flex flex-col items-center gap-4 rounded-xl border border-white/20 bg-white/10 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur sm:flex-row sm:items-start sm:gap-8 sm:rounded-2xl sm:p-7">
                {topFive[0].thumbnail && (
                  <img
                    src={topFive[0].thumbnail}
                    alt={topFive[0].title}
                    className="h-44 w-30 rounded-lg object-contain shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                  />
                )}

                <div className="min-w-0">
                  <h3 className="mb-2 line-clamp-3 text-center text-2xl font-black leading-tight tracking-tight sm:text-left sm:text-3xl">
                    {topFive[0].title}
                  </h3>

                  <p
                    className={`${t.accent} text-center text-base sm:text-left`}
                  >
                    {topFive[0].authors.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* #2 - #5 */}
          <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            {topFive.slice(1).map((book, i) => (
              <div
                key={book.id}
                className="rounded-lg border border-white/20 bg-white/10 p-2.5 backdrop-blur sm:rounded-xl sm:p-3"
              >
                <p
                  className={`mb-1 flex items-center gap-1 text-[11px] ${t.accent}`}
                >
                  <Star className="h-3 w-3" />
                  {i + 2}
                </p>

                <div className="flex items-center gap-2.5">
                  {book.thumbnail && (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="h-16 w-12 shrink-0 rounded-md object-contain shadow-[0_6px_16px_rgba(0,0,0,0.4)] sm:h-20 sm:w-14"
                    />
                  )}

                  <div className="min-w-0">
                    <p className="mb-0.5 line-clamp-2 text-[13px] font-semibold leading-snug sm:text-sm">
                      {book.title}
                    </p>

                    <p className="line-clamp-1 text-[11px] opacity-70">
                      {book.authors.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-6 flex items-center justify-center gap-1 px-2 text-center text-[10px] leading-tight opacity-60 sm:mt-9 sm:text-xs">
            <FileText className="h-3 w-3" />
            Generated with Rank Your Books
          </div>
        </div>

        {/* Full ranking / PDF */}
        <div ref={pdfRef} className="mt-10 rounded-2xl bg-background p-4">
          <section>
            <h2 className="mb-4 text-center text-xl font-bold">
              Your {periodLabel} Book Ranking
            </h2>

            <div className="space-y-2">
              {ranked.map((book, i) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 rounded-lg px-2 py-2 transition hover:bg-muted"
                >
                  <span className="w-6 text-sm font-semibold text-muted-foreground">
                    {i + 1}
                  </span>

                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="h-12 w-8 shrink-0 rounded-sm object-contain"
                    />
                  ) : (
                    <div className="h-12 w-8 shrink-0 rounded bg-muted" />
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {book.title}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {book.authors.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Generated with Rank Your Books
          </div>
        </div>
      </div>
    </main>
  );
}
