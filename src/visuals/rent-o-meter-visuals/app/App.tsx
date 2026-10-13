import { useEffect, useMemo, useState } from "react";
import type { Dataset } from "./data";
import { loadDataset } from "./data";
import type { Me } from "./stats";
import { Article } from "./components/Article";
import { DebugColumn, DebugView } from "./components/DebugView";
import { Finder } from "./components/Finder";
import { MapView } from "./components/MapView";
import { storyScreens } from "./components/Screens";
import { strings } from "./strings";
import { fmt, rich } from "./text";
import { Story } from "./components/Story";

export default function App() {
  const [ds, setDs] = useState<Dataset | null>(null);
  const [err, setErr] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [index, setIndex] = useState(0);
  const [hash, setHash] = useState(() => window.location.hash);
  const onMap = hash === "#map" || hash.startsWith("#map?");
  const onDebug = hash === "#debug" || hash.startsWith("#debug-apt?");

  useEffect(() => {
    const f = () => setHash(window.location.hash);
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);

  useEffect(() => {
    loadDataset().then(setDs, (e: Error) => setErr(e.message));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("locked", !!me || onMap);
  }, [me, onMap]);

  const screens = useMemo(
    () =>
      ds && me
        ? storyScreens(ds, me, (rent) => setMe((m) => (m ? { ...m, rent, tenure: 1, before: false } : m)))
        : [],
    [ds, me],
  );

  if (onDebug) {
    if (!ds)
      return (
        <section className="finder loading">
          <p className="ask">{err ? fmt(strings.finder.broke, { error: err }) : strings.finder.loading}</p>
        </section>
      );
    return hash === "#debug" ? <DebugView ds={ds} /> : <DebugColumn ds={ds} hash={hash} />;
  }

  if (onMap) {
    if (!ds)
      return (
        <section className="finder loading">
          <p className="ask">{err ? fmt(strings.finder.broke, { error: err }) : strings.finder.loading}</p>
        </section>
      );
    return (
      <MapView
        ds={ds}
        onBack={() => {
          // came from inside the app: go back; opened straight from a link: go to the start
          if (window.history.state?.fromApp) window.history.back();
          else window.location.hash = "";
        }}
      />
    );
  }

  return (
    <>
      {!me && <Article />}
      <div className="stage">
        <main className="column">
          {!me && (
            <>
              {ds ? (
                <Finder
                  ds={ds}
                  onGo={(m) => {
                    setMe(m);
                    setIndex(0);
                    window.scrollTo({ top: 0 });
                  }}
                />
              ) : (
                <section className="finder loading">
                  <h2 className="screwed">{rich(strings.finder.headline)}</h2>
                  <p className="ask">{err ? fmt(strings.finder.broke, { error: err }) : strings.finder.loading}</p>
                </section>
              )}
            </>
          )}
          {me && ds && (
            <Story
              screens={screens}
              index={index}
              setIndex={setIndex}
              onClose={() => {
                setMe(null);
                setTimeout(() => document.getElementById("finder")?.scrollIntoView(), 0);
              }}
            />
          )}
        </main>
      </div>
    </>
  );
}
