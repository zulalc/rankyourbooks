import { ArrowRight } from "lucide-react";
import { Book } from "../types/book";

type Props = {
  book: Book;
  onChoose: () => void;
};

export default function ComparisonCard({ book, onChoose }: Props) {
  return (
    <button
      type="button"
      onClick={onChoose}
      className="
        group relative w-full overflow-hidden rounded-3xl
        border border-border/70
        bg-card
        p-4 text-left
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:border-foreground/20
        hover:shadow-xl
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-foreground
        focus-visible:ring-offset-2
        active:translate-y-0
        active:scale-[0.99]
        md:p-6
      "
    >
      {/* Subtle hover background */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-b
          from-muted/40 via-transparent to-transparent
          opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      <div className="relative">
        {/* Book cover */}
        <div
          className="
            flex
            min-h-[220px]
            items-center
            justify-center
            rounded-2xl
            bg-muted/40
            p-4
            md:min-h-[320px]
            md:p-6
          "
        >
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="
                max-h-[210px]
                w-auto
                max-w-full
                rounded-lg
                object-contain
                shadow-md
                transition-transform
                duration-500
                group-hover:scale-[1.03]
                md:max-h-[290px]
              "
            />
          ) : (
            <div
              className="
                flex
                h-[210px]
                w-[140px]
                items-center
                justify-center
                rounded-lg
                border
                border-border
                bg-background
                px-4
                text-center
                text-sm
                font-medium
                text-muted-foreground
                shadow-sm
                md:h-[290px]
                md:w-[190px]
              "
            >
              {book.title}
            </div>
          )}
        </div>

        {/* Book information */}
        <div className="mt-5">
          <h2
            className="
              line-clamp-2
              text-base
              font-semibold
              leading-snug
              tracking-tight
              md:text-xl
            "
          >
            {book.title}
          </h2>

          {book.authors.length > 0 && (
            <p
              className="
                mt-1.5
                line-clamp-1
                text-sm
                text-muted-foreground
              "
            >
              {book.authors.join(", ")}
            </p>
          )}
        </div>

        {/* Choose hint */}
        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            border-t
            border-border/60
            pt-4
          "
        >
          <span
            className="
              text-xs
              font-medium
              uppercase
              tracking-[0.14em]
              text-muted-foreground
              transition-colors
              group-hover:text-foreground
            "
          >
            Choose this book
          </span>

          <span
            className="
              flex
              size-8
              items-center
              justify-center
              rounded-full
              border
              border-border
              transition-all
              duration-300
              group-hover:border-foreground
              group-hover:bg-foreground
              group-hover:text-background
            "
          >
            <ArrowRight
              className="
                size-3.5
                transition-transform
                duration-300
                group-hover:translate-x-0.5
              "
            />
          </span>
        </div>
      </div>
    </button>
  );
}
