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

function parsePath(path: string): Route {
  const normalized = path.replace(/^#/, "") || "/";
  if (normalized === "/today" || normalized === "/work") {
    return { name: "today" };
  }
  if (normalized === "/calendar") {
    return { name: "calendar" };
  }
  if (normalized === "/partners") {
    return { name: "partners" };
  }
  const partner = normalized.match(/^\/partners\/([^/?]+)/);
  if (partner?.[1]) {
    return { name: "partner", partnerId: partner[1] };
  }
  const share = normalized.match(/^\/share\/([^/?]+)/);
  if (share?.[1]) {
    return { name: "share", dealId: share[1] };
  }
  const file = normalized.match(/^\/files\/([^/?]+)/);
  if (file?.[1]) {
    return { name: "file", dealId: file[1] };
  }
  const book = normalized.match(/^\/books\/([^/?]+)/);
  if (book?.[1] && isBook(book[1])) {
    return { name: "board", book: book[1] };
  }
  return { name: "board", book: "all" };
}

export function parseHash(hash: string): Route {
  return parsePath(hash);
}

export function parseLocation(loc: {
  hash: string;
  pathname: string;
  origin?: string;
}): Route {
  const hashPath = loc.hash.replace(/^#/, "");
  if (hashPath && hashPath !== "/") {
    return parsePath(hashPath);
  }
  return parsePath(stripBase(loc.pathname));
}

function stripBase(pathname: string): string {
  const base = (typeof import.meta !== "undefined" ? import.meta.env.BASE_URL : "/").replace(
    /\/$/,
    "",
  );
  if (base && pathname.startsWith(base)) {
    return pathname.slice(base.length) || "/";
  }
  return pathname || "/";
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

export function absoluteHashUrl(
  hash: string,
  loc: { origin: string },
  base = "/",
): string {
  const prefix = base.endsWith("/") ? base : `${base}/`;
  const cleaned = hash.startsWith("#") ? hash : `#${hash}`;
  return `${loc.origin}${prefix}${cleaned}`;
}

export function sharePageUrl(dealId: string): string {
  const hash = hrefFor({ name: "share", dealId });
  if (typeof window === "undefined") {
    return hash;
  }
  return absoluteHashUrl(hash, window.location, import.meta.env.BASE_URL);
}

export function isPhoneViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches;
}
