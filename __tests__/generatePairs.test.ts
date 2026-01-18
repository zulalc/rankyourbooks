import { describe, it, expect } from "vitest";
import { pickPair, pairKey } from "@/lib/generatePairs";
import { Book } from "@/types/book";

function makeBook(id: string, rating = 1500, rd = 350, comparisons = 0): Book {
  return {
    id,
    title: id,
    authors: [],
    thumbnail: "",
    rating,
    rd,
    comparisons,
  };
}

describe("pickPair()", () => {
  it("returns a valid pair", () => {
    const books = [makeBook("A"), makeBook("B"), makeBook("C")];

    const seen = new Set<string>();
    const pair = pickPair(books, seen);

    expect(pair).not.toBeNull();
    expect(pair![0].id).not.toBe(pair![1].id);
  });

  it("never returns the same pair twice (A/B === B/A)", () => {
    const books = [makeBook("A"), makeBook("B"), makeBook("C")];

    const seen = new Set<string>();

    const pair1 = pickPair(books, seen)!;
    seen.add(pairKey(pair1[0].id, pair1[1].id));

    const pair2 = pickPair(books, seen)!;
    expect(pairKey(pair1[0].id, pair1[1].id)).not.toBe(
      pairKey(pair2[0].id, pair2[1].id)
    );
  });

  it("prioritizes highest RD book", () => {
    const books = [
      makeBook("low", 1500, 50),
      makeBook("high", 1500, 300),
      makeBook("mid", 1500, 150),
    ];

    const seen = new Set<string>();
    const pair = pickPair(books, seen)!;

    expect(pair[0].id).toBe("high");
  });

  it("chooses closest rating opponent", () => {
    const books = [
      makeBook("A", 1500, 300),
      makeBook("B", 1490, 300),
      makeBook("C", 1200, 300),
    ];

    const seen = new Set<string>();
    const [a, b] = pickPair(books, seen)!;

    expect(a.id).toBe("A");
    expect(b.id).toBe("B"); // closer than C
  });

  it("returns null when all pairs are exhausted", () => {
    const books = [makeBook("A"), makeBook("B")];

    const seen = new Set<string>();
    seen.add(pairKey("A", "B"));

    const pair = pickPair(books, seen);
    expect(pair).toBeNull();
  });
});
