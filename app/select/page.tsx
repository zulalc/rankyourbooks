"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchBooks } from "@/lib/getBooks";
import { useBookStore } from "@/store/useBookStore";
import BookCard from "@/components/BookCard";

export default function SelectPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const {
    books: selectedBooks,
    addBook,
    removeBook,
    isSelected,
  } = useBookStore();

  async function handleSearch() {
    const books = await searchBooks(query);
    setResults(books);
  }

  function toggleBook(book: any) {
    if (isSelected(book.id)) {
      removeBook(book.id);
    } else {
      addBook(book);
    }
  }

  return (
    <main className="pb-24 p-6 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">Select your books</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
          border p-2 w-full rounded
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-700
          placeholder:text-gray-500 dark:placeholder:text-gray-400
          focus:outline-none focus:ring-1 focus:ring-gray-400
        "
          placeholder="Search books..."
        />

        <button
          onClick={handleSearch}
          className="
          px-4 rounded
          bg-black dark:bg-gray-700
          hover:bg-zinc-800 dark:hover:bg-gray-600
          text-white
          transition-colors
        "
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        fixed bottom-0 left-0 w-full border-t
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-800
        p-4 flex justify-between items-center
      "
      >
        <span className="font-medium">Selected: {selectedBooks.length}</span>

        <button
          disabled={selectedBooks.length < 2}
          onClick={() => router.push("/quiz")}
          className={`
          px-6 py-2 rounded text-white transition

          ${
            selectedBooks.length < 2
              ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              : "bg-black dark:bg-gray-700 hover:bg-zinc-900 dark:hover:bg-gray-600"
          }
        `}
        >
          Start Quiz
        </button>
      </div>
    </main>
  );
}
