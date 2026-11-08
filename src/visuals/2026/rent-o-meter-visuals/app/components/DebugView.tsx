import { useMemo, useState } from "react";
import type { Dataset, Unit } from "../data";
import { money, tenureText, unitTitle } from "../format";
import type { Me } from "../stats";
import { bedKey, bedsLabel } from "../stats";
import { strings } from "../strings";
import { storyScreens } from "./Screens";

const N = 8; // apartments across
const PHONE_W = 390; // each column renders at phone width, in its own iframe so media queries and vw match
const PHONE_H = 800;
const GAP = 24;
const SCALE = 0.6;

/** N different units with a usable rent, at random. */
function pick(ds: Dataset): Unit[] {
  const out = new Set<Unit>();
  while (out.size < Math.min(N, ds.rents.length)) out.add(ds.rents[Math.floor(Math.random() * ds.rents.length)]);
  return [...out];
}

/** The person the story would build if they picked this unit in the finder and changed nothing. */
function meFor(ds: Dataset, u: Unit): Me {
  return { building: ds.buildings[u.b], unit: u, beds: u.beds, k: bedKey(u.beds)!, rent: u.rent, tenure: u.tenure, before: u.before };
}

/** #debug: every story screen (down) for N random apartments (across). */
export function DebugView({ ds }: { ds: Dataset }) {
  const D = strings.debug;
  const [units, setUnits] = useState(() => pick(ds));
  const rows = useMemo(() => (units.length ? storyScreens(ds, meFor(ds, units[0]), () => {}).map((s) => s.key) : []), [ds, units]);
  const colH = rows.length * (PHONE_H + GAP);

  return (
    <div className="debug">
      <header className="debug-top">
        <h1>{D.title}</h1>
        <button className="mv-filter-btn" onClick={() => setUnits(pick(ds))}>
          {D.refresh}
        </button>
        <a className="debug-back" href="#">
          {D.back}
        </a>
      </header>
      <div className="debug-grid">
        <div className="debug-labels" style={{ paddingTop: "var(--debug-head)" }}>
          {rows.map((key) => (
            <div key={key} className="debug-label" style={{ height: (PHONE_H + GAP) * SCALE }}>
              {key}
            </div>
          ))}
        </div>
        {units.map((u) => {
          const b = ds.buildings[u.b];
          return (
            <div key={`${u.b}-${u.i}`} className="debug-col" style={{ width: PHONE_W * SCALE }}>
              <div className="debug-head">
                <strong>{b.address}</strong>
                <span>
                  {unitTitle(b, u)} · {bedsLabel(u.beds)} · {money(u.rent)}
                </span>
                <span>{tenureText(u)}</span>
              </div>
              <div style={{ width: PHONE_W * SCALE, height: colH * SCALE, overflow: "hidden" }}>
                <iframe
                  title={b.address}
                  src={`${window.location.pathname}#debug-apt?b=${u.b}&i=${u.i}`}
                  width={PHONE_W}
                  height={colH}
                  style={{ transform: `scale(${SCALE})`, transformOrigin: "0 0" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** #debug-apt?b=&i=: one apartment's screens stacked, each in a phone-sized story frame (DebugView's iframes). */
export function DebugColumn({ ds, hash }: { ds: Dataset; hash: string }) {
  const q = new URLSearchParams(hash.split("?")[1] ?? "");
  const u = ds.buildings[Number(q.get("b"))]?.units[Number(q.get("i"))];
  if (!u) return null;
  return (
    <div className="debug-stack" style={{ gap: GAP }}>
      {storyScreens(ds, meFor(ds, u), () => {}).map((s) => (
        <div key={s.key} className={`story tone-${s.tone}`} style={{ height: PHONE_H, flex: "none" }}>
          <div className="story-scroll">
            <div className="screen">{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
