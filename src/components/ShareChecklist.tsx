import { primaryBorrower } from "../domain/parties";
import { sharePageUrl } from "../lib/route";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function ShareChecklist({ deal }: { deal: Deal }) {
  const { receiveSharedCondition } = useStore();
  const borrower = primaryBorrower(deal);
  const open = deal.conditions.filter((item) => !item.completed);
  const url = sharePageUrl(deal.id);

  return (
    <div className="work-page" data-testid="share-checklist">
      <h1>Checklist for {borrower.name}</h1>
      <p className="subtle">
        Borrower-facing list of conditions still needed. Mark one received.
        Nothing uploads. This is a demo, not advice.
      </p>
      {deal.conditions.length === 0 ? (
        <p className="subtle">No items on this checklist.</p>
      ) : (
        deal.conditions.map((item) => (
          <div key={item.id} className={`task-row${item.completed ? " done" : ""}`}>
            <div className={item.completed ? "task-title" : undefined}>{item.title}</div>
            {item.completed ? (
              <span className="subtle">Received</span>
            ) : (
              <button
                type="button"
                className="btn"
                data-testid={`share-receive-${item.id}`}
                onClick={() => receiveSharedCondition(deal.id, item.id)}
              >
                Mark received
              </button>
            )}
          </div>
        ))
      )}
      <p className="subtle">
        {open.length} still needed. Share this page:{" "}
        <a href={url} data-testid="share-url">
          {url}
        </a>
      </p>
    </div>
  );
}
