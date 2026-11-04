import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dataset, SearchEntry, Unit } from "../data";
import { money, unitName } from "../format";
import { strings } from "../strings";
import { fmt, rich } from "../text";
const F = strings.finder;
import type { Me } from "../stats";
import { bedKey, bedLabel } from "../stats";
import { searchAddresses } from "../search";
import { useMedia } from "../useMedia";
import type { PickerItem } from "./Picker";
import { Picker } from "./Picker";
import { openMap } from "./MapView";

// on phones the address is typed in a full-screen picker (AddressPicker) instead of an inline dropdown
const PICKER_QUERY = "(max-width: 640px)";

export function Finder({ ds, onGo }: { ds: Dataset; onGo: (me: Me) => void }) {
  const [text, setText] = useState("");
  const [entry, setEntry] = useState<SearchEntry | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [unitIdx, setUnitIdx] = useState<number | "">("");
  const [rentIn, setRentIn] = useState("");
  const [bedsIn, setBedsIn] = useState<number | "">("");
  const [yearIn, setYearIn] = useState<number | "">("");
  const unitRef = useRef<HTMLSelectElement>(null);
  const unitBtnRef = useRef<HTMLButtonElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);
  const [listMax, setListMax] = useState<number | undefined>(undefined);
  const phone = useMedia(PICKER_QUERY);
  const [picking, setPicking] = useState<"address" | "unit" | null>(null);

  // Keep the suggestions inside what's visible above the phone keyboard. If the list ran under the
  // keyboard, Safari scrolls the page as it grows and shrinks with each letter, moving it under your finger.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open || !vv || phone) return;
    const fit = () => {
      const r = addrRef.current?.getBoundingClientRect();
      if (r) setListMax(Math.max(140, vv.offsetTop + vv.height - r.bottom - 22));
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
    };
  }, [open, phone]);

  const hits = useMemo(() => (entry ? [] : searchAddresses(ds, text)), [ds, text, entry]);
  const building = entry ? ds.buildings[entry.b] : null;
  const units = useMemo(() => {
    if (!entry || !building) return [];
    return building.units.filter((u) => entry.ua < 0 || u.ua === entry.ua);
  }, [entry, building]);
  const labels = useMemo(() => {
    if (!building) return [];
    const seen = new Map<string, number>();
    return units.map((u) => {
      const name = unitName(building, u);
      const n = (seen.get(name) ?? 0) + 1;
      seen.set(name, n);
      return n > 1 ? fmt(F.duplicateUnit, { name, n }) : name;
    });
  }, [units, building]);

  const unit = unitIdx === "" ? null : (units.find((u) => u.i === unitIdx) ?? null);
  const needRent = !!unit && !unit.rent;
  const needBeds = !!unit && unit.beds < 0;
  const needYear = !!unit && unit.tenure === null;
  const asofYear = Number(ds.asof.slice(0, 4));
  const rentNum = Number(rentIn.replace(/[^\d.]/g, ""));
  const ready = !!unit && (!needRent || rentNum >= 100) && (!needBeds || bedsIn !== "");

  const searchAddress = useCallback(
    (q: string): PickerItem<SearchEntry>[] =>
      searchAddresses(ds, q, 40).map((e) => ({ key: `${e.b}-${e.ua}`, label: e.text, value: e })),
    [ds],
  );
  const searchUnit = useCallback(
    (q: string): PickerItem<Unit>[] => {
      const t = q.trim().toLowerCase();
      const all = units.map((u, i) => ({ key: String(u.i), label: labels[i], value: u }));
      if (!t) return all;
      // units that start with what was typed come first ("5" → 501, 502 … before 205)
      const starts = all.filter((x) => x.label.toLowerCase().startsWith(t));
      const inside = all.filter((x) => !x.label.toLowerCase().startsWith(t) && x.label.toLowerCase().includes(t));
      return [...starts, ...inside];
    },
    [units, labels],
  );

  function choose(e: SearchEntry) {
    setEntry(e);
    setText(e.text);
    setOpen(false);
    const b = ds.buildings[e.b];
    const us = b.units.filter((u) => e.ua < 0 || u.ua === e.ua);
    setUnitIdx(us.length === 1 ? us[0].i : "");
    setTimeout(() => (phone ? unitBtnRef : unitRef).current?.focus({ preventScroll: true }), 0);
  }

  function go() {
    if (!unit || !building) return;
    const beds = needBeds ? Number(bedsIn) : unit.beds;
    let tenure = unit.tenure;
    if (tenure === null && yearIn !== "") tenure = Math.max(0, asofYear - Number(yearIn) + 0.5);
    onGo({
      building,
      unit,
      beds,
      k: bedKey(beds)!,
      rent: needRent ? rentNum : unit.rent,
      tenure,
      before: unit.before,
    });
  }

  return (
    <section className="finder" id="finder">
      <h2 className="screwed">{rich(F.headline)}</h2>
      <p className="finder-byline">{F.byline}</p>

      <label className="ask" htmlFor="addr">
        {F.addressLabel}
      </label>
      <div className="combo">
        <input
          id="addr"
          ref={addrRef}
          className="big-input"
          placeholder={F.addressPlaceholder}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={!phone && open && hits.length > 0}
          aria-controls="addr-list"
          value={text}
          readOnly={phone}
          onClick={() => phone && setPicking("address")}
          onChange={(e) => {
            setText(e.target.value);
            setEntry(null);
            setUnitIdx("");
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => (phone ? setPicking("address") : setOpen(true))}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!hits.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(hits.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(hits[active]);
            }
          }}
        />
        {!phone && open && hits.length > 0 && (
          <ul className="suggest" id="addr-list" role="listbox" style={{ maxHeight: listMax }}>
            {hits.map((h, i) => (
              <li
                key={`${h.b}-${h.ua}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "on" : ""}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(h);
                }}
                onMouseEnter={() => setActive(i)}
              >
                {h.text}
              </li>
            ))}
          </ul>
        )}
        {!phone && !entry && text.length >= 4 && !hits.length && (
          <p className="hint">{F.notFound}</p>
        )}
      </div>

      <label className="ask" htmlFor="unit">
        {F.unitLabel}
      </label>
      <div className="select-wrap">
        {phone ? (
          // phones: the same full-screen picker as the address
          <button
            id="unit"
            ref={unitBtnRef}
            type="button"
            className="big-input unit-btn"
            disabled={!entry}
            onClick={() => setPicking("unit")}
          >
            {unit ? labels[units.indexOf(unit)] : entry ? F.unitPick : strings.none}
          </button>
        ) : (
          <select
            id="unit"
            ref={unitRef}
            className="big-input"
            disabled={!entry}
            value={unitIdx}
            onChange={(e) => setUnitIdx(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">{entry ? F.unitPick : strings.none}</option>
            {units.map((u, i) => (
              <option key={u.i} value={u.i}>
                {labels[i]}
              </option>
            ))}
          </select>
        )}
      </div>

      {(needRent || needBeds || needYear) && (
        <div className="missing">
          <p>
            {unit?.flagged
              ? fmt(F.missingFlagged, { rent: money(unit.flagged.rent) })
              : needRent
                ? F.missingRent
                : F.missingMoveIn}
          </p>
          {needRent && (
            <input
              className="mid-input"
              inputMode="numeric"
              placeholder={F.rentPlaceholder}
              value={rentIn}
              onChange={(e) => setRentIn(e.target.value)}
            />
          )}
          {needBeds && (
            <select className="mid-input" value={bedsIn} onChange={(e) => setBedsIn(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="">{F.bedroomsPlaceholder}</option>
              {[0, 1, 2, 3, 4].map((k) => (
                <option key={k} value={k}>
                  {bedLabel(k)}
                </option>
              ))}
            </select>
          )}
          {needYear && (
            <select className="mid-input" value={yearIn} onChange={(e) => setYearIn(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="">{F.yearPlaceholder}</option>
              {Array.from({ length: 50 }, (_, i) => asofYear - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <button className="go" disabled={!ready} onClick={go}>
        {F.go} <span aria-hidden>→</span>
      </button>

      <a
        className="map-link"
        href="#map"
        onClick={(e) => {
          e.preventDefault();
          openMap();
        }}
      >
        {F.mapLink} <span aria-hidden>→</span>
      </a>
      <a className="report-error" href={strings.links.reportError} target="_blank" rel="noopener noreferrer">
        {F.reportError}
      </a>
      {picking === "address" && (
        <Picker
          aria={F.addressPickerAria}
          placeholder={F.addressPlaceholder}
          initial={text}
          search={searchAddress}
          note={(q, n) =>
            q.trim().length < 2 ? F.addressPickerHint : n === 0 && q.trim().length >= 4 ? F.notFound : null
          }
          onPick={(item) => {
            setPicking(null);
            choose(item.value);
          }}
          onClose={() => setPicking(null)}
        />
      )}
      {picking === "unit" && (
        <Picker
          aria={F.unitPickerAria}
          placeholder={F.unitPickerPlaceholder}
          initial=""
          search={searchUnit}
          note={(_, n) => (n === 0 ? F.unitPickerNone : null)}
          selectedKey={unitIdx === "" ? undefined : String(unitIdx)}
          onPick={(item) => {
            setPicking(null);
            setUnitIdx(item.value.i);
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </section>
  );
}
