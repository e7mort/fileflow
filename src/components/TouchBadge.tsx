import type { FileTouchKind } from "../domain/nudges";

const LABELS: Record<FileTouchKind, string> = {
  new: "New",
  stale: "Stale",
  past: "Past client",
  fresh: "Fresh",
};

export function TouchBadge({ kind }: { kind: FileTouchKind }) {
  const tone = kind === "stale" || kind === "past" ? "private" : kind === "fresh" ? "commercial" : undefined;
  return (
    <span className={tone ? `badge ${tone}` : "badge"} data-testid={`touch-${kind}`}>
      {LABELS[kind]}
    </span>
  );
}
