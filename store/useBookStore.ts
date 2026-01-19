import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "../types/book";
type YearFilter = "all" | number;

type BookState = {
  books: Book[];
  yearFilter: YearFilter;
  setYearFilter: (y: YearFilter) => void;
  addBook: (book: Book) => void;
  addBooks: (books: Book[]) => void;
  removeBook: (id: string) => void;
  isSelected: (id: string) => boolean;
  updateBook: (book: Book) => void;
  reset: () => void;
};

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      books: [],

      yearFilter: 2025,
      setYearFilter: (y) => set({ yearFilter: y }),

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

      reset: () => set({ books: [], yearFilter: 2025 }),
    }),

    {
      name: "rank-your-books-storage",
    },
  ),
);
