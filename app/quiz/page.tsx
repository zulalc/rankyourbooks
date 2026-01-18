"use client";

import { useRouter } from "next/navigation";
import { useBookStore } from "@/store/useBookStore";
import ComparisonCard from "@/components/ComparisonCard";
import { pairKey, pickPair } from "@/lib/generatePairs";
import { updateGlicko } from "@/lib/glicko";
import { useEffect, useState } from "react";
import { Book } from "@/types/book";
import { StartFreshButton } from "@/components/StartFreshButton";

export default function QuizPage() {
  const router = useRouter();
  const { books, updateBook } = useBookStore();

  const [seenPairs, setSeenPairs] = useState<Set<string>>(new Set());
  const [currentPair, setCurrentPair] = useState<[Book, Book] | null>(null);

  useEffect(() => {
    if (books.length === 0) {
      router.push("/");
    }
    if (books.length < 2) return;

    const next = pickPair(books, seenPairs);
    if (!next) {
      router.push("/results");
      return;
    }

    setCurrentPair(next);
  }, [books, seenPairs, router]);

  if (!currentPair) return null;

  const [a, b] = currentPair;

  function choose(winner: Book, loser: Book) {
    const updatedWinner = updateGlicko(winner, loser, 1);
    const updatedLoser = updateGlicko(loser, winner, 0);

    updateBook({
      ...winner,
      ...updatedWinner,
      comparisons: winner.comparisons + 1,
    });

    updateBook({
      ...loser,
      ...updatedLoser,
      comparisons: loser.comparisons + 1,
    });

    // mark this pair as used (A|B === B|A)
    setSeenPairs((prev) => {
      const next = new Set(prev);
      next.add(pairKey(a.id, b.id));
      return next;
    });

    // adaptive stopping condition
    const done = books.every((b) => b.comparisons >= 12);
    if (done) router.push("/results");
  }

  return (
    <main className="p-6 bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Comparison {seenPairs.size + 1}
        </div>

        <StartFreshButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComparisonCard book={a} onChoose={() => choose(a, b)} />
        <ComparisonCard book={b} onChoose={() => choose(b, a)} />
      </div>
    </main>
  );
}
