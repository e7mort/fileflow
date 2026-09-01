import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { Board } from "./components/Board";
import { CalendarView } from "./components/CalendarView";
import { DealView } from "./components/DealView";
import { DemoBanner } from "./components/DemoBanner";
import { InvoicesView } from "./components/InvoicesView";
import { PartnersView } from "./components/PartnersView";
import { ShareChecklist } from "./components/ShareChecklist";
import { TodayView } from "./components/TodayView";
import { isPhoneViewport, parseLocation } from "./lib/route";
import { useStore } from "./store/store";

export function App() {
  const [route, setRoute] = useState(() => parseLocation(window.location));
  const { deals } = useStore();

  useEffect(() => {
    const current = parseLocation(window.location);
    if (!window.location.hash && current.name === "board" && isPhoneViewport()) {
      window.location.hash = "#/today";
    }
    const onChange = () => setRoute(parseLocation(window.location));
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  const deal =
    route.name === "file" || route.name === "share"
      ? deals.find((item) => item.id === route.dealId)
      : undefined;

  return (
    <div className="app-shell">
      <DemoBanner />
      {route.name === "share" ? null : <AppHeader route={route} />}
      {route.name === "today" ? <TodayView /> : null}
      {route.name === "calendar" ? <CalendarView /> : null}
      {route.name === "partners" ? <PartnersView /> : null}
      {route.name === "partner" ? <PartnersView partnerId={route.partnerId} /> : null}
      {route.name === "invoices" ? <InvoicesView /> : null}
      {route.name === "board" ? <Board book={route.book} /> : null}
      {route.name === "file" && deal ? <DealView deal={deal} /> : null}
      {route.name === "share" && deal ? <ShareChecklist deal={deal} /> : null}
      {(route.name === "file" || route.name === "share") && !deal ? (
        <div className="file-page">
          <h1>File not found</h1>
          <p className="subtle">That demo file is not in this shop.</p>
          <a href="#/">Back to the pipeline</a>
        </div>
      ) : null}
    </div>
  );
}
