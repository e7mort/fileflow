import { STAGE_LABELS } from "../domain/stages";
import { formatCad, formatDate, purposeLabel } from "../lib/format";
import { useStore } from "../store/store";
import { STAGES, type Deal } from "../types";
import { BookBadge } from "./BookBadge";
import { Mentions } from "./Mentions";
import { NextActionPanel } from "./NextActionPanel";
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
        <label>Lawyer / notary</label>
        <p>{deal.lawyer ?? "Not assigned"}</p>
      </div>
      <div className="fact">
        <label>Charge position</label>
        <p>{deal.position === "second" ? "Second" : "First"}</p>
      </div>
    </>
  );
}

export function DealView({ deal }: { deal: Deal }) {
  const { changeStage, canWrite } = useStore();

  return (
    <div className="file-page" data-testid="file-view">
      <div className="file-header">
        <div className="file-title">
          <a className="subtle" href="#/">
            ← Pipeline
          </a>
          <h1>{deal.borrower.name}</h1>
          <div className="card-meta">
            <BookBadge book={deal.book} />
            <span className="badge">{formatCad(deal.amount)}</span>
            <span className="badge">{STAGE_LABELS[deal.stage]}</span>
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
              if (next) {
                changeStage(deal.id, next);
              }
            }}
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="file-grid">
        <section className="panel">
          <h2>File</h2>
          <div className="facts">
            <div className="fact">
              <label>Borrower</label>
              <p>{deal.borrower.name}</p>
            </div>
            <div className="fact">
              <label>Email / phone</label>
              <p>
                {deal.borrower.email}
                <br />
                {deal.borrower.phone}
              </p>
            </div>
            <div className="fact">
              <label>Property</label>
              <p>{deal.property.address}</p>
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
            <BookFields deal={deal} />
          </div>
          <div className="fact" style={{ marginTop: "0.9rem" }}>
            <label>Conditions</label>
            {deal.conditions.length ? (
              <ul className="conditions">
                {deal.conditions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="subtle">No open conditions listed.</p>
            )}
          </div>
        </section>
        <NextActionPanel deal={deal} />
        <TaskList deal={deal} />
        <Mentions deal={deal} />
      </div>
    </div>
  );
}
