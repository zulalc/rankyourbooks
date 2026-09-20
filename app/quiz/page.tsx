"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useBookStore } from "@/store/useBookStore";
import ComparisonCard from "@/components/ComparisonCard";
import { pairKey, pickPair } from "@/lib/generatePairs";
import { updateGlicko } from "@/lib/glicko";
import { Book } from "@/types/book";
import { StartFreshButton } from "@/components/StartFreshButton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const MIN_COMPARISONS = 30;
const STABLE_COMPARISONS = 10;
const TOP_BOOKS_TO_TRACK = 5;

export default function QuizPage() {
  const router = useRouter();

  const { books, readingPeriod } = useBookStore();

  const [seenPairs, setSeenPairs] = useState<Set<string>>(new Set());

  const [stableCount, setStableCount] = useState(0);

  const previousRanking = useRef<string | null>(null);

  /*
   * Find the next pair.
   */
  const currentPair = useMemo(() => {
    if (books.length < 2) {
      return null;
    }

    return pickPair(books, seenPairs);
  }, [books, seenPairs]);

  /*
   * Create a signature for the current top books.
   *
   * Example:
   *
   * bookA|bookC|bookB|bookD|bookE
   *
   * If the same books remain in the same order,
   * the signature stays the same.
   */
  const rankingSignature = useMemo(() => {
    return [...books]
      .sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }

        return a.id.localeCompare(b.id);
      })
      .slice(0, TOP_BOOKS_TO_TRACK)
      .map((book) => book.id)
      .join("|");
  }, [books]);

  /*
   * Check whether the ranking has remained stable.
   */
  useEffect(() => {
    const comparisonCount = seenPairs.size;

    /*
     * Don't consider stability before the minimum
     * number of comparisons has been reached.
     */
    if (comparisonCount < MIN_COMPARISONS) {
      return;
    }

    /*
     * First ranking we are checking.
     */
    if (previousRanking.current === null) {
      previousRanking.current = rankingSignature;
      setStableCount(1);
      return;
    }

    /*
     * Ranking hasn't changed.
     */
    if (previousRanking.current === rankingSignature) {
      setStableCount((count) => count + 1);
    } else {
      /*
       * Ranking changed, so start the stability
       * counter again.
       */
      previousRanking.current = rankingSignature;
      setStableCount(0);
    }
  }, [books, rankingSignature, seenPairs.size]);

  /*
   * Finish the quiz when the ranking has remained
   * stable for enough comparisons.
   */
  useEffect(() => {
    if (
      seenPairs.size >= MIN_COMPARISONS &&
      stableCount >= STABLE_COMPARISONS
    ) {
      router.push("/results");
    }
  }, [stableCount, seenPairs.size, router]);

  /*
   * Routing fallback.
   */
  useEffect(() => {
    if (books.length === 0) {
      router.push("/");
      return;
    }

    if (books.length < 2) {
      router.push("/select");
      return;
    }

    /*
     * If there are no unused pairs left,
     * finish regardless of stability.
     */
    if (!currentPair) {
      router.push("/results");
    }
  }, [books.length, currentPair, router]);

  if (!currentPair) {
    return null;
  }

  const [a, b] = currentPair;

  /*
   * Handle a user's choice.
   */
  function choose(winner: Book, loser: Book) {
    const updatedWinner = updateGlicko(winner, loser, 1);

    const updatedLoser = updateGlicko(loser, winner, 0);

    /*
     * Update both books in one Zustand update.
     */
    useBookStore.setState((state) => ({
      books: state.books.map((book) => {
        if (book.id === winner.id) {
          return {
            ...book,
            ...updatedWinner,
            comparisons: book.comparisons + 1,
          };
        }

        if (book.id === loser.id) {
          return {
            ...book,
            ...updatedLoser,
            comparisons: book.comparisons + 1,
          };
        }

        return book;
      }),
    }));

    /*
     * Mark this pair as completed.
     */
    setSeenPairs((prev) => {
      const next = new Set(prev);

      next.add(pairKey(a.id, b.id));

      return next;
    });
  }

  /*
   * Period label.
   */
  const periodLabel =
    readingPeriod.type === "all"
      ? "All your books"
      : readingPeriod.type === "year"
        ? `${readingPeriod.year}`
        : readingPeriod.type === "month"
          ? new Date(
              readingPeriod.year,
              readingPeriod.month - 1,
            ).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })
          : readingPeriod.season === "winter"
            ? `Winter ${readingPeriod.year}/${String(
                readingPeriod.year + 1,
              ).slice(-2)}`
            : `${readingPeriod.season.charAt(0).toUpperCase()}${readingPeriod.season.slice(
                1,
              )} ${readingPeriod.year}`;

  /*
   * Display progress based on stability.
   */
  const stabilityProgress =
    seenPairs.size < MIN_COMPARISONS
      ? (seenPairs.size / MIN_COMPARISONS) * 50
      : 50 + Math.min(50, (stableCount / STABLE_COMPARISONS) * 50);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          {periodLabel}
        </Badge>

        <StartFreshButton />
      </div>

      {/* Quiz */}
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:px-8 lg:pt-16">
        {/* Intro */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Step 03 · Make the choice
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Which one do you prefer?
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            There&apos;s no right answer. Just pick the book you&apos;d rather
            have read.
          </p>
        </div>

        {/* Progress */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Comparison {seenPairs.size + 1}</span>

            <span>{seenPairs.size} completed</span>
          </div>

          <Progress value={stabilityProgress} className="h-1.5" />

          <p className="mt-2 text-center text-xs text-muted-foreground">
            {seenPairs.size < MIN_COMPARISONS
              ? `Getting started · ${MIN_COMPARISONS - seenPairs.size} more to go`
              : stableCount >= STABLE_COMPARISONS
                ? "Your ranking has stabilized"
                : `Fine-tuning your ranking · ${stableCount}/${STABLE_COMPARISONS}`}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <ComparisonCard book={a} onChoose={() => choose(a, b)} />

          <ComparisonCard book={b} onChoose={() => choose(b, a)} />
        </div>

        {/* Hint */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Trust your first instinct.
        </p>
      </div>
    </main>
  );
}
