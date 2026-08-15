import { BOOKS, type Book, type DealId } from "../types";

export type Route =
  | { name: "board"; book: Book | "all" }
  | { name: "today" }
  | { name: "calendar" }
  | { name: "partners" }
  | { name: "partner"; partnerId: string }
  | { name: "file"; dealId: DealId }
  | { name: "share"; dealId: DealId };

function isBook(value: string): value is Book {
  return BOOKS.some((book) => book === value);
}

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/today" || path === "/work") {
    return { name: "today" };
  }
  if (path === "/calendar") {
    return { name: "calendar" };
  }
  if (path === "/partners") {
    return { name: "partners" };
  }
  const partner = path.match(/^\/partners\/([^/?]+)/);
  if (partner?.[1]) {
    return { name: "partner", partnerId: partner[1] };
  }
  const share = path.match(/^\/share\/([^/?]+)/);
  if (share?.[1]) {
    return { name: "share", dealId: share[1] };
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
  switch (route.name) {
    case "today":
      return "#/today";
    case "calendar":
      return "#/calendar";
    case "partners":
      return "#/partners";
    case "partner":
      return `#/partners/${route.partnerId}`;
    case "file":
      return `#/files/${route.dealId}`;
    case "share":
      return `#/share/${route.dealId}`;
    case "board":
      return route.book === "all" ? "#/" : `#/books/${route.book}`;
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
}

export function isPhoneViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches;
}
