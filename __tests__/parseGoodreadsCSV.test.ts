import { describe, it, expect, vi, beforeEach } from "vitest";
import Papa from "papaparse";
import { GoodreadsEntry, parseGoodreadsCSV } from "@/lib/parseGoodreadsCSV";

vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn(),
  },
}));

describe("parseGoodreadsCSV", () => {
  const mockFile = new File(["dummy"], "books.csv");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses and maps valid CSV rows", async () => {
    (Papa.parse as any).mockImplementation((_file: File, config: any) => {
      config.complete({
        data: [
          {
            Title: " Dune ",
            Author: " Frank Herbert ",
            "Date Read": "2023-05-01",
            Bookshelves: "read",
          },
        ],
      });
    });

    const result = await parseGoodreadsCSV(mockFile);

    const expected: GoodreadsEntry[] = [
      {
        title: "Dune",
        author: "Frank Herbert",
        dateRead: "2023-05-01",
        shelf: "read",
      },
    ];

    expect(result).toEqual(expected);
  });

  it("filters out rows without title", async () => {
    (Papa.parse as any).mockImplementation((_file: File, config: any) => {
      config.complete({
        data: [
          {
            Title: "",
            Author: "Someone",
            "Date Read": "2023-01-01",
          },
        ],
      });
    });

    const result = await parseGoodreadsCSV(mockFile);

    expect(result).toEqual([]);
  });

  it("filters by year when year is provided", async () => {
    (Papa.parse as any).mockImplementation((_file: File, config: any) => {
      config.complete({
        data: [
          {
            Title: "Book A",
            Author: "Author A",
            "Date Read": "2023-06-10",
          },
          {
            Title: "Book B",
            Author: "Author B",
            "Date Read": "2022-04-01",
          },
        ],
      });
    });

    const result = await parseGoodreadsCSV(mockFile, "2023");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Book A");
  });

  it("excludes entries with 'not set' date when year is provided", async () => {
    (Papa.parse as any).mockImplementation((_file: File, config: any) => {
      config.complete({
        data: [
          {
            Title: "Book A",
            Author: "Author A",
            "Date Read": "not set",
          },
        ],
      });
    });

    const result = await parseGoodreadsCSV(mockFile, "2023");

    expect(result).toEqual([]);
  });

  it("includes shelf=read when no year is provided", async () => {
    (Papa.parse as any).mockImplementation((_file: File, config: any) => {
      config.complete({
        data: [
          {
            Title: "Shelf Read Book",
            Author: "Author",
            Bookshelves: "read",
          },
        ],
      });
    });

    const result = await parseGoodreadsCSV(mockFile);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Shelf Read Book");
  });

  it("rejects when Papa.parse throws error", async () => {
    (Papa.parse as any).mockImplementation((_file: File, config: any) => {
      config.error(new Error("CSV parse failed"));
    });

    await expect(parseGoodreadsCSV(mockFile)).rejects.toThrow(
      "CSV parse failed"
    );
  });
});
