import { BOOKS, type Book, type DealId } from "../types";

export type Route =
  | { name: "board"; book: Book | "all" }
  | { name: "work" }
  | { name: "file"; dealId: DealId };

function isBook(value: string): value is Book {
  return BOOKS.some((book) => book === value);
}

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/work") {
    return { name: "work" };
  }
  const file = path.match(/^\/files\/([^/?]+)/);
  if (file?.[1]) {
    return { name: "file", dealId: file[1] };
  }
  const book = path.match(/^\/books\/([^/?]+)/);
  if (book?.[1] && isBook(book[1])) {
    return { name: "board", book: book[1] };
  }
  return { name: "board", book: "all" };
}

export function hrefFor(route: Route): string {
  if (route.name === "work") {
    return "#/work";
  }
  if (route.name === "file") {
    return `#/files/${route.dealId}`;
  }
  if (route.book === "all") {
    return "#/";
  }
  return `#/books/${route.book}`;
}
