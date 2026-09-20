"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ReadingPeriod, Season, useBookStore } from "@/store/useBookStore";
import { parseGoodreadsCSV } from "@/lib/parseGoodreadsCSV";
import { fetchBookFromCSV } from "@/lib/importFromCSV";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SEASONS: {
  value: Season;
  label: string;
  months: string;
}[] = [
  {
    value: "winter",
    label: "Winter",
    months: "Dec – Feb",
  },
  {
    value: "spring",
    label: "Spring",
    months: "Mar – May",
  },
  {
    value: "summer",
    label: "Summer",
    months: "Jun – Aug",
  },
  {
    value: "autumn",
    label: "Autumn",
    months: "Sep – Nov",
  },
];

function getPeriodLabel(period: ReadingPeriod) {
  switch (period.type) {
    case "all":
      return "All your books";

    case "year":
      return `${period.year}`;

    case "month":
      return `${MONTHS[period.month - 1]} ${period.year}`;

    case "season":
      if (period.season === "winter") {
        return `Winter ${period.year}/${String(period.year + 1).slice(-2)}`;
      }

      return `${period.season.charAt(0).toUpperCase()}${period.season.slice(
        1,
      )} ${period.year}`;
  }
}

export default function Home() {
  const router = useRouter();

  const { readingPeriod, setReadingPeriod, addBooks } = useBookStore();

  const currentYear = new Date().getFullYear();

  const [periodType, setPeriodType] = useState<
    "year" | "month" | "season" | "all"
  >(readingPeriod.type);

  const [year, setYear] = useState(
    readingPeriod.type === "all" ? currentYear : readingPeriod.year,
  );

  const [month, setMonth] = useState(
    readingPeriod.type === "month"
      ? readingPeriod.month
      : new Date().getMonth() + 1,
  );

  const [season, setSeason] = useState<Season>(
    readingPeriod.type === "season" ? readingPeriod.season : "summer",
  );

  const [showSourceChoice, setShowSourceChoice] = useState(false);

  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function selectPeriod(
    type: "year" | "month" | "season" | "all",
    values?: {
      year?: number;
      month?: number;
      season?: Season;
    },
  ) {
    const selectedYear = values?.year ?? year;
    const selectedMonth = values?.month ?? month;
    const selectedSeason = values?.season ?? season;

    setPeriodType(type);

    let period: ReadingPeriod;

    if (type === "all") {
      period = {
        type: "all",
      };
    } else if (type === "year") {
      period = {
        type: "year",
        year: selectedYear,
      };
    } else if (type === "month") {
      period = {
        type: "month",
        year: selectedYear,
        month: selectedMonth,
      };
    } else {
      period = {
        type: "season",
        year: selectedYear,
        season: selectedSeason,
      };
    }

    setReadingPeriod(period);
  }

  function changeYear(direction: number) {
    const nextYear = year + direction;

    setYear(nextYear);

    selectPeriod(periodType, {
      year: nextYear,
    });
  }

  function selectMonth(monthNumber: number) {
    setMonth(monthNumber);

    selectPeriod("month", {
      month: monthNumber,
    });
  }

  function selectSeason(seasonValue: Season) {
    setSeason(seasonValue);

    selectPeriod("season", {
      season: seasonValue,
    });
  }

  function continueFromPeriod() {
    setShowSourceChoice(true);
  }

  function goToManualSelection() {
    router.push("/select");
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleGoodreadsUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const entries = await parseGoodreadsCSV(file, readingPeriod);

      if (entries.length === 0) {
        alert(`No books were found for ${getPeriodLabel(readingPeriod)}.`);

        return;
      }

      const books = await Promise.all(
        entries.map((entry) => fetchBookFromCSV(entry.title, entry.author)),
      );

      addBooks(books);

      router.push("/quiz");
    } catch (error) {
      console.error("Goodreads import failed:", error);

      alert("Something went wrong while importing your Goodreads CSV.");
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  const periodLabel = getPeriodLabel(readingPeriod);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="
              absolute
              left-1/2
              -top-55
              h-150
              w-225
              -translate-x-1/2
              rounded-full
              bg-muted/60
              blur-3xl
            "
          />
        </div>

        <div
          className="
            relative
            mx-auto
            grid
            max-w-7xl
            gap-14
            px-4
            pb-20
            pt-16
            sm:px-6
            lg:grid-cols-[1fr_520px]
            lg:gap-20
            lg:px-8
            lg:pb-28
            lg:pt-24
          "
        >
          {/* Hero copy */}
          <div className="flex flex-col justify-center">
            <Badge
              variant="secondary"
              className="
                mb-6
                w-fit
                rounded-full
                px-4
                py-1.5
                text-xs
                font-medium
              "
            >
              Your reading, ranked.
            </Badge>

            <h1
              className="
                max-w-3xl
                text-5xl
                font-semibold
                leading-[0.98]
                tracking-[-0.045em]
                sm:text-6xl
                lg:text-7xl
              "
            >
              Which books
              <br />
              <span className="text-muted-foreground">really mattered?</span>
            </h1>

            <p
              className="
                mt-7
                max-w-xl
                text-base
                leading-7
                text-muted-foreground
                sm:text-lg
                sm:leading-8
              "
            >
              Pick a period from your reading history, choose your books, and
              make the impossible choices that reveal your favorites.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-12 rounded-full px-6"
                onClick={continueFromPeriod}
              >
                {showSourceChoice
                  ? "Choose how to build your list"
                  : "Choose your period"}

                <ArrowRight className="ml-2 size-4" />
              </Button>

              <span className="text-sm text-muted-foreground">
                {periodLabel}
              </span>
            </div>
          </div>

          {/* Main Card */}
          <Card
            className="
              rounded-3xl
              border-border/70
              bg-card/95
              p-5
              shadow-xl
              shadow-black/4
              backdrop-blur
              sm:p-7
            "
          >
            {!showSourceChoice ? (
              <>
                {/* Step 01 */}
                <div className="mb-7">
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-muted-foreground
                    "
                  >
                    Step 01
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    What are we ranking?
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose the period you want to look back on.
                  </p>
                </div>

                {/* Period type */}
                <div className="grid grid-cols-4 rounded-xl bg-muted p-1">
                  {(["year", "month", "season", "all"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => selectPeriod(type)}
                      className={`
                        rounded-lg
                        px-2
                        py-2.5
                        text-xs
                        font-medium
                        transition
                        ${
                          periodType === type
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      {type === "all"
                        ? "All time"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Year selector */}
                {periodType !== "all" && (
                  <div
                    className="
                      mt-7
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      bg-background
                      px-4
                      py-3
                    "
                  >
                    <button
                      type="button"
                      onClick={() => changeYear(-1)}
                      className="
                        flex
                        size-9
                        items-center
                        justify-center
                        rounded-full
                        transition
                        hover:bg-muted
                      "
                      aria-label="Previous year"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    <span className="text-lg font-semibold tracking-tight">
                      {year}
                    </span>

                    <button
                      type="button"
                      onClick={() => changeYear(1)}
                      className="
                        flex
                        size-9
                        items-center
                        justify-center
                        rounded-full
                        transition
                        hover:bg-muted
                      "
                      aria-label="Next year"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}

                {/* Month selector */}
                {periodType === "month" && (
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {MONTHS.map((name, index) => {
                      const monthNumber = index + 1;
                      const selected = month === monthNumber;

                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => selectMonth(monthNumber)}
                          className={`
                            rounded-xl
                            border
                            px-3
                            py-3
                            text-sm
                            transition
                            ${
                              selected
                                ? "border-foreground bg-foreground text-background"
                                : "hover:bg-muted"
                            }
                          `}
                        >
                          {name.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Season selector */}
                {periodType === "season" && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {SEASONS.map((item) => {
                      const selected = season === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => selectSeason(item.value)}
                          className={`
                            rounded-2xl
                            border
                            p-4
                            text-left
                            transition
                            ${
                              selected
                                ? "border-foreground bg-foreground text-background"
                                : "hover:bg-muted"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>

                            {selected && <Check className="size-4" />}
                          </div>

                          <p
                            className={`
                              mt-1
                              text-xs
                              ${
                                selected
                                  ? "text-background/60"
                                  : "text-muted-foreground"
                              }
                            `}
                          >
                            {item.months}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* All time */}
                {periodType === "all" && (
                  <div
                    className="
                      mt-5
                      rounded-2xl
                      border
                      border-dashed
                      p-6
                      text-center
                    "
                  >
                    <p className="font-medium">Your entire reading history</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Every book you choose can become part of the ranking.
                    </p>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Selected period */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Selected period
                    </p>

                    <p className="mt-0.5 font-semibold">{periodLabel}</p>
                  </div>

                  <Button className="rounded-full" onClick={continueFromPeriod}>
                    Continue
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Step 02 */}
                <div className="mb-7">
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-muted-foreground
                    "
                  >
                    Step 02
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    How do you want to build your list?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Choose how you want to add books for{" "}
                    <span className="font-medium text-foreground">
                      {periodLabel}
                    </span>
                    .
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Goodreads */}
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={uploading}
                    className="
                      group
                      w-full
                      rounded-2xl
                      border
                      p-5
                      text-left
                      transition
                      hover:border-foreground
                      hover:bg-muted/50
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          flex
                          size-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-muted
                        "
                      >
                        <Upload className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-semibold">
                            {uploading
                              ? "Importing your books..."
                              : "Upload Goodreads CSV"}
                          </h3>

                          {!uploading && (
                            <ArrowRight
                              className="
                                size-4
                                shrink-0
                                text-muted-foreground
                                transition-transform
                                group-hover:translate-x-1
                                group-hover:text-foreground
                              "
                            />
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Import the books you read during {periodLabel}{" "}
                          automatically.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Manual */}
                  <button
                    type="button"
                    onClick={goToManualSelection}
                    className="
                      group
                      w-full
                      rounded-2xl
                      border
                      p-5
                      text-left
                      transition
                      hover:border-foreground
                      hover:bg-muted/50
                    "
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          flex
                          size-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-muted
                        "
                      >
                        <Search className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-semibold">
                            Select books manually
                          </h3>

                          <ArrowRight
                            className="
                              size-4
                              shrink-0
                              text-muted-foreground
                              transition-transform
                              group-hover:translate-x-1
                              group-hover:text-foreground
                            "
                          />
                        </div>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Search the library and choose the books you want to
                          compare.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowSourceChoice(false)}
                    className="
                      text-sm
                      text-muted-foreground
                      transition
                      hover:text-foreground
                    "
                  >
                    ← Change period
                  </button>

                  <span className="text-sm font-medium">{periodLabel}</span>
                </div>

                {/* Hidden CSV input */}
                <input
                  ref={fileInputRef}
                  id="goodreads-upload"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleGoodreadsUpload}
                />
              </>
            )}
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/20">
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-20
            sm:px-6
            lg:px-8
            lg:py-24
          "
        >
          <div className="max-w-2xl">
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-muted-foreground
              "
            >
              The idea
            </p>

            <h2
              className="
                mt-3
                text-4xl
                font-semibold
                tracking-tight
                sm:text-5xl
              "
            >
              Your books.
              <br />
              Your impossible choices.
            </h2>
          </div>

          <div
            className="
              mt-14
              grid
              gap-px
              overflow-hidden
              rounded-3xl
              border
              bg-border
              md:grid-cols-3
            "
          >
            {[
              {
                number: "01",
                title: "Pick a period",
                text: "Choose a year, month, season, or your entire reading history.",
              },
              {
                number: "02",
                title: "Build your list",
                text: "Import your Goodreads history or search and choose books yourself.",
              },
              {
                number: "03",
                title: "Find your #1",
                text: "Compare your books head-to-head until your personal ranking emerges.",
              },
            ].map((item) => (
              <div key={item.number} className="bg-background p-8 sm:p-10">
                <span className="text-sm font-semibold text-muted-foreground">
                  {item.number}
                </span>

                <h3 className="mt-14 text-xl font-semibold">{item.title}</h3>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t">
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-20
            text-center
            sm:px-6
            lg:px-8
            lg:py-28
          "
        >
          <p className="text-sm text-muted-foreground">
            Your reading history is waiting.
          </p>

          <h2
            className="
              mx-auto
              mt-3
              max-w-3xl
              text-4xl
              font-semibold
              tracking-tight
              sm:text-6xl
            "
          >
            Let&apos;s find the book that meant the most.
          </h2>

          <Button
            size="lg"
            className="mt-8 h-12 rounded-full px-7"
            onClick={continueFromPeriod}
          >
            Start ranking
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
