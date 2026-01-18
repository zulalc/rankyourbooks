import { Book } from "../types/book";

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\s*[—–-]\s*.*$/, "")
    .replace(/\s*:\s*.*$/, "")
    .replace(/[^a-z0-9çğıöşü\s]/gi, "")
    .trim();
}

function normalizeAuthor(author: string) {
  return author
    .toLowerCase()
    .replace(/[^a-zçğıöşü\s]/gi, "")
    .trim();
}

function mapToBook(item: any): Book {
  return {
    id: item.key,
    title: item.title,
    authors: item.author_name ?? [],
    thumbnail: item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
      : "https://covers.openlibrary.org/b/id/10909258-M.jpg",
    comparisons: 0,
    rating: 1500,
    rd: 350,
  };
}

/* ✅ CSV fallback */
function mapCSVFallback(title: string, author?: string): Book {
  return {
    id: `csv-${crypto.randomUUID()}`,
    title: title.trim(),
    authors: author ? [author.trim()] : [],
    thumbnail: "https://covers.openlibrary.org/b/id/10909258-M.jpg",
    comparisons: 0,
    rating: 1500,
    rd: 350,
  };
}

export async function fetchBookFromCSV(
  title: string,
  author?: string
): Promise<Book> {
  const cleanTitle = normalizeTitle(title);
  const csvAuthor = normalizeAuthor(author ?? "");

  /* ---------- primary search ---------- */
  let res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(
      `${cleanTitle} ${author ?? ""}`
    )}`
  );

  if (res.ok) {
    let data = await res.json();
    let docs = data.docs ?? [];

    /* ---------- strict match ---------- */
    const strictMatches = docs.filter((doc: any) => {
      if (!doc.title || !doc.author_name) return false;

      const titleMatch = normalizeTitle(doc.title).includes(cleanTitle);
      const authorMatch = doc.author_name.some((a: string) =>
        normalizeAuthor(a).includes(csvAuthor)
      );

      return titleMatch && authorMatch;
    });

    if (strictMatches.length === 1) {
      return mapToBook(strictMatches[0]);
    }

    /* ---------- author-only match ---------- */
    const authorOnlyMatches = docs.filter((doc: any) =>
      doc.author_name?.some((a: string) =>
        normalizeAuthor(a).includes(csvAuthor)
      )
    );

    if (authorOnlyMatches.length === 1) {
      console.warn("🌍 Author-only match", {
        csv: `${title} — ${author}`,
        matched: authorOnlyMatches[0].title,
      });

      return mapToBook(authorOnlyMatches[0]);
    }

    /* ---------- title-only search ---------- */
    res = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(
        cleanTitle
      )}`
    );

    if (res.ok) {
      data = await res.json();
      docs = data.docs ?? [];

      if (docs.length === 1) {
        console.warn("⚠️ Title-only match", {
          csv: `${title} — ${author}`,
          matched: docs[0].title,
        });

        return mapToBook(docs[0]);
      }
    }
  }

  /* ---------- CSV fallback (final) ---------- */
  console.warn("📘 No reliable OpenLibrary match — using CSV data", {
    csv: `${title} — ${author}`,
  });

  return mapCSVFallback(title, author);
}
