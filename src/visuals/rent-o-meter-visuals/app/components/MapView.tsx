import { useEffect, useMemo, useState } from "react";
import type { Building, Dataset } from "../data";
import { money } from "../format";
import type { Basis, BuildingStat, FilterKey, Filters, LandlordStat, Range } from "../mapStats";
import {
  ADJ_COLORS,
  ADJ_LABELS,
  FILTERS,
  NO_RENT,
  adjColor,
  adjParts,
  buildingStats,
  defaultFilters,
  isActive,
  landlordStat,
  onBasis,
  passes,
} from "../mapStats";
import { eraLabel, isLike, sizeLabel } from "../stats";
import { strings } from "../strings";
import { fmt, pl, rich } from "../text";
import { RentMap } from "./RentMap";
import { UnitList } from "./UnitList";

/** Open the map from inside the app, so its back button can return to where you were; optionally with one
 * landlord picked (#map?landlord=N). */
export function openMap(landlord?: number) {
  window.history.pushState({ fromApp: true }, "", landlord === undefined ? "#map" : `#map?landlord=${landlord}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

/** Two thumbs on one track, over a list of step values. */
function RangeFilter({
  label,
  steps,
  show,
  value,
  onChange,
}: {
  label: string;
  steps: number[];
  show: (v: number) => string;
  value: Range;
  onChange: (r: Range) => void;
}) {
  const max = steps.length - 1;
  const [lo, hi] = value;
  const any = lo === 0 && hi === max;
  return (
    <div className="rf">
      <div className="rf-head">
        <span className="rf-label">{label}</span>
        <span className={`rf-val${any ? " any" : ""}`}>
          {any ? strings.map.filter.any : fmt(strings.map.filter.range, { lo: show(steps[lo]), hi: show(steps[hi]) })}
        </span>
      </div>
      <div className="rf-track" style={{ ["--lo" as string]: lo / max, ["--hi" as string]: hi / max }}>
        <input
          type="range"
          min={0}
          max={max}
          value={lo}
          style={{ zIndex: lo > max / 2 ? 2 : 1 }}
          aria-label={fmt(strings.map.filter.atLeast, { label })}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={hi}
          aria-label={fmt(strings.map.filter.atMost, { label })}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </div>
    </div>
  );
}

function Legend({ blocks, basis, onBasis }: { blocks: boolean; basis: Basis; onBasis: (b: Basis) => void }) {
  const L = strings.map.legend;
  const B = strings.map.basis;
  const V = strings.map.vs[basis];
  return (
    <div className="legend" aria-label={L.aria}>
      <div className="lg-basis" role="radiogroup" aria-label={B.label}>
        {(["typical", "meter"] as const).map((k) => (
          <button key={k} role="radio" aria-checked={basis === k} className={basis === k ? "on" : ""} onClick={() => onBasis(k)}>
            {B[k]}
          </button>
        ))}
      </div>
      <div className="lg-title">{blocks ? V.legendBlocks : V.legendBuildings}</div>
      <div className="lg-bar">
        {ADJ_COLORS.map((c, i) => (
          <span key={c} style={{ background: c }} title={ADJ_LABELS[i]} />
        ))}
      </div>
      <div className="lg-ends">
        <span>{L.endLess}</span>
        <span>{V.legendMid}</span>
        <span>{L.endMore}</span>
      </div>
      <div className="lg-extra">
        <span className="lg-chip" style={{ background: NO_RENT }} /> {L.noRent}
        <span className="lg-chip lot" /> {blocks ? L.notRentalBlocks : L.notRentalBuildings}
      </div>
      {blocks && <div className="lg-hint">{L.hint}</div>}
    </div>
  );
}

/** Type-ahead over landlords with 3+ parcels. */
function LandlordPicker({ ds, value, onChange }: { ds: Dataset; value: number | null; onChange: (l: number | null) => void }) {
  const LL = strings.map.landlord;
  const [q, setQ] = useState("");
  const counts = useMemo(() => {
    const c = new Array(ds.landlords.length).fill(0);
    for (const b of ds.buildings) if (b.landlord >= 0) c[b.landlord]++;
    return c;
  }, [ds]);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    const all = ds.landlords.map((name, i) => ({ name, i }));
    return (t ? all.filter((x) => x.name.toLowerCase().includes(t)) : all).slice(0, 8);
  }, [ds, q]);
  return (
    <div className="rf lp">
      <div className="rf-head">
        <span className="rf-label">{LL.label}</span>
        <span className={`rf-val${value === null ? " any" : ""}`}>
          {value === null ? strings.map.filter.any : fmt(LL.buildings, { n: counts[value] })}
        </span>
      </div>
      {value !== null ? (
        <div className="lp-chosen">
          <span>{ds.landlords[value]}</span>
          <button className="panel-x" onClick={() => onChange(null)} aria-label={LL.clear}>
            ×
          </button>
        </div>
      ) : (
        <>
          <input
            className="mid-input lp-input"
            placeholder={fmt(LL.search, { n: ds.landlords.length })}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <ul className="lp-list">
            {hits.map((h) => (
              <li key={h.i}>
                <button onClick={() => onChange(h.i)}>
                  <span>{h.name}</span>
                  <span className="lp-n">{counts[h.i]}</span>
                </button>
              </li>
            ))}
            {!hits.length && <li className="lp-empty">{LL.noMatch}</li>}
          </ul>
        </>
      )}
    </div>
  );
}

/** One landlord's portfolio, across the top of the map while they're picked. */
function LandlordBar({
  name,
  st,
  basis,
  premium,
  onClear,
}: {
  name: string;
  st: LandlordStat;
  basis: Basis;
  premium: number | null; // rent-o-meter $/unit/month, when the owner has 6+ parcels
  onClear: () => void;
}) {
  const LL = strings.map.landlord;
  const parts = [fmt(LL.barCounts, { buildings: st.buildings.length, units: st.units.toLocaleString() })];
  if (premium !== null) {
    parts.push(
      Math.abs(premium) < 25
        ? LL.barPremiumNone
        : fmt(premium > 0 ? LL.barPremiumMore : LL.barPremiumLess, { amount: money(Math.abs(premium)) }),
    );
  } else if (st.adj !== null) {
    const adj = adjParts(st.adj);
    const V = strings.map.vs[basis];
    parts.push(adj.near ? V.barNear : fmt(V.barRelative, { pct: adj.pct, word: adj.word }));
  }
  return (
    <div className="lbar">
      <div className="lbar-text">
        <strong>{name}</strong>
        <span>{parts.join(" · ")}</span>
      </div>
      <button className="panel-x" onClick={onClear} aria-label={LL.clear}>
        ×
      </button>
    </div>
  );
}

/** The building whose lookalikes are showing, across the top of the map. */
function LikeBar({ b, n, onClear }: { b: Building; n: number; onClear: () => void }) {
  const LK = strings.map.like;
  return (
    <div className="lbar">
      <div className="lbar-text">
        <strong>{fmt(LK.bar, { address: b.address })}</strong>
        <span>{fmt(LK.barCounts, { n: n.toLocaleString(), size: sizeLabel(b.total), era: eraLabel(b) })}</span>
      </div>
      <button className="panel-x" onClick={onClear} aria-label={LK.clear}>
        ×
      </button>
    </div>
  );
}

function MapPanel({
  ds,
  b,
  st,
  basis,
  landlord,
  onLandlord,
  like,
  onLike,
  onClose,
}: {
  ds: Dataset;
  b: Building;
  st: BuildingStat;
  basis: Basis;
  landlord: number | null;
  onLandlord: (l: number) => void;
  like: number | null;
  onLike: (b: number) => void;
  onClose: () => void;
}) {
  const count = useMemo(() => (b.landlord < 0 ? 0 : ds.buildings.filter((x) => x.landlord === b.landlord).length), [ds, b]);
  const P = strings.map.building;
  const V = strings.map.vs[basis];
  const adj = st.adj !== null ? adjParts(st.adj) : null;
  return (
    <aside className="panel mv-panel-card" aria-label={fmt(strings.panel.rentsAt, { address: b.address })}>
      <div className="panel-head">
        <div>
          <div className="panel-kicker">
            {pl(P.kicker, b.total, { control: b.controlled ? P.rentControlled : P.notRentControlled })}
          </div>
          <h3>{b.address}</h3>
        </div>
        <button className="panel-x" onClick={onClose} aria-label={strings.panel.close}>
          ×
        </button>
      </div>
      {st.adj !== null && adj ? (
        <p className="mp-verdict">
          <span className="mp-swatch" style={{ background: adjColor(st.adj) }} />
          <span>{adj.near ? V.verdictNear : rich(V.verdictRelative, { pct: adj.pct, word: adj.word })}</span>
        </p>
      ) : (
        <p className="mp-verdict">
          <span>{P.verdictNone}</span>
        </p>
      )}
      <div className="mp-owner">
        {b.landlord >= 0 ? (
          <>
            <span>{rich(P.ownedBy, { name: ds.landlords[b.landlord] })}</span>
            {landlord !== b.landlord && count > 1 && (
              <button className="mp-owner-btn" onClick={() => onLandlord(b.landlord)}>
                {fmt(P.seeTheirs, { n: count })}
              </button>
            )}
          </>
        ) : (
          <span className="mp-owner-none">{P.notNamed}</span>
        )}
      </div>
      {like !== b.i && (
        <div className="mp-owner">
          <button className="mp-owner-btn" onClick={() => onLike(b.i)}>
            {strings.map.like.show}
          </button>
        </div>
      )}
      <div className="mp-stats">
        <div>
          <span className="mp-num">{st.rents ? money(st.avg) : strings.none}</span>
          <span className="mp-lbl">{strings.map.filter.avgRent}</span>
        </div>
      </div>
      <UnitList key={b.i} building={b} showTenure />
    </aside>
  );
}

export function MapView({ ds, onBack }: { ds: Dataset; onBack: () => void }) {
  const { stats: base } = useMemo(() => buildingStats(ds), [ds]);
  const [basis, setBasis] = useState<Basis>("typical");
  const stats = useMemo(() => onBasis(base, basis), [base, basis]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [blockView, setBlockView] = useState(true);
  const [landlord, setLandlordState] = useState<number | null>(() => {
    const n = Number(new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("landlord") ?? NaN);
    return Number.isInteger(n) && n >= 0 && n < ds.landlords.length ? n : null;
  });

  const [like, setLikeState] = useState<number | null>(null); // building whose lookalikes are showing

  const pass = useMemo(
    () =>
      ds.buildings.map(
        (b) =>
          passes(filters, b, stats[b.i]) &&
          (landlord === null || b.landlord === landlord) &&
          (like === null || b.i === like || isLike(ds.buildings[like], b)),
      ),
    [ds, filters, stats, landlord, like],
  );
  const nActive =
    FILTERS.filter((f) => isActive(filters, f.key)).length + (landlord !== null ? 1 : 0) + (like !== null ? 1 : 0);
  const nLike = useMemo(
    () => (like === null ? 0 : ds.buildings.filter((b) => b.rentCount > 0 && (b.i === like || isLike(ds.buildings[like], b))).length),
    [ds, like],
  );
  const lstat = useMemo(() => (landlord === null ? null : landlordStat(ds, stats, landlord)), [ds, stats, landlord]);

  function setLandlord(l: number | null) {
    setLandlordState(l);
    setOpen(false);
    // keep a selected building only if it belongs to the new landlord
    if (l !== null && selected !== null && ds.buildings[selected].landlord !== l) setSelected(null);
  }
  function setLike(b: number | null) {
    setLikeState(b);
    setOpen(false);
  }
  const withRents = useMemo(() => stats.filter((s) => s.rents > 0).length, [stats]);
  const shown = useMemo(() => pass.reduce((n, p, i) => n + (p && stats[i].rents > 0 ? 1 : 0), 0), [pass, stats]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) setOpen(false);
      else if (selected !== null) setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selected]);

  const set = (k: FilterKey, r: Range) => setFilters((f) => ({ ...f, [k]: r }));

  return (
    <div className={`mapview${selected !== null ? " has-sel" : ""}`}>
      <header className="mv-top">
        <button className="mv-back" onClick={onBack} aria-label={strings.map.back}>
          ←
        </button>
        <div className="mv-title">
          <h1>{strings.map.title}</h1>
          <p>
            {nActive
              ? fmt(strings.map.countFiltered, { shown: shown.toLocaleString(), total: withRents.toLocaleString() })
              : fmt(strings.map.countAll, { n: withRents.toLocaleString() })}
          </p>
        </div>
        <button className={`mv-filter-btn${open ? " on" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {strings.map.filters}
          {nActive > 0 && <span className="mv-badge">{nActive}</span>}
        </button>
      </header>

      <div className="mv-body">
        <div className="mv-map">
          <RentMap
            ds={ds}
            stats={stats}
            pass={pass}
            selected={selected}
            onSelect={setSelected}
            basis={basis}
            onMode={setBlockView}
            fitTo={lstat?.buildings ?? null}
          />
          {(lstat || like !== null) && (
            <div className="mv-bars">
              {lstat && landlord !== null && (
                <LandlordBar
                  name={ds.landlords[landlord]}
                  st={lstat}
                  basis={basis}
                  premium={ds.buildings[lstat.buildings[0]]?.owner >= 0 ? ds.owners.premium[ds.buildings[lstat.buildings[0]].owner] : null}
                  onClear={() => setLandlord(null)}
                />
              )}
              {like !== null && <LikeBar b={ds.buildings[like]} n={nLike} onClear={() => setLike(null)} />}
            </div>
          )}
          {!open && <Legend blocks={blockView} basis={basis} onBasis={setBasis} />}
        </div>
        {selected !== null && (
          <div className="mv-panel">
            <MapPanel
              ds={ds}
              b={ds.buildings[selected]}
              st={stats[selected]}
              basis={basis}
              landlord={landlord}
              onLandlord={setLandlord}
              like={like}
              onLike={setLike}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
        {open && (
          <div className="mv-sheet" role="dialog" aria-label={strings.map.filter.aria}>
            <div className="mv-sheet-head">
              <span>{strings.map.filter.title}</span>
              <div>
                {nActive > 0 && (
                  <button
                    className="mv-reset"
                    onClick={() => {
                      setFilters(defaultFilters());
                      setLandlordState(null);
                      setLikeState(null);
                    }}
                  >
                    {strings.map.filter.reset}
                  </button>
                )}
                <button className="panel-x" onClick={() => setOpen(false)} aria-label={strings.map.filter.close}>
                  ×
                </button>
              </div>
            </div>
            <LandlordPicker ds={ds} value={landlord} onChange={setLandlord} />
            <div className="rf lp">
              <div className="rf-head">
                <span className="rf-label">{strings.map.like.label}</span>
                <span className={`rf-val${like === null ? " any" : ""}`}>
                  {like === null ? strings.map.filter.any : fmt(strings.map.landlord.buildings, { n: nLike })}
                </span>
              </div>
              {like !== null ? (
                <div className="lp-chosen">
                  <span>{ds.buildings[like].address}</span>
                  <button className="panel-x" onClick={() => setLike(null)} aria-label={strings.map.like.clear}>
                    ×
                  </button>
                </div>
              ) : (
                <p className="mv-note like-hint">{strings.map.like.hint}</p>
              )}
            </div>
            {FILTERS.map((f) => (
              <RangeFilter key={f.key} label={f.label} steps={f.steps} show={f.fmt} value={filters[f.key]} onChange={(r) => set(f.key, r)} />
            ))}
            <p className="mv-note">{strings.map.filter.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
