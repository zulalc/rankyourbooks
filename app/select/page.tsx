"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchBooks } from "@/lib/getBooks";
import { useBookStore } from "@/store/useBookStore";
import BookCard from "@/components/BookCard";
import type { Book } from "@/types/book";
import { StartFreshButton } from "@/components/StartFreshButton";
import { X } from "lucide-react";

export default function SelectPage() {
  const router = useRouter();

  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Book[]>([]);

  const {
    books: selectedBooks,
    addBook,
    removeBook,
    isSelected,
  } = useBookStore();

  async function handleSearch() {
    if (!query.trim()) return;

    const books = await searchBooks(query);
    setResults(books);
  }

  function toggleBook(book: Book) {
    if (isSelected(book.id)) {
      removeBook(book.id);
    } else {
      addBook(book);
    }
  }

  return (
    <main className="min-h-screen bg-background p-6 pb-24 text-foreground">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Select your books</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the books you want to rank.
          </p>
        </div>
        {selectedBooks.length > 0 && <StartFreshButton />}
      </div>

      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            className="
        w-full rounded border p-2 pr-10
        border-gray-300
        bg-white
        placeholder:text-gray-500
        focus:outline-none
        focus:ring-1
        focus:ring-gray-400
        dark:border-gray-700
        dark:bg-gray-800
        dark:placeholder:text-gray-400
      "
            placeholder="Search books..."
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              aria-label="Clear search"
              className="
          absolute right-2 top-1/2
          -translate-y-1/2
          rounded-full p-1
          text-gray-400
          transition
          hover:bg-gray-100
          hover:text-gray-700
          dark:hover:bg-gray-700
          dark:hover:text-gray-200
          cursor-pointer
        "
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="
      rounded px-4
      bg-black
      text-white
      transition-colors
      hover:bg-zinc-800
      dark:bg-gray-700
      dark:hover:bg-gray-600
      cursor-pointer
    "
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {results.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            selected={isSelected(book.id)}
            onClick={() => toggleBook(book)}
          />
        ))}
      </div>

      <div
        className="
          fixed bottom-0 left-0 flex w-full
          items-center justify-between
          border-t
          border-gray-200
          bg-white
          p-4
          dark:border-gray-800
          dark:bg-gray-900
        "
      >
        <span className="font-medium">Selected: {selectedBooks.length}</span>

        <button
          type="button"
          disabled={selectedBooks.length < 2}
          onClick={() => router.push("/quiz")}
          className={`
            rounded px-6 py-2 text-white transition

            ${
              selectedBooks.length < 2
                ? "cursor-not-allowed bg-gray-300 dark:bg-gray-700"
                : "bg-black hover:bg-zinc-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            }
          `}
        >
          Start Quiz
        </button>
      </div>
    </main>
  );
}
