"use client";

import { fetchBookFromCSV } from "@/lib/importFromCSV";
import { parseGoodreadsCSV } from "@/lib/parseGoodreadsCSV";
import { useBookStore } from "@/store/useBookStore";
import Link from "next/link";
import { useState } from "react";
export default function Home() {
  const addBooks = useBookStore((s) => s.addBooks);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const yearFilter = useBookStore((s) => s.yearFilter);
  const setYearFilter = useBookStore((s) => s.setYearFilter);

  async function handleCSVUpload(file: File) {
    setLoading(true);
    setError("");
    setImportedCount(null);
    setProgress(0);

    try {
      const entries = await parseGoodreadsCSV(
        file,
        yearFilter === "all" ? undefined : String(yearFilter),
      );

      const books = [];
      const seen = new Set<string>();
      const total = entries.length;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        const normalizedTitle = entry.title
          .toLowerCase()
          .replace(/\(.*?\)/g, "") // remove (...)
          .replace(/\s*[—–-]\s*.*$/, "") // remove — – -
          .replace(/\s*:\s*.*$/, "") // remove subtitles
          .trim();

        const normalizedAuthor =
          entry.author?.split(",")[0].toLowerCase().trim() ?? "";

        const key = `${normalizedTitle}-${normalizedAuthor}`;

        if (seen.has(key)) {
          setProgress(Math.round(((i + 1) / total) * 100));
          continue;
        }

        const book = await fetchBookFromCSV(entry.title, entry.author);

        if (book) {
          seen.add(key);
          books.push(book);
        }

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      addBooks(books);
      setImportedCount(books.length);
    } catch {
      setError("Could not import Goodreads CSV");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold">📚 Rank Your Books</h1>
      <p className="mt-3 max-w-md text-gray-600">
        Import your Goodreads reads and rank them by preference — learn your top
        5 and rest!
      </p>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setYearFilter(2025)}
          className={`rounded px-4 py-2 text-sm transition ${
            yearFilter === 2025
              ? "bg-black dark:bg-gray-700 text-white"
              : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          2025
        </button>
        <button
          onClick={() => setYearFilter("all")}
          className={`rounded px-4 py-2 text-sm transition ${
            yearFilter === "all"
              ? "bg-black dark:bg-gray-700 text-white"
              : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          All time
        </button>
      </div>

      <label className="mt-10 w-full max-w-sm cursor-pointer rounded-xl border-2 border-dashed p-6 transition border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <input
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleCSVUpload(e.target.files[0]);
            }
          }}
        />

        <p className="font-medium">📤 Upload Goodreads CSV</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Import books you’ve already read
        </p>
      </label>

      {loading && (
        <div className="mt-4 w-full max-w-sm">
          <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Importing… {progress}%
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {importedCount !== null && !loading && (
        <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
          Imported {importedCount} books 🎉
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {importedCount !== null && importedCount > 1 && (
        <Link
          href="/quiz"
          className="mt-6 rounded bg-gray-900 dark:bg-gray-100 px-6 py-3 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 transition"
        >
          Start Ranking →
        </Link>
      )}

      <div className="my-8 text-gray-400 dark:text-gray-600">or</div>

      <Link
        href="/select"
        className="rounded border px-6 py-3 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        Select Books Manually
      </Link>

      <section className="mt-12 max-w-xl text-left text-sm text-gray-600 dark:text-gray-400">
        <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
          How to export from Goodreads
        </h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Go to Goodreads → <strong>My Books</strong>
          </li>
          <li>
            Click <strong>Import and export</strong>
          </li>
          <li>
            Click <strong>Export Library</strong>
          </li>
          <li>Download the CSV and upload it here</li>
        </ol>
      </section>
    </main>
  );
}
