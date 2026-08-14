import { useState } from "react";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function ConditionsList({ deal }: { deal: Deal }) {
  const { canWrite, addDealCondition, completeDealCondition } = useStore();
  const [title, setTitle] = useState("");

  return (
    <section className="panel" data-testid="conditions-list">
      <h2>Conditions</h2>
      <p className="subtle">
        A list on the file. Add or clear a condition here. There is no document
        vault and nothing is uploaded.
      </p>
      {deal.conditions.length === 0 ? (
        <p className="subtle">No conditions listed.</p>
      ) : (
        deal.conditions.map((condition) => (
          <div
            key={condition.id}
            className={`task-row${condition.completed ? " done" : ""}`}
          >
            <div className={condition.completed ? "task-title" : undefined}>
              {condition.title}
            </div>
            {condition.completed ? (
              <span className="subtle">Cleared</span>
            ) : (
              <button
                type="button"
                className="btn secondary"
                disabled={!canWrite}
                data-testid={`clear-condition-${condition.id}`}
                onClick={() => completeDealCondition(deal.id, condition.id)}
              >
                Mark done
              </button>
            )}
          </div>
        ))
      )}
      {canWrite ? (
        <form
          className="row-actions"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) {
              return;
            }
            addDealCondition(deal.id, title);
            setTitle("");
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a condition"
            data-testid="new-condition"
          />
          <button type="submit" className="btn secondary" data-testid="add-condition">
            Add condition
          </button>
        </form>
      ) : null}
    </section>
  );
}
