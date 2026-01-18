import { Book } from "../types/book";

type Props = {
  book: Book;
  onChoose: () => void;
};
export default function ComparisonCard({ book, onChoose }: Props) {
  return (
    <button
      onClick={onChoose}
      className="
        w-full rounded-xl p-3 md:p-6 transition

        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700

        hover:md:scale-[1.03]
        hover:shadow-md md:hover:shadow-lg dark:hover:shadow-gray-900

        active:scale-100
      "
    >
      {book.thumbnail && (
        <img
          src={book.thumbnail}
          alt={book.title}
          className="
            mx-auto
            h-28 sm:h-36 md:h-48
            object-contain
            rounded
            border border-gray-100 dark:border-gray-700
          "
        />
      )}

      <h2 className="mt-2 md:mt-4 text-sm md:text-lg font-semibold md:font-bold">
        {book.title}
      </h2>

      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
        {book.authors.join(", ")}
      </p>
    </button>
  );
}
