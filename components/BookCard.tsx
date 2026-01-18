import { Book } from "../types/book";

type Props = {
  book: Book;
  selected?: boolean;
  onClick?: () => void;
};

export default function BookCard({ book, selected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
      relative cursor-pointer rounded-lg p-4 transition

      border
      bg-white dark:bg-gray-800
      border-gray-200 dark:border-gray-700

      ${
        selected
          ? "border-black dark:border-gray-400 ring-2 ring-black dark:ring-gray-400"
          : "hover:shadow-md dark:hover:shadow-gray-700"
      }
    `}
    >
      {selected && (
        <div
          className="
    absolute top-2 right-2
    bg-emerald-600 dark:bg-emerald-500
    text-white text-xs font-medium
    px-2 py-1 rounded
    shadow
  "
        >
          ✓ Selected
        </div>
      )}

      {book.thumbnail && (
        <img
          src={book.thumbnail}
          alt={book.title}
          className="
          h-40 w-full object-cover rounded
          border border-gray-100 dark:border-gray-700
        "
        />
      )}

      <h3 className="mt-2 font-semibold text-foreground">{book.title}</h3>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {book.authors.join(", ")}
      </p>
    </div>
  );
}
