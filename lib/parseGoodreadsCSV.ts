import Papa from "papaparse";
import { ReadingPeriod, Season } from "@/store/useBookStore";

export type GoodreadsEntry = {
  title: string;
  author: string;
  dateRead?: string;
  shelf?: string;
};

function getSeason(month: number): Season {
  if (month === 12 || month === 1 || month === 2) {
    return "winter";
  }

  if (month >= 3 && month <= 5) {
    return "spring";
  }

  if (month >= 6 && month <= 8) {
    return "summer";
  }

  return "autumn";
}

function matchesPeriod(dateRead: string, period: ReadingPeriod): boolean {
  if (period.type === "all") {
    return true;
  }

  const date = new Date(dateRead);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (period.type === "year") {
    return year === period.year;
  }

  if (period.type === "month") {
    return year === period.year && month === period.month;
  }

  if (period.type === "season") {
    return year === period.year && getSeason(month) === period.season;
  }

  return false;
}

export function parseGoodreadsCSV(
  file: File,
  period: ReadingPeriod = { type: "all" },
): Promise<GoodreadsEntry[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        try {
          const data = results.data as any[];

          const books: GoodreadsEntry[] = data
            .map((row) => ({
              title: row["Title"]?.trim(),
              author: row["Author"]?.trim(),
              dateRead: row["Date Read"]?.trim(),
              shelf: row["Bookshelves"]?.trim(),
            }))
            .filter((book) => {
              if (!book.title) {
                return false;
              }

              const hasValidDate =
                book.dateRead &&
                book.dateRead !== "" &&
                book.dateRead !== "not set";

              // If we're filtering by a specific period,
              // we need a real Date Read.
              if (period.type !== "all") {
                if (!hasValidDate) {
                  return false;
                }

                return matchesPeriod(book.dateRead!, period);
              }

              // All-time can include books from the read shelf
              // even if Goodreads doesn't have a Date Read.
              return hasValidDate || book.shelf === "read";
            });

          resolve(books);
        } catch (err) {
          reject(err);
        }
      },

      error: (err) => reject(err),
    });
  });
}
