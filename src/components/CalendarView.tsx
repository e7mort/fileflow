import { useMemo, useState } from "react";
import { calendarEvents, eventsOnDate, monthCells } from "../domain/calendar";
import { formatDate } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthTitle(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex, 1),
  );
}

export function CalendarView() {
  const { deals } = useStore();
  const events = useMemo(() => calendarEvents(deals), [deals]);
  const [year, setYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(7);
  const cells = monthCells(year, monthIndex);

  const shift = (delta: number) => {
    const next = new Date(year, monthIndex + delta, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  };

  return (
    <div className="work-page" data-testid="calendar">
      <h1>Calendar</h1>
      <p className="subtle">
        Next-action due dates and maturity / renewal reminder dates. Click an
        item to open the file. Nothing syncs out of this demo.
      </p>
      <div className="board-toolbar">
        <div className="row-actions">
          <button type="button" className="btn secondary" onClick={() => shift(-1)}>
            Previous
          </button>
          <button type="button" className="btn secondary" onClick={() => shift(1)}>
            Next
          </button>
        </div>
        <h2>{monthTitle(year, monthIndex)}</h2>
      </div>
      <div className="calendar-grid" data-testid="calendar-grid">
        {WEEKDAYS.map((day) => (
          <div className="calendar-dow" key={day}>
            {day}
          </div>
        ))}
        {cells.map((iso, index) => (
          <div className="calendar-cell" key={iso ?? `empty-${index}`}>
            {iso ? <div className="calendar-day">{iso.slice(8)}</div> : null}
            {iso
              ? eventsOnDate(events, iso).map((event) => (
                  <a
                    key={`${event.dealId}-${event.kind}-${event.date}`}
                    className={`calendar-event ${event.kind}`}
                    href={hrefFor({ name: "file", dealId: event.dealId })}
                    data-testid={`cal-${event.kind}-${event.dealId}`}
                  >
                    <strong>{event.kind === "maturity" ? "Renewal" : "Next"}</strong>
                    <span>
                      {event.borrowerName}: {event.title}
                    </span>
                  </a>
                ))
              : null}
          </div>
        ))}
      </div>
      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2>Upcoming</h2>
        <div className="work-list">
          {events.slice(0, 10).map((event) => (
            <a
              key={`${event.dealId}-${event.kind}-${event.date}`}
              className="work-item"
              href={hrefFor({ name: "file", dealId: event.dealId })}
            >
              <div className="subtle">{formatDate(event.date)}</div>
              <p className="borrower">{event.borrowerName}</p>
              <p className="subtle">
                {event.kind === "maturity" ? "Maturity / renewal" : "Next action"} ·{" "}
                {event.title}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
