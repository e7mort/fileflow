import { formatCad, formatCadCompact } from "../lib/format";
import type { PipelineKpis } from "../domain/acquire";

export function PipelineKpisStrip({ kpis }: { kpis: PipelineKpis }) {
  const cards = [
    { key: "open", label: "Open pipeline", value: formatCad(kpis.openPipeline) },
    {
      key: "funded-month",
      label: "Funded this month",
      value: formatCad(kpis.fundedThisMonth),
    },
    {
      key: "consults",
      label: "Consults booked",
      value: String(kpis.consultsThisMonth),
    },
    {
      key: "funded-all",
      label: "All-time funded",
      value: formatCadCompact(kpis.allTimeFunded),
    },
  ];

  return (
    <div className="kpi-strip" data-testid="kpi-strip">
      {cards.map((card) => (
        <div className="kpi-card" key={card.key} data-testid={`kpi-${card.key}`}>
          <label>{card.label}</label>
          <p>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
