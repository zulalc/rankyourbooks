import Papa from "papaparse";

export type GoodreadsEntry = {
  title: string;
  author: string;
  dateRead?: string;
  shelf?: string;
};

export function parseGoodreadsCSV(
  file: File,
  year?: string
): Promise<GoodreadsEntry[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];

          console.log("📄 Raw CSV rows:", data.slice(0, 5));

          const books: GoodreadsEntry[] = data
            .map((row) => ({
              title: row["Title"]?.trim(),
              author: row["Author"]?.trim(),
              dateRead: row["Date Read"]?.trim(),
              shelf: row["Bookshelves"]?.trim(),
            }))
            .filter((b) => {
              if (!b.title) return false;

              const hasValidDate =
                b.dateRead && b.dateRead !== "" && b.dateRead !== "not set";

              if (year) {
                if (!hasValidDate) return false;
                return b.dateRead!.startsWith(year);
              }

              return hasValidDate || b.shelf === "read";
            });

          console.log("✅ Filtered READ books:", books);

          resolve(books);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}
