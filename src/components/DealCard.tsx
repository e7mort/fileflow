import { firstName, personById } from "../domain/team";
import { formatCad } from "../lib/format";
import { hrefFor } from "../lib/route";
import type { Deal } from "../types";
import { BookBadge } from "./BookBadge";

export function DealCard({ deal }: { deal: Deal }) {
  const owner = deal.nextAction.ownerId
    ? personById(deal.nextAction.ownerId)
    : undefined;
  const waiting = deal.nextAction.waitingOn
    ? personById(deal.nextAction.waitingOn.personId)
    : undefined;

  return (
    <a
      className="deal-card"
      href={hrefFor({ name: "file", dealId: deal.id })}
      draggable
      data-testid={`deal-card-${deal.id}`}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", deal.id);
        event.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="card-meta">
        <BookBadge book={deal.book} />
      </div>
      <p className="borrower">{deal.borrower.name}</p>
      <p className="amount">{formatCad(deal.amount)}</p>
      <div className="next-strip">
        <strong>Next.</strong> {deal.nextAction.title}
        {owner ? <div className="subtle">Owner {firstName(owner.name)}</div> : (
          <div className="subtle">Owner unassigned</div>
        )}
      </div>
      {waiting && deal.nextAction.waitingOn ? (
        <div className="waiting-chip" data-testid={`waiting-${deal.id}`}>
          Waiting on {firstName(waiting.name)} · {deal.nextAction.waitingOn.reason}
        </div>
      ) : null}
    </a>
  );
}
