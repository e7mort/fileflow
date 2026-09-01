import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { Board } from "./components/Board";
import { CalendarView } from "./components/CalendarView";
import { CapturePage } from "./components/CapturePage";
import { DealView } from "./components/DealView";
import { DemoBanner } from "./components/DemoBanner";
import { InboxView } from "./components/InboxView";
import { PartnersView } from "./components/PartnersView";
import { ShareChecklist } from "./components/ShareChecklist";
import { ShopSidebar } from "./components/ShopSidebar";
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

  const hideChrome = route.name === "share" || route.name === "capture";

  const main = (
    <>
      {route.name === "today" ? <TodayView /> : null}
      {route.name === "calendar" ? <CalendarView /> : null}
      {route.name === "partners" ? <PartnersView /> : null}
      {route.name === "partner" ? <PartnersView partnerId={route.partnerId} /> : null}
      {route.name === "inbox" ? (
        <InboxView conversationId={route.conversationId} />
      ) : null}
      {route.name === "capture" ? <CapturePage /> : null}
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
    </>
  );

  return (
    <div className="app-shell">
      <DemoBanner />
      {hideChrome ? (
        main
      ) : (
        <div className="shop-frame">
          <ShopSidebar route={route} />
          <div className="shop-main">
            <AppHeader route={route} />
            {main}
          </div>
        </div>
      )}
    </div>
  );
}
