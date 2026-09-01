import { bookLabel } from "../lib/format";
import type { Book } from "../types";

export function BookBadge({ book }: { book: Book }) {
  return (
    <span className={`badge ${book}`} data-testid={`book-badge-${book}`}>
      {bookLabel(book)}
    </span>
  );
}
