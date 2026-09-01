import { bindInvoice, joinViaLabel, unmatchedInvoices, unmatchedLabel } from "../domain/invoice";
import { primaryBorrower } from "../domain/parties";
import { formatCad } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";

export function InvoicesView() {
  const { deals, invoices } = useStore();
  const unmatched = unmatchedInvoices(invoices, deals);
  const boundRows = invoices.flatMap((invoice) => {
    const result = bindInvoice(invoice, deals);
    if (result.status !== "bound") {
      return [];
    }
    const deal = deals.find((item) => item.id === result.dealId);
    return [
      {
        invoice,
        via: result.via,
        identityMatch: result.identityMatch,
        deal,
      },
    ];
  });

  return (
    <div className="work-page" data-testid="invoices">
      <h1>Invoices</h1>
      <p className="subtle">
        Join is operational File # first, then MOS file id or FILEKEY. Never
        client/borrower name. Never a parallel spreadsheet deal key alone. Identity
        on a hit is FILEKEY + lender + payout amount + Income Tracking Status +
        Income Tracking Date (commission / payout, not borrower income).
      </p>

      <section className="panel">
        <h2>Unmatched</h2>
        {unmatched.length === 0 ? (
          <p className="subtle">Every seeded invoice bound to a file.</p>
        ) : (
          <ul className="invoice-rows" data-testid="unmatched-invoices">
            {unmatched.map((invoice) => {
              const result = bindInvoice(invoice, deals);
              const reason =
                result.status === "unmatched" ? unmatchedLabel(result) : "Unmatched";
              return (
                <li key={invoice.id} data-testid={`unmatched-${invoice.id}`}>
                  <strong>{invoice.id}</strong>
                  {invoice.borrowerName ? ` · name on row: ${invoice.borrowerName}` : ""}
                  {invoice.fileKey ? ` · FILEKEY ${invoice.fileKey}` : " · no FILEKEY"}
                  {invoice.spreadsheetDealKey
                    ? ` · spreadsheet key ${invoice.spreadsheetDealKey}`
                    : ""}{" "}
                  · {invoice.lender} · {formatCad(invoice.payoutAmount)} · {reason}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Bound</h2>
        <ul className="invoice-rows" data-testid="all-bound-invoices">
          {boundRows.map((row) => (
            <li key={row.invoice.id} data-testid={`listed-bound-${row.invoice.id}`}>
              <strong>{row.invoice.id}</strong> · via {joinViaLabel(row.via)}
              {row.deal ? (
                <>
                  {" · "}
                  <a href={hrefFor({ name: "file", dealId: row.deal.id })}>
                    {primaryBorrower(row.deal).name}
                  </a>
                </>
              ) : null}
              {row.identityMatch ? " · identity match" : " · identity miss"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
