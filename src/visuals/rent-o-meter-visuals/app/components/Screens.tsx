import { useRef, useState } from "react";
import type { Building, Dataset, Unit } from "../data";
import { money, tenureText, unitTitle } from "../format";
import type { BuildingStory, Me, Rentometer, Verdict } from "../stats";
import { bedsLabel, buildingStory, isMe, rentometer } from "../stats";
import { BoxStrip } from "./BoxStrip";
import { openMap } from "./MapView";
import type { StoryScreen } from "./Story";
import { UnitList } from "./UnitList";
import { strings } from "../strings";
import { fmt, rich } from "../text";

const S = strings.screens;

/** The word in a "you pay more/less than 85%" verdict (the larger share; see stats.verdict). */
const verdictWord = (v: Verdict) => strings.words[v.word];

function Next() {
  return <p className="tapnext">{strings.story.next}</p>;
}

// --- 1. your building --------------------------------------------------------------------------------

function RankRow({ me, b, u }: { me: Me; b: Building; u: Unit }) {
  return (
    <li className={isMe(me, u) ? "me" : ""}>
      <span className="rr-unit">
        {unitTitle(b, u)}
        {isMe(me, u) && <span className="you-chip">{strings.you}</span>}
      </span>
      <span className="rr-rent">
        {money(u.rent)} <span className="rr-ten">{fmt(S.building.rankTenure, { tenure: tenureText(u) })}</span>
      </span>
    </li>
  );
}

