import { fileMover } from "../domain/mover";
import { STAGE_LABELS } from "../domain/stages";
import { formatDate } from "../lib/format";
import type { Deal } from "../types";

export function FileMover({
  deal,
  compact = false,
}: {
  deal: Deal;
  compact?: boolean;
}) {
  const mover = fileMover(deal);
  return (
    <div className={`file-mover${compact ? " compact" : ""}`} data-testid="file-mover">
      <div className="mover-primary">
        <span data-testid="mover-file-number">
          <strong>File #</strong> {mover.fileNumber}
        </span>
        <span data-testid="mover-stage">
          <strong>Stage</strong> {STAGE_LABELS[mover.stage]}
        </span>
        <span data-testid="mover-owner">
          <strong>Action owner</strong> {mover.actionOwner}
        </span>
        <span data-testid="mover-lender">
          <strong>Lender</strong> {mover.lender}
        </span>
      </div>
      <p className="mover-docs" data-testid="mover-docs">
        <strong>Docs / action.</strong> {mover.docsAction}
      </p>
      <p className="mover-close" data-testid="mover-close">
        Close date {formatDate(mover.closeDate)} — secondary, not proof of funded
      </p>
    </div>
  );
}
