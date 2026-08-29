import { hrefFor, type Route } from "../lib/route";

const LINKS: { href: string; label: string; match: (route: Route) => boolean }[] = [
  {
    href: hrefFor({ name: "today" }),
    label: "Today",
    match: (route) => route.name === "today",
  },
  {
    href: "#/",
    label: "Pipeline",
    match: (route) => route.name === "board",
  },
  {
    href: hrefFor({ name: "inbox", conversationId: null }),
    label: "Inbox",
    match: (route) => route.name === "inbox",
  },
  {
    href: hrefFor({ name: "capture" }),
    label: "Capture",
    match: (route) => route.name === "capture",
  },
  {
    href: hrefFor({ name: "calendar" }),
    label: "Calendar",
    match: (route) => route.name === "calendar",
  },
  {
    href: hrefFor({ name: "partners" }),
    label: "Partners",
    match: (route) => route.name === "partners" || route.name === "partner",
  },
];

export function ShopSidebar({ route }: { route: Route }) {
  return (
    <aside className="shop-sidebar" data-testid="shop-sidebar">
      <a className="wordmark sidebar-wordmark" href="#/">
        File<span>flow</span>
      </a>
      <nav className="shop-nav">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={link.match(route) ? "active" : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
