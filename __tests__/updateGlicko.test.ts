import { updateGlicko } from "@/lib/glicko";
import { describe, it, expect } from "vitest";

describe("updateGlicko", () => {
  it("increases rating when player wins", () => {
    const player = { rating: 1500, rd: 350 };
    const opponent = { rating: 1500, rd: 350 };

    const result = updateGlicko(player, opponent, 1);

    expect(result.rating).toBeGreaterThan(player.rating);
  });

  it("decreases rating when player loses", () => {
    const player = { rating: 1500, rd: 350 };
    const opponent = { rating: 1500, rd: 350 };

    const result = updateGlicko(player, opponent, 0);

    expect(result.rating).toBeLessThan(player.rating);
  });

  it("reduces RD after a match", () => {
    const player = { rating: 1500, rd: 350 };
    const opponent = { rating: 1500, rd: 350 };

    const result = updateGlicko(player, opponent, 1);

    expect(result.rd).toBeLessThan(player.rd);
  });

  it("never allows RD to go below 50", () => {
    const player = { rating: 1500, rd: 50 };
    const opponent = { rating: 1500, rd: 50 };

    const result = updateGlicko(player, opponent, 1);

    expect(result.rd).toBeGreaterThanOrEqual(50);
  });

  it("changes rating only slightly when beating much weaker opponent", () => {
    const player = { rating: 1800, rd: 100 };
    const opponent = { rating: 1200, rd: 100 };

    const result = updateGlicko(player, opponent, 1);

    expect(result.rating - player.rating).toBeLessThan(10);
  });

  it("changes rating more when beating a stronger opponent", () => {
    const player = { rating: 1200, rd: 200 };
    const opponent = { rating: 1800, rd: 200 };

    const result = updateGlicko(player, opponent, 1);

    expect(result.rating - player.rating).toBeGreaterThan(20);
  });

  it("produces stable output (no NaN or Infinity)", () => {
    const player = { rating: 1500, rd: 350 };
    const opponent = { rating: 1500, rd: 350 };

    const result = updateGlicko(player, opponent, 1);

    expect(Number.isFinite(result.rating)).toBe(true);
    expect(Number.isFinite(result.rd)).toBe(true);
  });
});
