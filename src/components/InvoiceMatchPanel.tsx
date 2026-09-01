import {
  JOIN_RULES,
  invoicesForDeal,
  isConflicting,
  isFundedInFileflow,
  joinViaLabel,
} from "../domain/invoice";
import { formatCad, formatDate } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function InvoiceMatchPanel({ deal }: { deal: Deal }) {
  const { deals, invoices } = useStore();
  const bound = invoicesForDeal(invoices, deals, deal.id);
  const conflict = isConflicting(deal);
  const funded = isFundedInFileflow(deal);

  return (
    <section className="panel" data-testid="invoice-match">
      <h2>Invoice match</h2>
      <p className="subtle">
        Commission / payout tracking — not borrower income. Conditions and
        HOI / lawyer stay on this file as Fileflow tasks. There is no document
        vault.
      </p>
      {conflict ? (
        <div className="conflict-chip" data-testid="conflicting-ids">
          CONFLICTING · operational File # {deal.fileNumber} ≠ MOS file id{" "}
          {deal.mosFileId} / FILEKEY {deal.fileKey}
        </div>
      ) : null}
      <ol className="join-rules" data-testid="join-rules">
        {JOIN_RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      <div className="facts">
        <div className="fact">
          <label>Operational File #</label>
          <p data-testid="file-number">{deal.fileNumber}</p>
        </div>
        <div className="fact">
          <label>MOS file id</label>
          <p data-testid="mos-file-id">{deal.mosFileId}</p>
        </div>
        <div className="fact">
          <label>FILEKEY</label>
          <p data-testid="filekey">{deal.fileKey}</p>
        </div>
        <div className="fact">
          <label>Commission FILEKEY</label>
          <p>{deal.fileKey}</p>
        </div>
        <div className="fact">
          <label>Payout lender</label>
          <p>{deal.lender}</p>
        </div>
        <div className="fact">
          <label>Payout amount</label>
          <p data-testid="payout-amount">{formatCad(deal.payoutAmount)}</p>
        </div>
        <div className="fact">
          <label>Income Tracking Status (commission / payout)</label>
          <p data-testid="payout-status">{deal.payoutTrackingStatus}</p>
        </div>
        <div className="fact">
          <label>Income Tracking Date (commission / payout)</label>
          <p data-testid="payout-date">{formatDate(deal.payoutTrackingDate)}</p>
        </div>
        <div className="fact">
          <label>Funded in Fileflow</label>
          <p data-testid="funded-in-fileflow">{funded ? "Yes" : "No"}</p>
        </div>
        <div className="fact">
          <label>MOS close date (not proof of funded)</label>
          <p data-testid="mos-close-date">{formatDate(deal.mosCloseDate)}</p>
        </div>
        <div className="fact">
          <label>MOS document flags (not proof of funded)</label>
          <p data-testid="mos-document-flags">{deal.mosDocumentFlags ?? "None"}</p>
        </div>
      </div>
      <p className="subtle">
        Funded requires an explicit funding confirm (date or reference) on
        this file. Stage, close date, MOS close date, and MOS document flags
        are not proof the file funded.
      </p>
      <h3 className="invoice-subhead">Bound invoices</h3>
      {bound.length === 0 ? (
        <p className="subtle">No invoices bound to this file.</p>
      ) : (
        <ul className="invoice-rows" data-testid="bound-invoices">
          {bound.map((item) => (
            <li key={item.invoice.id} data-testid={`bound-invoice-${item.invoice.id}`}>
              <strong>{item.invoice.id}</strong> · via {joinViaLabel(item.via)} ·{" "}
              {item.invoice.lender} · {formatCad(item.invoice.payoutAmount)} ·{" "}
              {item.invoice.incomeTrackingStatus} ·{" "}
              {formatDate(item.invoice.incomeTrackingDate)}
              {item.identityMatch ? " · identity match" : " · identity miss"}
            </li>
          ))}
        </ul>
      )}
      <p>
        <a href={hrefFor({ name: "invoices" })} data-testid="unmatched-invoices-link">
          Unmatched invoices
        </a>
      </p>
    </section>
  );
}
