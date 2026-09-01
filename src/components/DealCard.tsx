import { fileBlurb } from "../domain/blurb";
import { DEMO_TODAY, isMaturityReminderDue } from "../domain/maturity";
import { primaryBorrower } from "../domain/parties";
import { STAGE_LABELS } from "../domain/stages";
import { firstName, personById } from "../domain/team";
import { formatCadCompact, formatDate } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import { STAGES, type Deal, type Stage } from "../types";
import { BookBadge } from "./BookBadge";

export function DealCard({ deal }: { deal: Deal }) {
  const { changeStage, canWrite } = useStore();
  const borrower = primaryBorrower(deal);
  const owner = deal.nextAction.ownerId
    ? personById(deal.nextAction.ownerId)
    : undefined;
  const waiting = deal.nextAction.waitingOn
    ? personById(deal.nextAction.waitingOn.personId)
    : undefined;
  const maturitySoon = isMaturityReminderDue(deal.maturityDate, DEMO_TODAY);
  const fileHref = hrefFor({ name: "file", dealId: deal.id });

  return (
    <article
      className="deal-card"
      draggable={canWrite}
      data-testid={`deal-card-${deal.id}`}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("select, button, a")) {
          return;
        }
        window.location.hash = fileHref;
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", deal.id);
        event.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="card-meta">
        <BookBadge book={deal.book} />
      </div>
      <a className="borrower" href={fileHref}>
        {borrower.name}
      </a>
      <p className="card-blurb">{fileBlurb(deal)}</p>
      {maturitySoon && deal.maturityDate ? (
        <div className="maturity-chip" data-testid={`maturity-${deal.id}`}>
          Renewal {formatDate(deal.maturityDate)}
        </div>
      ) : null}
      <div className="card-foot">
        <div className="est-row">
          <span className="est-label">Estd</span>
          <span className="amount">{formatCadCompact(deal.amount)}</span>
        </div>
        <label className="stage-chip">
          <span className="visually-hidden">Move stage</span>
          <select
            className="stage-chip-select"
            value={deal.stage}
            disabled={!canWrite}
            aria-label={`Stage for ${borrower.name}`}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => {
              event.stopPropagation();
              changeStage(deal.id, event.target.value as Stage);
            }}
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="next-strip">
        <strong>Next.</strong> {deal.nextAction.title}
        {owner ? (
          <div className="subtle">Owner {firstName(owner.name)}</div>
        ) : (
          <div className="subtle">Owner unassigned</div>
        )}
      </div>
      {waiting && deal.nextAction.waitingOn ? (
        <div className="waiting-chip" data-testid={`waiting-${deal.id}`}>
          Waiting on {firstName(waiting.name)} · {deal.nextAction.waitingOn.reason}
        </div>
      ) : null}
    </article>
  );
}
