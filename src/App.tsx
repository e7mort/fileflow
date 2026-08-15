import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { Board } from "./components/Board";
import { CalendarView } from "./components/CalendarView";
import { DealView } from "./components/DealView";
import { DemoBanner } from "./components/DemoBanner";
import { PartnersView } from "./components/PartnersView";
import { ShareChecklist } from "./components/ShareChecklist";
import { TodayView } from "./components/TodayView";
import { isPhoneViewport, parseHash } from "./lib/route";
import { useStore } from "./store/store";

export function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const { deals } = useStore();

  useEffect(() => {
    if (!window.location.hash && isPhoneViewport()) {
      window.location.hash = "#/today";
    }
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
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
