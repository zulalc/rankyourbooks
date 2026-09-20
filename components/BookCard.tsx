import { Check } from "lucide-react";
import { Book } from "../types/book";

type Props = {
  book: Book;
  selected?: boolean;
  onClick?: () => void;
};

export default function BookCard({ book, selected = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative w-full overflow-hidden
        rounded-2xl
        border
        bg-card
        p-3
        text-left
        transition-all
        duration-300
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-foreground
        focus-visible:ring-offset-2

        ${
          selected
            ? `
              border-foreground
              bg-muted/40
              shadow-md
              ring-1
              ring-foreground/20
            `
            : `
              border-border/70
              shadow-sm
              hover:-translate-y-1
              hover:border-foreground/20
              hover:shadow-lg
            `
        }
      `}
    >
      {/* Selected indicator */}
      {selected && (
        <div
          className="
            absolute
            right-3
            top-3
            z-10
            flex
            items-center
            gap-1.5
            rounded-full
            bg-foreground
            px-2.5
            py-1
            text-xs
            font-medium
            text-background
            shadow-sm
          "
        >
          <Check className="size-3" />
          Selected
        </div>
      )}

      {/* Book cover */}
      <div
        className="
          relative
          flex
          h-52
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          bg-muted/40
          p-3
          sm:h-60
        "
      >
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className={`
              h-full
              w-full
              object-contain
              rounded-lg
              shadow-sm
              transition-transform
              duration-500
              ${selected ? "scale-[1.02]" : "group-hover:scale-[1.03]"}
            `}
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              rounded-lg
              border
              border-border
              bg-background
              px-6
              text-center
              text-sm
              font-medium
              text-muted-foreground
            "
          >
            {book.title}
          </div>
        )}

        {/* Hover overlay */}
        {!selected && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-xl
              bg-foreground/[0.03]
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          />
        )}
      </div>

      {/* Book information */}
      <div className="px-1 pb-1 pt-4">
        <h3
          className="
            line-clamp-2
            text-sm
            font-semibold
            leading-snug
            tracking-tight
            sm:text-base
          "
        >
          {book.title}
        </h3>

        {book.authors.length > 0 && (
          <p
            className="
              mt-1.5
              line-clamp-1
              text-xs
              leading-5
              text-muted-foreground
              sm:text-sm
            "
          >
            {book.authors.join(", ")}
          </p>
        )}

        {/* Bottom state */}
        <div
          className={`
            mt-4
            flex
            items-center
            justify-between
            border-t
            pt-3
            text-xs
            font-medium
            transition-colors
            ${
              selected
                ? "border-foreground/10 text-foreground"
                : "border-border/60 text-muted-foreground group-hover:text-foreground"
            }
          `}
        >
          <span>{selected ? "Added to ranking" : "Add to ranking"}</span>

          <span
            className={`
              flex
              size-7
              items-center
              justify-center
              rounded-full
              border
              transition-all
              duration-300
              ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border group-hover:border-foreground group-hover:bg-foreground group-hover:text-background"
              }
            `}
          >
            {selected ? (
              <Check className="size-3.5" />
            ) : (
              <span className="text-sm leading-none">+</span>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
