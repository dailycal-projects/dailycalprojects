import { useMemo, useState } from "react";
import type { Building } from "../data";
import { money, tenureText, unitName } from "../format";
import { strings } from "../strings";
import { bedsLabel } from "../stats";
import { fmt } from "../text";

// made once: building a collator costs more than sorting a building's units with it
let shared: Intl.Collator | null = null;
function collator() {
  return (shared ??= new Intl.Collator("en", { numeric: true, sensitivity: "base" }));
}

/** Every unit in a building, alphabetical, filtered by bedroom tab: one tab per bedroom count the building has. */
export function UnitList({
  building,
  highlight,
  initialBeds,
  showTenure = false,
}: {
  building: Building;
  highlight?: number;
  initialBeds?: number; // open on this bedroom count's tab, if the building has it
  showTenure?: boolean;
}) {
  const tabs = useMemo(
    () => [...new Set(building.units.filter((u) => u.beds >= 0).map((u) => u.beds))].sort((a, b) => a - b),
    [building],
  );
  const [beds, setBeds] = useState(() => (initialBeds !== undefined && tabs.includes(initialBeds) ? initialBeds : tabs[0]));
  const units = useMemo(() => {
    const c = collator();
    return building.units
      .filter((u) => u.beds === beds)
      .sort((a, b) => c.compare(unitName(building, a), unitName(building, b)));
  }, [building, beds]);

  return (
    <div className="unitlist" data-nonav>
      <div className="tabs" role="tablist">
        {tabs.map((k) => (
          <button key={k} role="tab" aria-selected={beds === k} className={beds === k ? "tab on" : "tab"} onClick={() => setBeds(k)}>
            {bedsLabel(k)}
          </button>
        ))}
      </div>
      <ul>
        {units.map((u) => (
          <li key={u.i} className={u.i === highlight ? "row me" : "row"}>
            <span className="row-name">
              {fmt(u.label ? strings.unitList.rowNamed : strings.unitList.rowUnnamed, {
                name: unitName(building, u),
                beds: u.beds === 0 ? strings.bedrooms.studio : fmt(strings.bedrooms.bed, { n: u.beds }),
              })}
              {u.i === highlight && <span className="you-chip">{strings.you}</span>}
              {showTenure && u.rented && <span className="row-ten">{tenureText(u)}</span>}
            </span>
            <span className="row-rent">{u.rent ? money(u.rent) : strings.none}</span>
          </li>
        ))}
        {!units.length && <li className="row empty">{strings.unitList.empty}</li>}
      </ul>
    </div>
  );
}
