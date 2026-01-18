import { Book } from "../types/book";

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query) return [];

  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch books");
  }

  const data = await res.json();

  return (
    data.docs?.slice(0, 20).map((item: any) => ({
      id: item.key,
      title: item.title,
      authors: item.author_name ?? [],
      thumbnail: item.cover_i
        ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
        : "",
      comparisons: 0,
      rating: 1500,
      rd: 350,
    })) || []
  );
}
