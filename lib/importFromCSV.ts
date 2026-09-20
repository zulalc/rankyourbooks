import { Book } from "../types/book";

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  author_key?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_key?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  publisher?: string[];
};

type OpenLibraryResponse = {
  docs?: OpenLibraryDoc[];
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(title: string): string {
  return (
    normalizeText(title)
      // Remove content in brackets/parentheses.
      .replace(/\([^)]*\)/g, " ")
      .replace(/\[[^\]]*\]/g, " ")

      // Remove common edition labels.
      .replace(
        /\b(anniversary|collector'?s?|special|deluxe|illustrated|revised|expanded|international|movie tie[- ]in|tv tie[- ]in|mass market|paperback|hardcover|kindle|ebook|audio(book)?|edition)\b/gi,
        " ",
      )

      // Normalize subtitle separators.
      .replace(/\s*[:—–-]\s*/g, " ")

      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeAuthor(author: string): string {
  return normalizeText(author);
}

function tokenize(value: string): string[] {
  return normalizeText(value).split(" ").filter(Boolean);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function getTitleSimilarity(
  csvTitle: string,
  openLibraryTitle: string,
): number {
  const csv = normalizeTitle(csvTitle);
  const ol = normalizeTitle(openLibraryTitle);

  if (!csv || !ol) return 0;

  // Perfect match.
  if (csv === ol) {
    return 1;
  }

  const csvTokens = unique(tokenize(csv));
  const olTokens = unique(tokenize(ol));

  if (csvTokens.length === 0 || olTokens.length === 0) {
    return 0;
  }

  const csvSet = new Set(csvTokens);
  const olSet = new Set(olTokens);

  const intersection = csvTokens.filter((token) => olSet.has(token)).length;

  const csvCoverage = intersection / csvSet.size;
  const olCoverage = intersection / olSet.size;

  // Handles:
  // "The Hobbit"
  // "The Hobbit An Unexpected Journey"
  const containment = csv.includes(ol) || ol.includes(csv);

  if (containment && csvCoverage >= 0.8) {
    return 0.92;
  }

  // Jaccard similarity.
  const union = new Set([...csvSet, ...olSet]).size;
  const jaccard = intersection / union;

  return Math.max(jaccard, csvCoverage * 0.9, olCoverage * 0.8);
}

function getAuthorSimilarity(
  csvAuthor: string,
  openLibraryAuthors: string[] = [],
): number {
  const csv = normalizeAuthor(csvAuthor);

  if (!csv || openLibraryAuthors.length === 0) {
    return 0;
  }

  const csvTokens = unique(tokenize(csv));

  let bestScore = 0;

  for (const author of openLibraryAuthors) {
    const ol = normalizeAuthor(author);

    if (!ol) continue;

    // Exact normalized author.
    if (csv === ol) {
      bestScore = Math.max(bestScore, 1);
      continue;
    }

    const olTokens = unique(tokenize(ol));

    const csvSet = new Set(csvTokens);
    const olSet = new Set(olTokens);

    const intersection = csvTokens.filter((token) => olSet.has(token)).length;

    if (intersection === 0) continue;

    const csvCoverage = intersection / csvSet.size;
    const olCoverage = intersection / olSet.size;

    // Especially useful for:
    // "J.K. Rowling"
    // "Rowling, J.K."
    // "J K Rowling"
    const firstOrLastNameMatch = csvTokens.some(
      (token) => token.length > 2 && olSet.has(token),
    );

    let score = Math.max(
      csvCoverage,
      olCoverage,
      firstOrLastNameMatch ? 0.7 : 0,
    );

    bestScore = Math.max(bestScore, score);
  }

  return bestScore;
}

function scoreBook(
  csvTitle: string,
  csvAuthor: string,
  doc: OpenLibraryDoc,
): number {
  if (!doc.title) return 0;

  const titleScore = getTitleSimilarity(csvTitle, doc.title);

  const authorScore = getAuthorSimilarity(csvAuthor, doc.author_name);

  let score = 0;

  // Title is the most important signal.
  score += titleScore * 70;

  // Author is the second strongest signal.
  score += authorScore * 25;

  // Small quality bonuses.
  if (doc.cover_i) {
    score += 2;
  }

  if (doc.first_publish_year) {
    score += 1;
  }

  if (doc.number_of_pages_median) {
    score += 1;
  }

  return score;
}

function isReliableMatch(titleScore: number, authorScore: number): boolean {
  /*
   * Strongest case:
   * Exact/near-exact title + matching author.
   */
  if (titleScore >= 0.92 && authorScore >= 0.7) {
    return true;
  }

  /*
   * Very strong exact title match.
   *
   * This allows books where Goodreads/OpenLibrary
   * represent the author slightly differently.
   */
  if (titleScore >= 0.98 && authorScore >= 0.4) {
    return true;
  }

  /*
   * Extremely strong title match with no author.
   *
   * We only allow this when the title itself is
   * essentially identical.
   */
  if (titleScore === 1 && !authorScore) {
    return true;
  }

  return false;
}

function mapToBook(item: OpenLibraryDoc): Book {
  return {
    id: item.key ?? `openlibrary-${crypto.randomUUID()}`,

    title: item.title ?? "Unknown title",

    authors: item.author_name ?? [],

    thumbnail: item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
      : "https://covers.openlibrary.org/b/id/10909258-M.jpg",

    comparisons: 0,
    rating: 1500,
    rd: 350,
  };
}

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

async function searchOpenLibrary(
  params: URLSearchParams,
): Promise<OpenLibraryDoc[]> {
  const url = `https://openlibrary.org/search.json?` + params.toString();

  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as OpenLibraryResponse;

  return data.docs ?? [];
}

function findBestMatch(
  title: string,
  author: string,
  docs: OpenLibraryDoc[],
): OpenLibraryDoc | null {
  const scored = docs
    .map((doc) => {
      const titleScore = getTitleSimilarity(title, doc.title ?? "");

      const authorScore = getAuthorSimilarity(author, doc.author_name);

      return {
        doc,
        titleScore,
        authorScore,
        score: scoreBook(title, author, doc),
      };
    })
    .filter((item) => isReliableMatch(item.titleScore, item.authorScore))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return null;
  }

  const best = scored[0];

  /*
   * Prevent ambiguous matches.

   * Example:
   *
   * CSV:
   *   Dune — Frank Herbert
   *
   * OpenLibrary:
   *   Dune
   *   Dune Messiah
   *   Dune: House Atreides
   *
   * We don't want to blindly pick the first result.
   */
  const second = scored[1];

  if (second && best.score - second.score < 5 && best.titleScore < 1) {
    console.warn("⚠️ Ambiguous OpenLibrary match", {
      title,
      author,
      best: best.doc.title,
      bestScore: best.score,
      second: second.doc.title,
      secondScore: second.score,
    });

    return null;
  }

  return best.doc;
}

export async function fetchBookFromCSV(
  title: string,
  author?: string,
): Promise<Book> {
  const cleanTitle = normalizeTitle(title);
  const cleanAuthor = normalizeAuthor(author ?? "");

  if (!cleanTitle) {
    return mapCSVFallback(title, author);
  }

  /*
   * ------------------------------------------------
   * 1. Search using BOTH title and author
   * ------------------------------------------------
   */
  const titleAuthorDocs = await searchOpenLibrary(
    new URLSearchParams({
      title: cleanTitle,
      author: cleanAuthor,
      limit: "20",
    }),
  );

  const titleAuthorMatch = findBestMatch(title, author ?? "", titleAuthorDocs);

  if (titleAuthorMatch) {
    console.log("✅ OpenLibrary match", {
      csv: `${title} — ${author ?? ""}`,
      matched: titleAuthorMatch.title,
      authors: titleAuthorMatch.author_name,
    });

    return mapToBook(titleAuthorMatch);
  }

  /*
   * ------------------------------------------------
   * 2. Broader search
   *
   * This catches cases where OpenLibrary's search
   * engine doesn't interpret the title/author fields
   * correctly.
   * ------------------------------------------------
   */
  const broadDocs = await searchOpenLibrary(
    new URLSearchParams({
      q: `${cleanTitle} ${cleanAuthor}`,
      limit: "30",
    }),
  );

  const broadMatch = findBestMatch(title, author ?? "", broadDocs);

  if (broadMatch) {
    console.log("✅ OpenLibrary broad match", {
      csv: `${title} — ${author ?? ""}`,
      matched: broadMatch.title,
      authors: broadMatch.author_name,
    });

    return mapToBook(broadMatch);
  }

  /*
   * ------------------------------------------------
   * 3. Title-only fallback
   *
   * IMPORTANT:
   * We still require a very strong title match.
   * We no longer accept "the only result".
   * ------------------------------------------------
   */
  const titleDocs = await searchOpenLibrary(
    new URLSearchParams({
      title: cleanTitle,
      limit: "30",
    }),
  );

  const titleMatch = findBestMatch(title, author ?? "", titleDocs);

  if (titleMatch) {
    console.warn("⚠️ Title-based OpenLibrary match", {
      csv: `${title} — ${author ?? ""}`,
      matched: titleMatch.title,
      authors: titleMatch.author_name,
    });

    return mapToBook(titleMatch);
  }

  console.warn("📘 No reliable OpenLibrary match — using CSV data", {
    csv: `${title} — ${author ?? ""}`,
  });

  return mapCSVFallback(title, author);
}
