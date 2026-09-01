import { useState } from "react";
import { STAGE_LABELS, STAGE_NOTES } from "../domain/stages";
import { bookLabel } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import { BOOKS, STAGES, type Book, type Stage } from "../types";
import { DealCard } from "./DealCard";

export function Board({ book }: { book: Book | "all" }) {
  const { deals, changeStage, canWrite, stageBlocked } = useStore();
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [dropGate, setDropGate] = useState<string | null>(null);
  const visible = deals.filter((deal) => book === "all" || deal.book === book);

  return (
    <div className="board-page">
      <div className="board-toolbar">
        <div>
          <h1>Shop pipeline</h1>
          <p className="subtle">
            Mortgage-native Canada stages. One next action on every file.
            Lender UW is the lender's column. Shop UW is file-complete /
            conditions. On Hold and Inactive are side doors — an open file can
            sit On Hold without looking funded. Filter the three books or leave
            it on all.
          </p>
        </div>
        <div className="book-filter" data-testid="book-filter">
          <a href="#/" className={book === "all" ? "active" : undefined}>
            All books
          </a>
          {BOOKS.map((item) => (
            <a
              key={item}
              href={hrefFor({ name: "board", book: item })}
              className={book === item ? "active" : undefined}
              data-testid={`filter-${item}`}
            >
              {bookLabel(item)}
            </a>
          ))}
        </div>
      </div>
      {dropGate ? (
        <p className="viewer-note" data-testid="board-stage-gate">
          {dropGate}
        </p>
      ) : null}
      <div className="board" data-testid="board">
        {STAGES.map((stage) => {
          const columnDeals = visible.filter((deal) => deal.stage === stage);
          return (
            <section
              key={stage}
              className={`column${overStage === stage ? " drop-target" : ""}`}
              data-testid={`column-${stage}`}
              onDragOver={(event) => {
                if (!canWrite) {
                  return;
                }
                event.preventDefault();
                setOverStage(stage);
              }}
              onDragLeave={() => setOverStage(null)}
              onDrop={(event) => {
                event.preventDefault();
                setOverStage(null);
                const dealId = event.dataTransfer.getData("text/plain");
                if (dealId && canWrite) {
                  const blocked = stageBlocked(dealId, stage);
                  if (blocked) {
                    setDropGate(blocked);
                    return;
                  }
                  setDropGate(null);
                  changeStage(dealId, stage);
                }
              }}
            >
              <div className="column-head">
                <h2>{STAGE_LABELS[stage]}</h2>
                <span className="count">{columnDeals.length}</span>
              </div>
              {STAGE_NOTES[stage] ? (
                <p className="column-note">{STAGE_NOTES[stage]}</p>
              ) : null}
              {columnDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
