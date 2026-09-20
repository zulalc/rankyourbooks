import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "../types/book";

export type Season = "winter" | "spring" | "summer" | "autumn";

export type ReadingPeriod =
  | {
      type: "all";
    }
  | {
      type: "year";
      year: number;
    }
  | {
      type: "month";
      year: number;
      month: number; // 1-12
    }
  | {
      type: "season";
      year: number;
      season: Season;
    };

type BookState = {
  books: Book[];

  readingPeriod: ReadingPeriod;
  setReadingPeriod: (period: ReadingPeriod) => void;

  addBook: (book: Book) => void;
  addBooks: (books: Book[]) => void;
  removeBook: (id: string) => void;
  isSelected: (id: string) => boolean;
  updateBook: (book: Book) => void;

  reset: () => void;
};

const defaultReadingPeriod: ReadingPeriod = {
  type: "year",
  year: new Date().getFullYear(),
};

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      books: [],

      readingPeriod: defaultReadingPeriod,

      setReadingPeriod: (period) =>
        set({
          readingPeriod: period,
        }),

      addBook: (book) =>
        set((state) => ({
          books: state.books.some((b) => b.id === book.id)
            ? state.books
            : [...state.books, book],
        })),

      addBooks: (newBooks) =>
        set((state) => {
          const existingIds = new Set(state.books.map((b) => b.id));

          const filtered = newBooks.filter((b) => !existingIds.has(b.id));

          return {
            books: [...state.books, ...filtered],
          };
        }),

      removeBook: (id) =>
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
        })),

      isSelected: (id) => {
        return get().books.some((b) => b.id === id);
      },

      updateBook: (updated) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === updated.id ? updated : b)),
        })),

      reset: () =>
        set({
          books: [],
          readingPeriod: defaultReadingPeriod,
        }),
    }),

    {
      name: "rank-your-books-storage",
    },
  ),
);
