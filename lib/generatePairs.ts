import { Book } from "@/types/book";

export function pairKey(aId: string, bId: string) {
  return aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`;
}

export function pickPair(
  books: Book[],
  seenPairs: Set<string>,
): [Book, Book] | null {
  const uniqueBooks = Array.from(
    new Map(books.map((book) => [book.id, book])).values(),
  );

  if (uniqueBooks.length < 2) {
    return null;
  }

  /*
   * First prioritize books with fewer comparisons.
   * This prevents one book from appearing over and over.
   *
   * If comparisons are equal, prioritize higher RD.
   */
  const sortedBooks = [...uniqueBooks].sort((a, b) => {
    if (a.comparisons !== b.comparisons) {
      return a.comparisons - b.comparisons;
    }

    if (b.rd !== a.rd) {
      return b.rd - a.rd;
    }

    return a.id.localeCompare(b.id);
  });

  for (const a of sortedBooks) {
    let bestOpponent: Book | null = null;

    for (const b of uniqueBooks) {
      if (a.id === b.id) {
        continue;
      }

      const key = pairKey(a.id, b.id);

      if (seenPairs.has(key)) {
        continue;
      }

      if (!bestOpponent) {
        bestOpponent = b;
        continue;
      }

      /*
       * Prefer opponents with fewer comparisons.
       */
      if (b.comparisons !== bestOpponent.comparisons) {
        if (b.comparisons < bestOpponent.comparisons) {
          bestOpponent = b;
        }

        continue;
      }

      /*
       * Prefer opponents with similar ratings.
       */
      const bDistance = Math.abs(b.rating - a.rating);

      const currentDistance = Math.abs(bestOpponent.rating - a.rating);

      if (bDistance !== currentDistance) {
        if (bDistance < currentDistance) {
          bestOpponent = b;
        }

        continue;
      }

      /*
       * Prefer the more uncertain opponent.
       */
      if (b.rd !== bestOpponent.rd) {
        if (b.rd > bestOpponent.rd) {
          bestOpponent = b;
        }

        continue;
      }

      if (b.id.localeCompare(bestOpponent.id) < 0) {
        bestOpponent = b;
      }
    }

    if (bestOpponent) {
      return [a, bestOpponent];
    }
  }

  return null;
}
