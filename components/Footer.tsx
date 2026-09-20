import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div
        className="
          mx-auto
          flex
          max-w-7xl
          flex-col
          gap-4
          px-4
          py-8
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
          lg:px-8
        "
      >
        <div>
          <Link
            href="/"
            className="
              text-sm
              font-semibold
              tracking-tight
              text-foreground
              transition-opacity
              hover:opacity-70
            "
          >
            RankYourBooks
          </Link>

          <p className="mt-1 text-xs text-muted-foreground">
            Find your favorite books, one comparison at a time.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} RankYourBooks
        </p>
      </div>
    </footer>
  );
}
