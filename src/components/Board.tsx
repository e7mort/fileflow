import { useState } from "react";
import { columnValue, pipelineKpis } from "../domain/acquire";
import { STAGE_LABELS } from "../domain/stages";
import { bookLabel, formatCadCompact } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import { BOOKS, STAGES, type Book, type Stage } from "../types";
import { DealCard } from "./DealCard";
import { PipelineKpisStrip } from "./PipelineKpisStrip";

export function Board({ book }: { book: Book | "all" }) {
  const { deals, consults, changeStage, canWrite } = useStore();
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const visible = deals.filter((deal) => book === "all" || deal.book === book);
  const kpis = pipelineKpis(visible, consults);

  return (
    <div className="board-page">
      <div className="board-toolbar">
        <div>
          <h1>Pipeline</h1>
          <p className="subtle">Manage your files and stages.</p>
        </div>
        <div className="board-toolbar-actions">
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
          <a className="btn" href="#/capture">
            + New file
          </a>
        </div>
      </div>
      <PipelineKpisStrip kpis={kpis} />
      <div className="board" data-testid="board">
        {STAGES.map((stage) => {
          const columnDeals = visible.filter((deal) => deal.stage === stage);
          const total = columnValue(columnDeals);
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
                  changeStage(dealId, stage);
                }
              }}
            >
              <div className="column-head">
                <h2>{STAGE_LABELS[stage]}</h2>
                <span className="count">
                  {columnDeals.length} • {formatCadCompact(total)}
                </span>
              </div>
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
