import { fetchBookFromCSV } from "@/lib/importFromCSV";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("fetchBookFromCSV", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns strict title + author match when exactly one exists", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [
          {
            key: "/works/OL1",
            title: "The Hobbit",
            author_name: ["J. R. R. Tolkien"],
            cover_i: 123,
          },
        ],
      }),
    });

    const result = await fetchBookFromCSV("The Hobbit", "Tolkien");

    expect(result).toEqual({
      id: "/works/OL1",
      title: "The Hobbit",
      authors: ["J. R. R. Tolkien"],
      thumbnail: "https://covers.openlibrary.org/b/id/123-M.jpg",
      comparisons: 0,
      rating: 1500,
      rd: 350,
    });
  });

  it("falls back to author-only match when strict match fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [
          {
            key: "/works/OL2",
            title: "Some Other Book",
            author_name: ["Agatha Christie"],
          },
        ],
      }),
    });

    const result = await fetchBookFromCSV("Unknown Title", "Christie");

    expect(result.id).toBe("/works/OL2");
    expect(result.authors).toContain("Agatha Christie");
  });

  it("performs title-only search if author match is ambiguous", async () => {
    mockFetch
      // primary search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: [] }),
      })
      // title-only search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          docs: [
            {
              key: "/works/OL3",
              title: "Dune",
              author_name: ["Frank Herbert"],
            },
          ],
        }),
      });

    const result = await fetchBookFromCSV("Dune", "Herbert");

    expect(result.id).toBe("/works/OL3");
    expect(result.title).toBe("Dune");
  });

  it("returns CSV fallback when no reliable match exists", async () => {
    mockFetch
      // primary search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: [] }),
      })
      // title-only search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: [] }),
      });

    const result = await fetchBookFromCSV("Unknown Book", "Unknown Author");

    expect(result.id.startsWith("csv-")).toBe(true);
    expect(result.title).toBe("Unknown Book");
    expect(result.authors).toEqual(["Unknown Author"]);
  });

  it("uses default thumbnail when cover_i is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [
          {
            key: "/works/OL4",
            title: "No Cover Book",
            author_name: ["Author"],
          },
        ],
      }),
    });

    const result = await fetchBookFromCSV("No Cover Book", "Author");

    expect(result.thumbnail).toBe(
      "https://covers.openlibrary.org/b/id/10909258-M.jpg"
    );
  });

  it("normalizes titles correctly (parentheses, dashes, colons)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [
          {
            key: "/works/OL5",
            title: "The Hobbit (Illustrated Edition) — Deluxe",
            author_name: ["J.R.R. Tolkien"],
          },
        ],
      }),
    });

    const result = await fetchBookFromCSV("The Hobbit: Illustrated", "Tolkien");

    expect(result.id).toBe("/works/OL5");
  });
});
