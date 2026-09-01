import { isConflicting } from "../domain/invoice";
import { DEMO_TODAY, isMaturityReminderDue } from "../domain/maturity";
import { fileTouchKind } from "../domain/nudges";
import { primaryBorrower } from "../domain/parties";
import { firstName, personById } from "../domain/team";
import { formatCad, formatDate } from "../lib/format";
import { hrefFor } from "../lib/route";
import type { Deal } from "../types";
import { BookBadge } from "./BookBadge";
import { FileMover } from "./FileMover";
import { TouchBadge } from "./TouchBadge";

export function DealCard({ deal }: { deal: Deal }) {
  const borrower = primaryBorrower(deal);
  const owner = deal.nextAction.ownerId
    ? personById(deal.nextAction.ownerId)
    : undefined;
  const waiting = deal.nextAction.waitingOn
    ? personById(deal.nextAction.waitingOn.personId)
    : undefined;
  const maturitySoon = isMaturityReminderDue(deal.maturityDate, DEMO_TODAY);

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
        <TouchBadge kind={fileTouchKind(deal, DEMO_TODAY)} />
      </div>
      <p className="borrower">{borrower.name}</p>
      <p className="amount">{formatCad(deal.amount)}</p>
      <FileMover deal={deal} compact />
      {maturitySoon && deal.maturityDate ? (
        <div className="maturity-chip" data-testid={`maturity-${deal.id}`}>
          Renewal {formatDate(deal.maturityDate)}
        </div>
      ) : null}
      {isConflicting(deal) ? (
        <div className="conflict-chip" data-testid={`conflict-${deal.id}`}>
          CONFLICTING
        </div>
      ) : null}
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