/** "Not what you pay?": the registry's rent isn't theirs, so take their own and count it as a one-year tenancy. */
function NotWhatYouPay({ onRent }: { onRent: (rent: number) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const rent = Number(text.replace(/[^\d.]/g, ""));
  if (!open)
    return (
      <button className="not-mine" onClick={() => setOpen(true)}>
        {S.building.notMine}
      </button>
    );
  return (
    <form
      className="fix-rent"
      data-nonav
      onSubmit={(e) => {
        e.preventDefault();
        if (rent < 100) return;
        onRent(rent);
        setOpen(false);
        setText("");
      }}
    >
      <input
        className="mid-input"
        inputMode="numeric"
        autoFocus
        placeholder={strings.finder.rentPlaceholder}
        aria-label={S.building.notMineAria}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="fix-go" disabled={rent < 100}>
        {S.building.notMineGo}
      </button>
    </form>
  );
}

export function BuildingScreen({ me, st, onRent }: { me: Me; st: BuildingStory; onRent: (rent: number) => void }) {
  const b = me.building;
  const kind = bedsLabel(me.beds);
  if (!st.peers.length)
    return (
      <>
        <h2 className="mega">{rich(S.building.only, { kind })}</h2>
        <p className="sub">{S.building.onlySub}</p>
        <NotWhatYouPay onRent={onRent} />
        <Next />
      </>
    );
  return (
    <>
      <h2 className="mega">
        {st.verdict.word === "same"
          ? rich(S.building.same, { rent: money(me.rent), kind })
          : rich(S.building.verdict, {
              rent: money(me.rent),
              word: verdictWord(st.verdict),
              pct: st.verdict.pct,
              compare_room_num: st.verdict.count, // the units you pay more (or less) than ...
              room_count: st.verdict.n + 1, // ... out of every unit in your building with your bedrooms, yours included
              kind: strings.bedrooms.spelled[me.beds] ?? bedsLabel(me.beds),
            })}
      </h2>
      <NotWhatYouPay onRent={onRent} />
      <BoxStrip values={st.peers.map((u) => u.rent)} you={me.rent} />
      <div className="split">
        <div>
          <h4>{fmt(S.building.highest, { kind: bedsLabel(me.beds, true) })}</h4>
          <ul className="ranks">
            {st.highest.map((u) => (
              <RankRow key={u.i} me={me} b={b} u={u} />
            ))}
          </ul>
        </div>
        {st.lowest.length > 0 && (
          <div>
            <h4>{fmt(S.building.lowest, { kind: bedsLabel(me.beds, true) })}</h4>
            <ul className="ranks">
              {st.lowest.map((u) => (
                <RankRow key={u.i} me={me} b={b} u={u} />
              ))}
            </ul>
          </div>
        )}
      </div>
      <Next />
    </>
  );
}

// --- 2. the cheapest unit -----------------------------------------------------------------------------

export function CheapestScreen({ me, st }: { me: Me; st: BuildingStory }) {
  const listRef = useRef<HTMLDivElement>(null);
  const b = me.building;
  const kind = bedsLabel(me.beds);
  const c = st.cheapest;
  return (
    <>
      {!c ? (
        <h2 className="mega">{rich(S.cheapest.nobody, { kind })}</h2>
      ) : me.rent <= c.rent ? (
        <h2 className="mega">{rich(S.cheapest.least, { kind })}</h2>
      ) : (
        <h2 className="mega">{rich(S.cheapest.more, { amount: money(me.rent - c.rent), kind })}</h2>
      )}
      <button
        className="see-all"
        onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      >
        {S.cheapest.seeAll}
      </button>
      <div ref={listRef} className="list-card">
        <UnitList building={b} highlight={me.unit?.i} initialBeds={me.beds} />
      </div>
    </>
  );
}

// --- 5. the rent-o-meter ------------------------------------------------------------------------------

export function MeterIntroScreen() {
  return (
    <>
      <h2 className="mega">{rich(S.meterIntro)}</h2>
      <Next />
    </>
  );
}

/** The expected range as a band, its middle as a tick, and your rent as the red "you" line. */
function RangeStrip({ rm, you }: { rm: Rentometer; you: number }) {
  const lo = Math.min(rm.lo, you) * 0.9;
  const hi = Math.max(rm.hi, you) * 1.1;
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const youPct = x(you);
  const labelX = youPct < 6 ? 15 : youPct > 94 ? -15 : 0;
  return (
    <svg className="boxstrip" width="100%" height="64" role="img" aria-label={S.meter.chartLabel}>
      <line x1="0" x2="100%" y1="32" y2="32" className="bs-track" />
      <rect x={`${x(rm.lo)}%`} width={`${x(rm.hi) - x(rm.lo)}%`} y="22" height="20" rx="4" className="bs-box" />
      <line x1={`${x(rm.expected)}%`} x2={`${x(rm.expected)}%`} y1="22" y2="42" className="bs-median" />
      <text x={`${x(rm.lo)}%`} y="60" textAnchor="middle" className="rs-label">
        {money(rm.lo)}
      </text>
      <text x={`${x(rm.hi)}%`} y="60" textAnchor="middle" className="rs-label">
        {money(rm.hi)}
      </text>
      <line x1={`${youPct}%`} x2={`${youPct}%`} y1="18" y2="46" className="bs-you" />
      <svg x={`${youPct}%`} y="0" overflow="visible">
        <rect x={labelX - 16} y="0" width="32" height="17" rx="8.5" className="bs-you-pill" />
        <text x={labelX} y="12.5" textAnchor="middle" className="bs-you-label">
          {strings.you}
        </text>
      </svg>
    </svg>
  );
}

export function MeterScreen({ me, rm }: { me: Me; rm: Rentometer }) {
  return (
    <>
      <h2 className="mega">{rich(S.meter.range, { lo: money(rm.lo), hi: money(rm.hi) })}</h2>
      <RangeStrip rm={rm} you={me.rent} />
      {rm.outside && (
        <p className="sub big-sub">
          {rich(S.meter.outside, {
            amount: money(Math.abs(rm.diff)),
            word: rm.diff > 0 ? strings.words.more : strings.words.less,
          })}
        </p>
      )}
      <details className="fine method" data-nonav>
        <summary>{S.meter.accurateQuestion}</summary>
        {S.meter.accurateAnswer.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </details>
      <Next />
    </>
  );
}

// --- 6. your landlord ---------------------------------------------------------------------------------

export function OwnerScreen({ ds, me }: { ds: Dataset; me: Me }) {
  const o = me.building.owner;
  if (o < 0)
    return (
      <>
        <h2 className="mega">{S.owner.unknown}</h2>
        <Next />
      </>
    );
  const premium = ds.owners.premium[o];
  const units = ds.owners.units[o];
  // a button to their buildings on the map, when there's more than this one to see
  const l = me.building.landlord;
  const onMap = l >= 0 && ds.buildings.some((x) => x.landlord === l && x.i !== me.building.i);
  return (
    <>
      <h2 className="mega">{rich(S.owner.owns, { name: ds.owners.names[o].toLowerCase() })}</h2>
      {premium !== null && (
        <p className="sub big-sub">
          {Math.abs(premium) < 25
            ? S.owner.premiumNone
            : rich(premium > 0 ? S.owner.premiumMore : S.owner.premiumLess, { amount: money(Math.abs(premium)) })}
        </p>
      )}
      <p className="sub big-sub">
        {units === 1 ? S.owner.onlyOne : rich(S.owner.ownsMany, { n: units.toLocaleString() })}
      </p>
      {onMap && (
        <button className="see-all" onClick={() => openMap(me.building.landlord)}>
          {S.owner.seeMap}
        </button>
      )}
      <Next />
    </>
  );
}

// --- 7. share ----------------------------------------------------------------------------------------

export function ShareScreen() {
  const [copied, setCopied] = useState(false);
  async function share() {
    // the story's link once it has one (links.story), else this page
    const url = strings.links.story || window.location.origin + window.location.pathname;
    const data = { title: S.share.shareTitle, text: S.share.shareText, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      /* the person closed the share sheet */
    }
  }
  return (
    <div className="share">
      <h2 className="mega">{S.share.headline}</h2>
      <button className="go light" onClick={share}>
        {copied ? S.share.copied : S.share.button} <span aria-hidden>↗</span>
      </button>
      <button className="go light map-go" onClick={() => openMap()}>
        {S.share.mapButton} <span aria-hidden>→</span>
      </button>
      <p className="fine">{S.share.records}</p>
      <details className="fine method" data-nonav>
        <summary>{S.share.methodSummary}</summary>
        <p>{S.share.method}</p>
      </details>
    </div>
  );
}

// --- the whole story ----------------------------------------------------------------------------------

/** Every screen of the story for one person, in order (the app's story and the #debug grid both use it).
 * onRent: they typed in a different rent on the first screen. */
export function storyScreens(ds: Dataset, me: Me, onRent: (rent: number) => void): StoryScreen[] {
  const b = buildingStory(me);
  const rm = rentometer(ds, me);
  return [
    { key: "building", tone: "electric", body: <BuildingScreen me={me} st={b} onRent={onRent} /> },
    { key: "cheapest", tone: "white", body: <CheapestScreen me={me} st={b} /> },
    { key: "meter-intro", tone: "electric", body: <MeterIntroScreen /> },
    { key: "meter", tone: "white", body: <MeterScreen me={me} rm={rm} /> },
    { key: "owner", tone: "ice", body: <OwnerScreen ds={ds} me={me} /> },
    { key: "share", tone: "electric", body: <ShareScreen /> },
  ];
}
