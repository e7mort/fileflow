import { useState } from "react";
import { isConflicting } from "../domain/invoice";
import { DEMO_TODAY, isMaturityReminderDue } from "../domain/maturity";
import { primaryBorrower } from "../domain/parties";
import { STAGE_LABELS, STAGE_NOTES } from "../domain/stages";
import { isNewLead } from "../domain/touch";
import { formatCad, formatDate, purposeLabel } from "../lib/format";
import { telHref } from "../lib/phone";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import { STAGES, type Deal } from "../types";
import { BookBadge } from "./BookBadge";
import { ConditionsList } from "./ConditionsList";
import { InvoiceMatchPanel } from "./InvoiceMatchPanel";
import { Mentions } from "./Mentions";
import { NextActionPanel } from "./NextActionPanel";
import { PartiesPanel } from "./PartiesPanel";
import { TaskList } from "./TaskList";

function BookFields({ deal }: { deal: Deal }) {
  if (deal.book === "residential") {
    return (
      <>
        <div className="fact">
          <label>Purpose</label>
          <p>{purposeLabel(deal.purpose)}</p>
        </div>
        <div className="fact">
          <label>Insured</label>
          <p>{deal.insurance === "insured" ? "Insured" : "Uninsured"}</p>
        </div>
        <div className="fact">
          <label>Stress test</label>
          <p data-testid="stress-test">
            {deal.stressTest.kind === "value"
              ? `${deal.stressTest.qualifyingRate.toFixed(2)}% qualifying rate`
              : `Status: ${deal.stressTest.status}`}
          </p>
        </div>
      </>
    );
  }
  if (deal.book === "commercial") {
    return (
      <>
        <div className="fact">
          <label>DSCR</label>
          <p data-testid="dscr">{deal.dscr ?? "Not recorded"}</p>
        </div>
        <div className="fact">
          <label>NOI (annual)</label>
          <p data-testid="noi">{deal.noi == null ? "Not recorded" : formatCad(deal.noi)}</p>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="fact">
        <label>Term</label>
        <p data-testid="private-term">{deal.termMonths} months</p>
      </div>
      <div className="fact">
        <label>Exit</label>
        <p data-testid="private-exit">{deal.exitStrategy}</p>
      </div>
      <div className="fact">
        <label>Broker fee</label>
        <p>{deal.brokerFee == null ? "Not recorded" : formatCad(deal.brokerFee)}</p>
      </div>
      <div className="fact">
        <label>Charge position</label>
        <p>{deal.position === "second" ? "Second" : "First"}</p>
      </div>
    </>
  );
}

export function DealView({ deal }: { deal: Deal }) {
  const { changeStage, canWrite, markFirstTouch, stageBlocked } = useStore();
  const [gate, setGate] = useState<string | null>(null);
  const borrower = primaryBorrower(deal);
  const maturitySoon = isMaturityReminderDue(deal.maturityDate, DEMO_TODAY);

  return (
    <div className="file-page" data-testid="file-view">
      <div className="file-header">
        <div className="file-title">
          <a className="subtle" href="#/">
            ← Pipeline
          </a>
          {" · "}
          <a
            className="subtle"
            href={hrefFor({ name: "share", dealId: deal.id })}
            data-testid="share-checklist-link"
          >
            Share checklist
          </a>
          <h1>{borrower.name}</h1>
          <div className="card-meta">
            <BookBadge book={deal.book} />
            <span className="badge">{formatCad(deal.amount)}</span>
            <span className="badge">{STAGE_LABELS[deal.stage]}</span>
            {maturitySoon ? (
              <span className="badge maturity" data-testid="maturity-reminder">
                Renewal in 4 months
              </span>
            ) : null}
            {isConflicting(deal) ? (
              <span className="badge conflict" data-testid="file-conflict-badge">
                CONFLICTING
              </span>
            ) : null}
          </div>
        </div>
        <div className="field">
          <label htmlFor="stage-select">Move stage</label>
          <select
            id="stage-select"
            className="stage-select"
            data-testid="stage-select"
            value={deal.stage}
            disabled={!canWrite}
            onChange={(event) => {
              const next = STAGES.find((stage) => stage === event.target.value);
              if (!next) {
                return;
              }
              const blocked = stageBlocked(deal.id, next);
              if (blocked) {
                setGate(blocked);
                return;
              }
              setGate(null);
              changeStage(deal.id, next);
            }}
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
          {gate ? (
            <p className="viewer-note" data-testid="stage-gate">
              {gate}
            </p>
          ) : null}
        </div>
      </div>
      {maturitySoon && deal.maturityDate ? (
        <div className="maturity-banner" data-testid="maturity-banner">
          Maturity / renewal reminder: {formatDate(deal.maturityDate)}. This is a
          reminder only. It does not decide the file and it does not send mail or
          SMS.
        </div>
      ) : null}
      {STAGE_NOTES[deal.stage] ? (
        <div className="maturity-banner" data-testid="stage-note">
          {STAGE_NOTES[deal.stage]}
        </div>
      ) : null}
      {isNewLead(deal) && canWrite ? (
        <div className="row-actions">
          <button type="button" className="btn" onClick={() => markFirstTouch(deal.id)}>
            Log first touch
          </button>
        </div>
      ) : null}
      <div className="file-grid">
        <section className="panel">
          <h2>File</h2>
          <div className="facts">
            <div className="fact">
              <label>Primary borrower</label>
              <p>{borrower.name}</p>
            </div>
            <div className="fact">
              <label>Email / phone</label>
              <p>
                {borrower.email}
                <br />
                <a href={telHref(borrower.phone)}>{borrower.phone}</a>
              </p>
            </div>
            <div className="fact">
              <label>Property</label>
              <p data-testid="property-address">
                {deal.property.address ?? "No property on file"}
              </p>
            </div>
            <div className="fact">
              <label>Lender</label>
              <p>{deal.lender}</p>
            </div>
            <div className="fact">
              <label>Product</label>
              <p>{deal.product}</p>
            </div>
            <div className="fact">
              <label>Amount</label>
              <p>{formatCad(deal.amount)}</p>
            </div>
            <div className="fact">
              <label>Close date</label>
              <p>{formatDate(deal.closeDate)}</p>
            </div>
            <div className="fact">
              <label>Maturity / renewal</label>
              <p>{formatDate(deal.maturityDate)}</p>
            </div>
            <BookFields deal={deal} />
          </div>
        </section>
        <NextActionPanel deal={deal} />
        <InvoiceMatchPanel deal={deal} />
        <PartiesPanel deal={deal} />
        <ConditionsList deal={deal} />
        <TaskList deal={deal} />
        <Mentions deal={deal} />
      </div>
    </div>
  );
}
