import { Book } from "@/types/book";

export function pairKey(aId: string, bId: string) {
  return [aId, bId].sort().join("|");
}

export function pickPair(
  books: Book[],
  seenPairs: Set<string>
): [Book, Book] | null {
  const sortedByRD = [...books].sort((a, b) => b.rd - a.rd);

  for (const a of sortedByRD) {
    const candidates = books
      .filter((b) => b.id !== a.id)
      .sort(
        (x, y) => Math.abs(x.rating - a.rating) - Math.abs(y.rating - a.rating)
      );

    for (const b of candidates) {
      const key = pairKey(a.id, b.id);
      if (!seenPairs.has(key)) {
        return [a, b];
      }
    }
  }

  // no valid pairs left
  return null;
}
