import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchBooks } from "@/lib/getBooks";
import { Book } from "@/types/book";

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("searchBooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when query is empty", async () => {
    const result = await searchBooks("");
    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls OpenLibrary API with encoded query", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ docs: [] }),
    });

    await searchBooks("harry potter");

    expect(fetch).toHaveBeenCalledWith(
      "https://openlibrary.org/search.json?q=harry%20potter"
    );
  });

  it("maps API response to Book type correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [
          {
            key: "/works/OL123",
            title: "Test Book",
            author_name: ["Author One", "Author Two"],
            cover_i: 12345,
          },
        ],
      }),
    });

    const result = await searchBooks("test");

    const expected: Book[] = [
      {
        id: "/works/OL123",
        title: "Test Book",
        authors: ["Author One", "Author Two"],
        thumbnail: "https://covers.openlibrary.org/b/id/12345-M.jpg",
        comparisons: 0,
        rating: 1500,
        rd: 350,
      },
    ];

    expect(result).toEqual(expected);
  });

  it("handles missing optional fields safely", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [
          {
            key: "/works/OL456",
            title: "No Cover Book",
          },
        ],
      }),
    });

    const result = await searchBooks("nocover");

    expect(result[0]).toEqual({
      id: "/works/OL456",
      title: "No Cover Book",
      authors: [],
      thumbnail: "",
      comparisons: 0,
      rating: 1500,
      rd: 350,
    });
  });

  it("throws error when fetch response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(searchBooks("error")).rejects.toThrow("Failed to fetch books");
  });
});
