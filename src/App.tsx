import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { Board } from "./components/Board";
import { DealView } from "./components/DealView";
import { DemoBanner } from "./components/DemoBanner";
import { MyWork } from "./components/MyWork";
import { parseHash } from "./lib/route";
import { useStore } from "./store/store";

export function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const { deals } = useStore();

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const deal =
    route.name === "file"
      ? deals.find((item) => item.id === route.dealId)
      : undefined;

  return (
    <div className="app-shell">
      <DemoBanner />
      <AppHeader route={route} />
      {route.name === "work" ? <MyWork /> : null}
      {route.name === "board" ? <Board book={route.book} /> : null}
      {route.name === "file" && deal ? <DealView deal={deal} /> : null}
      {route.name === "file" && !deal ? (
        <div className="file-page">
          <h1>File not found</h1>
          <p className="subtle">That demo file is not in this shop.</p>
          <a href="#/">Back to the pipeline</a>
        </div>
      ) : null}
    </div>
  );
}
