import { workForPerson } from "../domain/engine";
import { DEMO_TODAY } from "../domain/maturity";
import { teamMyDay } from "../domain/myday";
import {
  daysSinceTouch,
  fileTouchKind,
  isPastClientNudge,
  isStaleFile,
  type FileTouchKind,
} from "../domain/nudges";
import { primaryBorrower } from "../domain/parties";
import { firstName, roleLabel } from "../domain/team";
import { isNewLead } from "../domain/touch";
import { formatCad } from "../lib/format";
import { telHref } from "../lib/phone";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import type { Deal } from "../types";
import { BookBadge } from "./BookBadge";
import { TouchBadge } from "./TouchBadge";

function DealRow({
  deal,
  note,
  kind,
  onFirstTouch,
}: {
  deal: Deal;
  note: string;
  kind: FileTouchKind;
  onFirstTouch?: () => void;
}) {
  const borrower = primaryBorrower(deal);
  return (
    <div className="work-item today-row" data-testid={`today-${deal.id}`}>
      <a href={hrefFor({ name: "file", dealId: deal.id })}>
        <BookBadge book={deal.book} />
        <TouchBadge kind={kind} />
        <p className="borrower">{borrower.name}</p>
        <p className="subtle">{note}</p>
        <p className="amount">{formatCad(deal.amount)}</p>
      </a>
      <div className="row-actions">
        <a className="btn" href={telHref(borrower.phone)}>
          Call {borrower.phone}
        </a>
        {onFirstTouch ? (
          <button type="button" className="btn secondary" onClick={onFirstTouch}>
            Log first touch
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function TodayView() {
  const { deals, currentPerson, markFirstTouch, canWrite } = useStore();
  const work = workForPerson(deals, currentPerson.id);
  const team = teamMyDay(deals, DEMO_TODAY);
  const newLeads = deals.filter((deal) => isNewLead(deal));
  const stale = deals.filter((deal) => isStaleFile(deal, DEMO_TODAY));
  const past = deals.filter((deal) => isPastClientNudge(deal, DEMO_TODAY));

  return (
    <div className="work-page today-page" data-testid="today">
      <h1>Team My Day</h1>
      <p className="subtle">
        One loudest next action per role for a 3–5 person shop. You are{" "}
        {currentPerson.name} · {roleLabel(currentPerson.role)}. Person switcher
        still works. Pipeline stays on desktop.
      </p>
      <div className="today-stack">
        <section data-testid="today-team">
          <h2>By role</h2>
          {team.map((row) => (
            <div
              key={row.role}
              className={`work-item today-row${row.person.id === currentPerson.id ? " today-row-you" : ""}`}
              data-testid={`today-role-${row.role}`}
            >
              <p className="borrower">
                {roleLabel(row.role)} · {row.person.name}
                {row.readOnly ? " · read-only" : ""}
              </p>
              {row.deal ? (
                <DealRow
                  deal={row.deal}
                  note={row.note}
                  kind={fileTouchKind(row.deal, DEMO_TODAY)}
                />
              ) : (
                <p className="subtle">{row.note}</p>
              )}
            </div>
          ))}
        </section>
        <section data-testid="today-waiting">
          <h2>Waiting on {firstName(currentPerson.name)}</h2>
          {work.waitingOnYou.length === 0 ? (
            <p className="subtle">Nobody is waiting on this person.</p>
          ) : (
            work.waitingOnYou.map((deal) => (
              <DealRow
                key={deal.id}
                deal={deal}
                note={deal.nextAction.waitingOn?.reason ?? "Waiting"}
                kind={fileTouchKind(deal, DEMO_TODAY)}
              />
            ))
          )}
        </section>
        <section data-testid="today-new-leads">
          <h2>New-lead / first-touch queue</h2>
          <p className="subtle">
            Lead stage or no completed task, and no first touch logged.
          </p>
          {newLeads.length === 0 ? (
            <p className="subtle">No new leads waiting.</p>
          ) : (
            newLeads.map((deal) => (
              <DealRow
                key={deal.id}
                deal={deal}
                note={deal.nextAction.title}
                kind="new"
                onFirstTouch={
                  canWrite ? () => markFirstTouch(deal.id) : undefined
                }
              />
            ))
          )}
        </section>
        <section data-testid="today-stale">
          <h2>Stale / no-touch (14+ days)</h2>
          <p className="subtle">
            No completed task, stage move, or last touch in 14 days. Not email.
            Not SMS.
          </p>
          {stale.length === 0 ? (
            <p className="subtle">Nothing is stale.</p>
          ) : (
            stale.map((deal) => (
              <DealRow
                key={deal.id}
                deal={deal}
                kind="stale"
                note={`${daysSinceTouch(deal, DEMO_TODAY)} days since last touch`}
              />
            ))
          )}
        </section>
        <section data-testid="today-past-clients">
          <h2>Past client / no contact (6 months)</h2>
          {past.length === 0 ? (
            <p className="subtle">No past-client nudges.</p>
          ) : (
            past.map((deal) => (
              <DealRow
                key={deal.id}
                deal={deal}
                kind="past"
                note={`${daysSinceTouch(deal, DEMO_TODAY)} days since last contact · funded`}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
