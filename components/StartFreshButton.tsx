import { useBookStore } from "@/store/useBookStore";

export function StartFreshButton() {
  const reset = useBookStore((s) => s.reset);

  const handleReset = () => {
    const ok = window.confirm(
      "Start a new ranking?\nYour current book list will be cleared.",
    );

    if (ok) reset();
  };

  return (
    <button
      onClick={handleReset}
      className="
        px-4 py-2 rounded-lg text-sm font-medium
        border border-red-200 dark:border-red-900
        bg-red-50 dark:bg-red-950
        text-red-700 dark:text-red-300
        hover:bg-red-100 dark:hover:bg-red-900
        transition
      "
    >
      Start Fresh
    </button>
  );
}
