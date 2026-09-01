import { useState } from "react";
import { closePackRows, sopColumnRows } from "../domain/closepack";
import { hasFundingConfirm } from "../domain/invoice";
import { formatDate } from "../lib/format";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function ClosePackPanel({ deal }: { deal: Deal }) {
  const { canRecordFunding, recordDealFundingConfirm } = useStore();
  const [fundedAt, setFundedAt] = useState(deal.fundedAt ?? "");
  const [fundingConfirmRef, setFundingConfirmRef] = useState(deal.fundingConfirmRef ?? "");
  const [note, setNote] = useState<string | null>(null);
  const closePack = closePackRows(deal);
  const sop = sopColumnRows(deal);
  const confirmed = hasFundingConfirm(deal);

  return (
    <section className="panel" data-testid="close-pack">
      <h2>Close pack</h2>
      <p className="subtle">
        Lawyer signing → Funded → Review. These rows stay visible even when
        empty. Dragging to Funded or filling a close date is not proof.
      </p>
      <ul className="pack-rows">
        {closePack.map((row) => (
          <li
            key={row.id}
            className={`pack-row ${row.status}`}
            data-testid={`close-pack-${row.id}`}
          >
            <span>{row.label}</span>
            <span className={`pack-status ${row.status}`}>{row.detail}</span>
          </li>
        ))}
      </ul>
      <h3 className="invoice-subhead">SOP columns</h3>
      <p className="subtle">Kept on the file. Never silently empty.</p>
      <ul className="pack-rows" data-testid="sop-columns">
        {sop.map((row) => (
          <li
            key={row.id}
            className={`pack-row ${row.status}`}
            data-testid={`sop-${row.id}`}
          >
            <span>{row.label}</span>
            <span className={`pack-status ${row.status}`}>{row.detail}</span>
          </li>
        ))}
      </ul>
      <h3 className="invoice-subhead">Funding confirm</h3>
      <p className="subtle" data-testid="funding-confirm-status">
        {confirmed
          ? `On file${deal.fundedAt ? ` · ${formatDate(deal.fundedAt)}` : ""}${
              deal.fundingConfirmRef ? ` · ${deal.fundingConfirmRef}` : ""
            }`
          : "Open. Close date and MOS close date are not proof."}
      </p>
      {canRecordFunding ? (
        <form
          className="handoff-form"
          data-testid="funding-confirm-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!fundedAt.trim() && !fundingConfirmRef.trim()) {
              setNote("Enter a funding confirm date or reference.");
              return;
            }
            setNote(null);
            recordDealFundingConfirm(deal.id, {
              fundedAt: fundedAt.trim() || null,
              fundingConfirmRef: fundingConfirmRef.trim() || null,
            });
          }}
        >
          <div className="field">
            <label htmlFor="funding-confirm-date">Funding confirm date</label>
            <input
              id="funding-confirm-date"
              type="date"
              value={fundedAt}
              onChange={(event) => setFundedAt(event.target.value)}
              data-testid="funding-confirm-date"
            />
          </div>
          <div className="field">
            <label htmlFor="funding-confirm-ref">Funding confirm reference</label>
            <input
              id="funding-confirm-ref"
              value={fundingConfirmRef}
              onChange={(event) => setFundingConfirmRef(event.target.value)}
              placeholder="Lender funding ref"
              data-testid="funding-confirm-ref"
            />
          </div>
          <button type="submit" className="btn" data-testid="record-funding-confirm">
            Record funding confirm
          </button>
        </form>
      ) : (
        <p className="viewer-note">
          Only LO or UW can record a funding confirm. Unlicensed Assistant cannot.
        </p>
      )}
      {note ? (
        <p className="viewer-note" data-testid="funding-confirm-note">
          {note}
        </p>
      ) : null}
    </section>
  );
}
