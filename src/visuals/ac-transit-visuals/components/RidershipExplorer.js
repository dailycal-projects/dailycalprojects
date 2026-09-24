"use client";

import { useEffect, useRef, useState } from "react";
import { HourlyChart, SelectionChart, SeriesChart } from "./Charts";
import RidershipSpeedChart from "./RidershipSpeedChart";
import {
  DIVERGING,
  DIVERGING_RG,
  REC_NEVER,
  REC_SMALL,
  SEQ_BLUE,
  SEQ_GOLD,
  SEQ_GREEN,
  SEQ_MAGENTA,
  colorFor,
  commuteDomain,
  COMMUTE_MIN,
  divT,
  seqT,
  commuteHourly,
  commuteODLists,
  commuteRt,
  commuteRtDomain,
  commuteRtTotals,
  commuteRegionLists,
  commuteStats,
  corridorColor,
  corridorDomain,
  corridorLatLngs,
  corridorStats,
  corridorService,
  commuteOdLookahead,
  createPrefetcher,
  displaySnapshot,
  ensureData,
  eraForWeek,
  eraLookahead,
  escapeHtml,
  fmt,
  formatHeadway,
  formatMph,
  HEADWAY_BREAKS,
  HEADWAY_COLORS,
  headwayColor,
  isServiceView,
  NO_SERVICE,
  periodHours,
  routeService,
  serviceLookahead,
  serviceSnapshot,
  SPEED_BREAKS,
  SPEED_COLORS,
  speedColor,
  imputedAt,
  incomeAt,
  incomeDomain,
  isPending,
  lodesArrivals,
  lodesAt,
  lodesYearFor,
  loadCommuteOD,
  loadVisualizationData,
  nodeFlow,
  ramp,
  rawAt,
  regionSpeed,
  routeBoardingsSeries,
  routeOwnSeries,
  routeStreetBoardingsSeries,
  routesFor,
  sectionLoad,
  selectionSeries,
  totalAt,
} from "./ridership-data";
import { T, t } from "../lib/i18n";
import { ViewLink } from "../lib/host";

// Optional CARTO basemap key. Unset (the default) falls back to the
// plain OSM tile server, which needs no credential.
const CARTO_KEY = process.env.GATSBY_CARTO_KEY || "";
const BASE_ZOOM = 12;
const MAX_DOT_R = 13;
// Stop groups are clustered at 100 m and sit roughly 200 m apart along a
// route. At zoom 14 that is ~26 px between them, so dots up to 6 px across
// read as separate points on a line; at 13 it is ~13 px and they merge into a
// dotted smear, which is what the whole network looked like at 12.
const NODE_MIN_ZOOM = 14;
// Beyond this the tooltip is taller than the map is useful; the click menu
// lists every line without truncation.
const ROUTE_LIST_MAX = 10;

function discloseHtml(real, imp) {
  return `${fmt(real + imp)} <span class="gold">(${fmt(imp)})</span>`;
}

function DisclosureValue({ real, imp }) {
  return (
    <>
      {fmt(real + imp)} <span className="gold">({fmt(imp)})</span>
    </>
  );
}

function Row({ label, children }) {
  return (
    <div className="row">
      <span className="k">{label}</span>
      <span>{children}</span>
    </div>
  );
}

function StatRows({ data, level, keyIndex, week }) {
  const boardReal = rawAt(data, level, keyIndex, week, 0);
  const boardImp = rawAt(data, level, keyIndex, week, 1);
  const alightReal = rawAt(data, level, keyIndex, week, 2);
  const alightImp = rawAt(data, level, keyIndex, week, 3);
  const total = boardReal + boardImp + alightReal + alightImp;
  const imputed = boardImp + alightImp;
  const baseline = totalAt(data, level, keyIndex, data.BASE);
  return (
    <>
      <Row label={t("explorer.rowBoardings")}>
        <DisclosureValue real={boardReal} imp={boardImp} />
      </Row>
      <Row label={t("explorer.rowDropOffs")}>
        <DisclosureValue real={alightReal} imp={alightImp} />
      </Row>
      <Row label={t("explorer.rowRidership")}>
        <DisclosureValue real={boardReal + alightReal} imp={imputed} />
      </Row>
      <Row label={t("explorer.rowImputed")}>
        {total > 0
          ? t("numbers.percentFlat", { n: (100 * imputed / total).toFixed(1) })
          : t("units.noValue")}
      </Row>
      <Row label={t("explorer.rowVsBaseline")}>
        {baseline > 0
          ? t("numbers.percentFlat", { n: (100 * total / baseline).toFixed(0) })
          : t("units.noValue")}
      </Row>
    </>
  );
}

function CommuteCellRows({ data, level, keyIndex, periodIdx, cells }) {
  if (!data.commute) return null;
  const usable = cells.filter((cell) => !cellIsTractOnly(cell) || level === "tract");
  if (!usable.length) return null;
  const ratio = commuteCellRatio(data, level, keyIndex, periodIdx, usable);
  return (
    <>
      <h4>{t("explorer.commutersHeading",
        { label: data.commute.meta.periods[periodIdx].label })}</h4>
      <div style={{ marginBottom: 6 }}>
        {usable.map((cell) => {
          const value = cellValue(data, level, keyIndex, periodIdx, cell);
          return (
            <Row key={cell} label={t(COMMUTE_CELLS[cell].label)}>
              {value === null ? t("units.noValue") : fmt(value)}
            </Row>
          );
        })}
        {Number.isFinite(ratio) ? (
          <Row label={t("explorer.rowAcShare")}>
            {t("numbers.percentFlat", { n: (100 * ratio).toFixed(1) })}
          </Row>
        ) : null}
      </div>
    </>
  );
}

/* The detail panel's default tab: the place's weekly ridership across the
   whole record, and when it first held each share of Feb 2020. */
function RidershipOverTime({ data, series, recoveryTable }) {
  const { meta } = data;
  return (
    <>
      <h4>{t("explorer.headingWeekly")}</h4>
      <SeriesChart series={series} meta={meta} />
      <h4>{t("explorer.headingRecovery")}</h4>
      {meta.recovery_thresholds.map((threshold, index) => {
        const month = recoveryTable[index];
        return (
          <div className="rec-row" key={threshold}>
            <span className="k">
              {t("explorer.recoveryThreshold", { pct: (threshold * 100).toFixed(0) })}
            </span>
            <span className={month < 0 ? "never" : undefined}>
              {month === -2 ? t("explorer.recoveryTooSmall")
                : month === -1 ? t("explorer.recoveryNotYet") : meta.months[month]}
            </span>
          </div>
        );
      })}
    </>
  );
}

function AreaDetail({ data, detail, week, onRouteClick, commute, periodIdx, commuteCells }) {
  const { meta } = data;
  const { lv: level, key: keyIndex } = detail;
  const group = meta.stop_groups;
  const routes = routesFor(data, level, keyIndex, week);
  const recoveryTable = meta.recovery[level === "group" ? "stopgroup" : level]?.[keyIndex] || [];
  const label = detail.label;
  const series = selectionSeries(data, [keyIndex], level);
  const members = level === "group" ? group.members[keyIndex] || [] : [];
  // The weekday pattern only exists where the commute pack saw riders, so the
  // tabs appear only then; otherwise the panel is ridership over time alone.
  const [tab, setTab] = useState("time");
  const stats = commute ? commuteStats(commute, level, keyIndex, periodIdx) : null;
  const hasPattern = !!stats && stats.total > 0;
  const showing = hasPattern ? tab : "time";

  return (
    <>
      <div style={{ marginBottom: 6 }}>
        <StatRows data={data} level={level} keyIndex={keyIndex} week={week} />
      </div>
      <CommuteCellRows
        data={data}
        level={level}
        keyIndex={keyIndex}
        periodIdx={periodIdx}
        cells={commuteCells}
      />
      {hasPattern ? (
        <div className="seg detail-tabs">
          {[["time", "explorer.tabOverTime"], ["weekday", "explorer.tabWeekdayPattern"]].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`segbtn${showing === value ? " on" : ""}`}
              aria-pressed={showing === value}
              onClick={() => setTab(value)}
            >
              {t(label)}
            </button>
          ))}
        </div>
      ) : null}
      {showing === "weekday" ? (
        <CommutePanel
          data={data}
          commute={commute}
          level={level}
          keyIndex={keyIndex}
          p={periodIdx}
        />
      ) : (
        <RidershipOverTime data={data} series={series} recoveryTable={recoveryTable} />
      )}
      <h4>{t("explorer.headingRoutes")}</h4>
      {routes.length ? (
        <div className="chips">
          {routes.map((route) => (
            <button className="chip" type="button" key={route} onClick={() => onRouteClick(route)}>
              {route}
            </button>
          ))}
        </div>
      ) : (
        <p className="hint">{t("explorer.noRouteGeometry")}</p>
      )}
      {level === "group" ? (
        <>
          <h4>{t(members.length === 1 ? "explorer.headingStopsOne" : "explorer.headingStopsMany",
            { n: members.length })}</h4>
          <div className="stoplist">
            {members.map(([id, name]) => (
              <div key={`${id}-${name}`}>
                {name} <span style={{ opacity: 0.55 }}>#{id}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function getCachedRouteLoad(data, route) {
  if (!data.routeSeriesCache) data.routeSeriesCache = {};
  // A route's series spans every era; until they are all loaded it is
  // partial, so it is recomputed rather than cached.
  const complete = Object.keys(data.corridors).length === Object.keys(data.meta.sections).length;
  if (!complete) return routeOwnSeries(data, route);
  if (!data.routeSeriesCache[route]) {
    data.routeSeriesCache[route] = routeOwnSeries(data, route);
  }
  return data.routeSeriesCache[route];
}

function getCachedRouteBoardings(data, route) {
  if (!data.routeBoardingsCache) data.routeBoardingsCache = {};
  const complete = Object.keys(data.corridors).length === Object.keys(data.meta.sections).length;
  if (!complete) {
    return {
      own: routeBoardingsSeries(data, route),
      street: routeStreetBoardingsSeries(data, route),
    };
  }
  if (!data.routeBoardingsCache[route]) {
    data.routeBoardingsCache[route] = {
      own: routeBoardingsSeries(data, route),
      street: routeStreetBoardingsSeries(data, route),
    };
  }
  return data.routeBoardingsCache[route];
}

function RouteDetail({ data, route, week, routeMode, onModeChange, commute, periodIdx }) {
  const { meta } = data;
  const ownLoad = getCachedRouteLoad(data, route);
  const cached = getCachedRouteBoardings(data, route);
  const ownBoardings = cached.own;
  const streetBoardings = cached.street;
  const series = routeMode === "own" ? ownBoardings : streetBoardings;
  const current = series.real[week] + series.imp[week];
  const ownCurrent = ownBoardings.real[week] + ownBoardings.imp[week];
  const ownLoadCurrent = ownLoad.real[week] + ownLoad.imp[week];
  const streetCurrent = streetBoardings.real[week] + streetBoardings.imp[week];
  const isScheduleOnly = (meta.sched_only_routes || []).includes(route);

  return (
    <>
      <div className="seg">
        <button
          className={`segbtn${routeMode === "own" ? " on" : ""}`}
          type="button"
          onClick={() => onModeChange("own")}
        >
          {t("explorer.modeOwn")}
        </button>
        <button
          className={`segbtn${routeMode === "street" ? " on" : ""}`}
          type="button"
          onClick={() => onModeChange("street")}
        >
          {t("explorer.modeStreet")}
        </button>
      </div>
      <div style={{ marginBottom: 6 }}>
        <Row label={t("explorer.rowBoardingsWeekOf", { week: meta.weeks[week] })}>
          <DisclosureValue real={series.real[week]} imp={series.imp[week]} />
        </Row>
        <Row label={t("explorer.rowImputed")}>
          {current > 0
            ? t("numbers.percentFlat", { n: (100 * series.imp[week] / current).toFixed(1) })
            : t("units.noValue")}
        </Row>
        <Row label={t("explorer.rowShareOfStreet")}>
          {streetCurrent > 0
            ? t("numbers.percentFlat", { n: (100 * ownCurrent / streetCurrent).toFixed(0) })
            : t("units.noValue")}
        </Row>
        <Row label={t("explorer.rowSectionsPerRider")}>
          {ownCurrent > 0 && !isScheduleOnly
            ? (ownLoadCurrent / ownCurrent).toFixed(1)
            : t("units.noValue")}
        </Row>
      </div>
      <RouteServiceTable data={data} route={route} week={week} />
      <h4>
        {t(routeMode === "own"
          ? "explorer.headingRouteWeeklyOwn" : "explorer.headingRouteWeeklyStreet")}
      </h4>
      <SeriesChart series={series} meta={meta} />
      <CommutePanel
        data={data}
        commute={commute}
        level="route"
        keyIndex={data.routeNameIx.get(route)}
        p={periodIdx}
      />
      {isScheduleOnly ? (
        <p className="hint schedule-warning">
          <T id="explorer.scheduleWarning" c={[<b />]} />
        </p>
      ) : null}
    </>
  );
}

/* Observed headway, trips and speed for each service period, from the bus
   counters in the snapshot month the time bar sits in. */
function RouteServiceTable({ data, route, week }) {
  const snap = displaySnapshot(data, week);
  const service = snap?.routes ? routeService(snap, route) : null;
  if (!service) return null;
  return (
    <>
      <h4>{t("explorer.headingService", { label: snap.label })}</h4>
      <table className="service-table">
        <thead>
          <tr><th /><th>{t("explorer.colHeadway")}</th>
            <th>{t("explorer.colTrips")}</th><th>{t("explorer.colSpeed")}</th></tr>
        </thead>
        <tbody>
          {snap.periods.map((period, index, snapPeriods) => (
            <tr key={period.id} title={periodHours(period, snapPeriods)}>
              <td className="k">{period.label}</td>
              <td>{period.windows.length
                ? formatHeadway(service.headway[index]) : t("units.noValue")}</td>
              <td>{period.windows.length ? fmt(service.trips[index]) : t("units.noValue")}</td>
              <td>{period.windows.length ? formatMph(service.mph[index]) : t("units.noValue")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function DetailPanel({ data, detail, week, routeMode, onRouteClick, onModeChange, onClose, commute, periodIdx, commuteCells }) {
  return (
    <aside id="detailPanel">
      <div className="cp-head">
        <span id="dTitle">
          {detail.lv === "route" ? t("explorer.routeTitle", { id: detail.key }) : detail.label}
        </span>
        <button className="btn small ghost" type="button"
          onClick={onClose}>
          {t("explorer.closeMark")}
        </button>
      </div>
      {detail.lv === "route" ? (
        <RouteDetail
          data={data}
          route={detail.key}
          week={week}
          routeMode={routeMode}
          onModeChange={onModeChange}
          commute={commute}
          periodIdx={periodIdx}
        />
      ) : (
        <AreaDetail
          data={data}
          detail={detail}
          week={week}
          onRouteClick={onRouteClick}
          commute={commute}
          periodIdx={periodIdx}
          commuteCells={commuteCells}
        />
      )}
    </aside>
  );
}

function ServiceLegend({ data, view, servicePeriod, week }) {
  const snap = displaySnapshot(data, week);
  if (!snap) return <p className="hint">{t("explorer.noSnapshot")}</p>;
  const los = view === "los";
  const breaks = los ? HEADWAY_BREAKS : SPEED_BREAKS;
  const colors = los ? HEADWAY_COLORS : SPEED_COLORS;
  const unit = los ? t("units.minutesShort") : t("units.mphShort");
  return (
    <>
      {breaks.map((limit, index) => {
        const lower = index === 0 ? null : breaks[index - 1];
        const label = lower === null
          ? t("explorer.legendUnder", { limit, unit })
          : limit === Infinity
            ? t("explorer.legendOver", { lower, unit })
            : t("explorer.legendBetween", { lower, limit, unit });
        return (
          <div className="legend-swatch" key={limit}>
            <span style={{ background: colors[index] }} />
            <span>{label}</span>
          </div>
        );
      })}
      {los ? (
        <div className="legend-swatch"><span style={{ background: NO_SERVICE }} /><span>{t("explorer.legendNoTrips")}</span></div>
      ) : null}
    </>
  );
}

function Legend({ data, view, level, recThresh, commute, commuteCells, period, commuteFocus, commuteFocusMode, focusMax, servicePeriod, week }) {
  if (!data) return null;
  const { meta } = data;
  const bar = (colors) => (
    <div className="legend-bar">
      {colors.map((color) => <span key={color} style={{ background: color }} />)}
    </div>
  );
  const labels = (left, right) => (
    <div className="legend-labels"><span>{left}</span><span>{right}</span></div>
  );

  if (isServiceView(view)) {
    return <ServiceLegend data={data} view={view} servicePeriod={servicePeriod} week={week} />;
  }
  if (level !== "none" && !data.store[level]) {
    return <p className="hint">{t("explorer.loadingLevel")}</p>;
  }
  if (level === "none") return null;
  if (view === "income") {
    const [lo, hi] = incomeDomain(data);
    return (
      <>
        {bar(SEQ_MAGENTA)}
        {labels(
          t("explorer.legendIncomeLow", { lo: Math.round(lo / 1000) }),
          t("explorer.legendIncomeHigh", { hi: Math.round(hi / 1000) }),
        )}
      </>
    );
  }
  if (view === "commute") {
    if (!commute) return null;
    if (commuteFocus) {
      return (
        <>
          {bar(SEQ_GREEN)}
          {labels(
            t("explorer.legendNoFlow"),
            t("explorer.legendRidersWkday", { n: fmt(focusMax) }),
          )}
        </>
      );
    }
    const single = commuteCells.length === 1;
    const missing = commuteCells.filter(
      (cell) => cellIsTractOnly(cell) && (level !== "tract" || !data.lodes),
    );
    if (missing.length) return null;
    if (single) {
      const cell = commuteCells[0];
      return (
        <>
          {bar(SEQ_MAGENTA)}
          {labels("0", t("explorer.legendPlus", {
            pct: fmt(cellDomain(data, level, data.commute.meta.periods.indexOf(period), cell)) }))}
        </>
      );
    }
    const median = compareMedian(data, level, data.commute.meta.periods.indexOf(period));
    const percent = (value) =>
    t("numbers.percentFlat", { n: (100 * value).toFixed(value < 0.01 ? 2 : 1) });
    return (
      <>
        {bar(DIVERGING)}
        <div className="legend-labels">
          <span>{t("explorer.legendOrLess", { pct: percent(median / 4) })}</span>
          <span>{percent(median)}</span>
          <span>{t("explorer.legendPlus", { pct: percent(median * 4) })}</span>
        </div>
      </>
    );
  }
  if (view === "total") {
    return (
      <>
        {bar(SEQ_BLUE)}
        {labels("0", t("explorer.legendPerWeek", { n: fmt(data.domains[level]) }))}
      </>
    );
  }
  if (view === "imp") {
    return (
      <>
        {bar(SEQ_GOLD)}
        {labels("0%", t("explorer.legendImputedHigh"))}
      </>
    );
  }
  if (view === "recovery") {
    const low = meta.recovery_baseline_month + 2;
    return (
      <>
        {bar(SEQ_BLUE)}
        {labels(meta.months[low], meta.months[meta.months.length - 1])}
        <div className="legend-swatch"><span style={{ background: REC_NEVER }} /><span>{t("explorer.legendNeverSustained")}</span></div>
        <div className="legend-swatch"><span style={{ background: REC_SMALL }} /><span>{t("explorer.legendBaselineTooSmall")}</span></div>
      </>
    );
  }
  return (
    <>
      {bar(DIVERGING_RG)}
      {labels("0%", "200%")}
    </>
  );
}

function RouteSearch({ data, week, onPick }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const routes = Object.keys(data.routeSections).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const normalized = query.trim().toLowerCase();
  const hits = (normalized
    ? routes.filter((route) => route.toLowerCase().startsWith(normalized))
      .concat(routes.filter((route) => !route.toLowerCase().startsWith(normalized) && route.toLowerCase().includes(normalized)))
    : routes).slice(0, 40);
  const era = eraForWeek(data, week);
  const pick = (route) => {
    setOpen(false);
    setCursor(-1);
    setQuery("");
    onPick(route);
  };

  return (
    <div id="routeSearch">
      <input
        id="rsInput"
        type="search"
        value={query}
        placeholder={t("explorer.searchPlaceholder")}
        autoComplete="off"
        spellCheck="false"
        onChange={(event) => { setQuery(event.target.value); setCursor(-1); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            event.currentTarget.blur();
          } else if (hits.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
            setCursor((current) => (current + (event.key === "ArrowDown" ? 1 : hits.length - 1)) % hits.length);
          } else if (hits.length && event.key === "Enter") {
            event.preventDefault();
            pick(hits[cursor >= 0 ? cursor : 0]);
          }
        }}
      />
      {open && hits.length ? (
        <ul id="rsList">
          {hits.map((route, index) => {
            const running = ((data.routeSections[route] || {})[era] || []).length > 0;
            return (
              <li
                className={index === cursor ? "on" : undefined}
                key={route}
                onMouseDown={(event) => { event.preventDefault(); pick(route); }}
              >
                <span>{route}</span>
                {running ? null : <span className="sub">{t("explorer.searchNotRunning")}</span>}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function SelectionPanel({ data, selection, week, canvasRef, onClear }) {
  const [tab, setTab] = useState(data.speed ? "speed" : "riders");
  const series = selectionSeries(data, selection.keys);
  const speed = regionSpeed(data, selection.bounds);
  const exportPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `ac-transit-recovery-${data.meta.weeks[week]}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };
  return (
    <div id="chartPanel">
      <div className="cp-head">
        <span id="cpTitle">{t("explorer.selectionCount", {
          n: selection.keys.length, s: selection.keys.length === 1 ? "" : "s" })}</span>
        <span className="cp-actions">
          {tab === "riders" ? <button className="btn small" type="button" onClick={exportPng}>
            {t("explorer.exportPng")}</button> : null}
          <button className="btn small ghost" type="button"
            onClick={onClear}>{t("explorer.closeMark")}</button>
        </span>
      </div>
      {data.speed && selection.bounds ? (
        <div className="seg">
          {[["speed", "explorer.tabSpeed"], ["riders", "explorer.tabRiders"]].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`segbtn${tab === value ? " on" : ""}`}
              onClick={() => setTab(value)}
            >
              {t(label)}
            </button>
          ))}
        </div>
      ) : null}
      {tab === "speed" && selection.bounds ? (
        <>
          <p className="rs-stat">
            {t("explorer.speedStatLabel")}{" "}
            <b>{speed?.average
              ? t("units.mph", { n: speed.average.toFixed(1) })
              : t(speed ? "explorer.speedNoData" : "explorer.speedLoading")}</b>
          </p>
          <RidershipSpeedChart
            series={series}
            speed={speed}
            meta={data.meta}
          />
        </>
      ) : (
        <SelectionChart series={series} meta={data.meta} canvasRef={canvasRef} />
      )}
    </div>
  );
}

function incomeRowHtml(data, level, keyIndex) {
  const income = incomeAt(data, level, keyIndex);
  const label = t(level === "group"
    ? "explorer.tipMedianIncomeBg" : "explorer.tipMedianIncome");
  if (!income) {
    return `<div class="row"><span class="k">${escapeHtml(label)}</span>`
      + `<span>${escapeHtml(t("explorer.tipNotPublished"))}</span></div>`;
  }
  const value = income.topCoded
    ? t("explorer.tipIncomeTopCoded")
    : `$${Math.round(income.med).toLocaleString()}`;
  return `<div class="row"><span class="k">${escapeHtml(label)}</span>`
    + `<span>${escapeHtml(value)}</span></div>`;
}

function statHtml(data, level, keyIndex, week) {
  const boardReal = rawAt(data, level, keyIndex, week, 0);
  const boardImp = rawAt(data, level, keyIndex, week, 1);
  const alightReal = rawAt(data, level, keyIndex, week, 2);
  const alightImp = rawAt(data, level, keyIndex, week, 3);
  const total = boardReal + boardImp + alightReal + alightImp;
  const imputed = boardImp + alightImp;
  const baseline = totalAt(data, level, keyIndex, data.BASE);
  const row = (key, value) =>
    `<div class="row"><span class="k">${escapeHtml(t(key))}</span><span>${value}</span></div>`;
  const pct = (value, digits) => (value === null
    ? escapeHtml(t("units.noValue"))
    : escapeHtml(t("numbers.percentFlat", { n: value.toFixed(digits) })));
  return row("explorer.rowBoardings", discloseHtml(boardReal, boardImp))
    + row("explorer.rowDropOffs", discloseHtml(alightReal, alightImp))
    + row("explorer.rowRidership", discloseHtml(boardReal + alightReal, imputed))
    + row("explorer.rowImputed", pct(total > 0 ? 100 * imputed / total : null, 1))
    + row("explorer.rowVsBaseline", pct(baseline > 0 ? 100 * total / baseline : null, 0))
    + incomeRowHtml(data, level, keyIndex);
}

function groupTipHtml(data, keyIndex, week) {
  const group = data.meta.stop_groups;
  return `<div style="font-size:12px"><b>${escapeHtml(group.name[keyIndex])}</b>
    <span style="opacity:.65">${escapeHtml(t(
      group.n_stops[keyIndex] > 1 ? "explorer.tipStopsMany" : "explorer.tipStopsOne",
      { n: group.n_stops[keyIndex] },
    ))}</span>
    <div style="margin-top:4px">${statHtml(data, "group", keyIndex, week)}</div></div>`;
}

function areaTipHtml(data, level, keyIndex, props, week) {
  const name = props.name || props.geoid;
  return `<div style="font-size:12px"><b>${escapeHtml(name)}</b>
    <div style="margin-top:4px">${statHtml(data, level, keyIndex, week)}</div></div>`;
}

function areaStyle(state, level, index) {
  let color = null;
  let edge = { color: "#fcfcfb", weight: 0.7 };
  const focus = state.view === "commute" ? state.commuteFocus : null;
  if (index !== undefined) {
    if (state.view === "commute" && state.commute) {
      if (focus && focus.lists) {
        const flow = state.commuteFocusMap.get(index);
        if (flow) color = ramp(SEQ_GREEN, Math.sqrt(flow / state.commuteFocusMax));
        if (index === focus.key) edge = { color: "#0d5732", weight: 2 };
        else if (state.commuteFocusMembers?.has(index)) {
          edge = { color: "#419c62", weight: 1.5 };
        }
      } else {
        color = commuteValue(
          state.data,
          level,
          index,
          state.commuteCells,
          state.commutePeriodIdx,
        ).color;
      }
    } else {
      color = colorFor(state.data, level, index, state.week, state.view, state.recThresh);
    }
  }
  return {
    fillColor: color || "#e8e7e2",
    fillOpacity: color ? 0.68 : 0.15,
    ...edge,
  };
}

function renderDataLayer(api, data, options) {
  const { L, dataLayer } = api;
  const { week, view, level, recThresh } = options;
  api.renderState = options;

  if (level === "none") {
    if (api.dataMode !== "none") {
      dataLayer.clearLayers();
      api.dataMode = "none";
    }
    return;
  }

  const commute = view === "commute" ? options.commute : null;
  const focus = view === "commute" ? options.commuteFocus : null;
  let focusMap = null;
  let focusMax = 1;
  if (focus && focus.lists) {
    const entries = options.commuteFocusMode === "from" ? focus.lists.out : focus.lists.in;
    focusMap = new Map(entries.map((entry) => [entry.g, entry.flow]));
    focusMax = entries.length ? entries[0].flow : 1;
  }
  // areaStyle reads these off the render state; options IS api.renderState.
  options.commuteFocusMap = focusMap;
  options.commuteFocusMax = focusMax;
  options.commuteFocusMembers = focus && focus.kind === "region" && focus.lists
    ? focus.lists.memberKeys
    : null;

  if (level === "group") {
    if (!api.groupMarkers) {
      const groups = data.meta.stop_groups;
      api.groupMarkers = [];
      for (let index = 0; index < groups.n; index += 1) {
        const marker = L.circleMarker([groups.lat[index], groups.lon[index]], {
          radius: 1,
          fillColor: "#e8e7e2",
          fillOpacity: 0,
          opacity: 0,
          color: "#fcfcfb",
          weight: 1,
        })
          .bindTooltip(() => (api.renderState.view === "commute" && api.renderState.commute
            ? commuteTipHtml(data, "group", index, groups.name[index], api.renderState.commutePeriodIdx, api.renderState.commuteCells)
            : groupTipHtml(data, index, api.renderState.week)), { sticky: true })
          .on("click", () => api.renderState.callbacks.onMapClick("group", index, groups.name[index]));
        api.groupMarkers.push(marker);
      }
    }
    if (api.dataMode !== "group") {
      dataLayer.clearLayers();
      api.groupMarkers.forEach((marker) => marker.addTo(dataLayer));
      api.dataMode = "group";
    }
    const groups = data.meta.stop_groups;
    const domain = commute ? commuteDomain(commute, "group", options.commutePeriodIdx) : data.domains.group;
    api.groupMarkers.forEach((marker, index) => {
      let value;
      let color;
      let edge = {};
      let sizeDenom = domain;
      if (commute) {
        if (focusMap) {
          // Inferred-riders mode: dot size encodes the inferred flow, not
          // total ridership. The selected place / region members keep their
          // ridership size and are marked by outline instead.
          const isMember = focus.kind === "region"
            ? !!(options.commuteFocusMembers && options.commuteFocusMembers.has(index))
            : index === focus.key;
          if (isMember) {
            const stats = commuteStats(commute, "group", index, options.commutePeriodIdx);
            value = stats ? stats.total : 0;
            edge = focus.kind === "region"
              ? { color: "#419c62", weight: 1.5, opacity: 1 }
              : { color: "#0d5732", weight: 2, opacity: 1 };
          } else {
            const flow = focusMap.get(index) || 0;
            value = flow;
            sizeDenom = focusMax;
            color = flow ? ramp(SEQ_GREEN, Math.sqrt(flow / focusMax)) : null;
          }
        } else {
          const result = commuteValue(data, "group", index, options.commuteCells, options.commutePeriodIdx);
          value = result.value;
          color = result.color;
        }
      } else {
        // Recovery time does not depend on the week, so its dots are sized by
        // Feb 2020 ridership and stay put while the time bar moves.
        value = totalAt(data, "group", index, view === "recovery" ? data.BASE : week);
        color = colorFor(data, "group", index, week, view, recThresh);
      }
      const visible = value > 0 && !!(color || edge.color);
      marker.setRadius(visible ? Math.min(MAX_DOT_R, 2.5 + Math.sqrt(value / sizeDenom) * 11) : 1);
      marker.setStyle({
        fillColor: color || "#e8e7e2",
        fillOpacity: visible ? (color ? 0.82 : 0.35) : 0,
        opacity: visible ? 1 : 0,
        color: "#fcfcfb",
        weight: 1,
        ...edge,
      });
      marker.options.interactive = visible;
    });
    return;
  }

  const source = { tract: "tracts", bgroup: "blockgroups", city: "cities" }[level];
  // Not fetched yet: clear the old level rather than colour this one's
  // shapes with nothing. The layer is drawn once the load triggers a render.
  if (!data.geo[source] || !data.store[level]) {
    if (api.dataMode !== "loading") {
      dataLayer.clearLayers();
      api.dataMode = "loading";
    }
    return;
  }
  if (!api.geoLayers) api.geoLayers = {};
  if (!api.geoIndexes) api.geoIndexes = {};
  if (!api.geoLayers[level]) {
    const ids = level === "tract" ? data.meta.tracts
      : level === "bgroup" ? data.meta.bgroups
        : data.cities.places.map((place) => place.geoid);
    const index = new Map(ids.map((id, index) => [String(id), index]));
    api.geoIndexes[level] = index;
    api.geoLayers[level] = L.geoJSON(data.geo[source], {
      style: (feature) => areaStyle(
        api.renderState,
        level,
        index.get(String(feature.properties?.geoid)),
      ),
      onEachFeature: (feature, layer) => {
        const featureIndex = index.get(String(feature.properties?.geoid));
        if (featureIndex === undefined) return;
        layer
          .bindTooltip(() => (api.renderState.view === "commute" && api.renderState.commute
            ? commuteTipHtml(
              data,
              level,
              featureIndex,
              feature.properties?.name || feature.properties?.geoid,
              api.renderState.commutePeriodIdx,
              api.renderState.commuteCells,
            )
            : areaTipHtml(data, level, featureIndex, feature.properties || {}, api.renderState.week)), { sticky: true })
          .on("click", () => api.renderState.callbacks.onMapClick(
            level,
            featureIndex,
            feature.properties?.name || feature.properties?.geoid,
          ));
      },
    });
  }
  if (api.dataMode !== level) {
    dataLayer.clearLayers();
    api.geoLayers[level].addTo(dataLayer);
    api.dataMode = level;
  }
  const index = api.geoIndexes[level];
  api.geoLayers[level].eachLayer((layer) => {
    const featureIndex = index.get(String(layer.feature?.properties?.geoid));
    layer.setStyle(areaStyle(api.renderState, level, featureIndex));
  });
}

function distanceToSegment(point, first, second) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - first.x, point.y - first.y);
  const t = Math.max(0, Math.min(1, ((point.x - first.x) * dx + (point.y - first.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (first.x + t * dx), point.y - (first.y + t * dy));
}

function pointBounds(points) {
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (const point of points) {
    bounds.minX = Math.min(bounds.minX, point.x);
    bounds.maxX = Math.max(bounds.maxX, point.x);
    bounds.minY = Math.min(bounds.minY, point.y);
    bounds.maxY = Math.max(bounds.maxY, point.y);
  }
  return bounds;
}

function corridorMetrics(data, era, index, week, view, recThresh, servicePeriod) {
  let load = 0;
  let imp = 0;
  for (const sectionId of data.corridors[era][index].s) {
    const [sectionLoadValue, imputedFraction] = sectionLoad(data, era, sectionId, week);
    load += sectionLoadValue;
    imp += sectionLoadValue * imputedFraction;
  }
  if (isServiceView(view)) {
    // Drawn whether or not the APCs saw load here: the schedule is the source.
    const service = corridorService(data, displaySnapshot(data, week), index);
    if (!service) return null;
    const color = view === "los"
      ? headwayColor(service.headway[servicePeriod]) || NO_SERVICE
      : speedColor(service.mph[servicePeriod]);
    if (!color) return null;
    return { load, imp, color, thickness: Math.min(1, Math.sqrt(load / corridorDomain(data))), service: true };
  }
  if (load <= 0 && view !== "recovery" && view !== "rel") return null;
  const color = corridorColor(data, era, index, load, imp, view, recThresh);
  if (!color) return null;
  return { load, imp, color, thickness: Math.min(1, Math.sqrt(load / corridorDomain(data))) };
}

function createRouteCanvasLayer(map, L, getCallbacks, mapWrapRef) {
  const canvas = L.DomUtil.create("canvas", "route-canvas", map.getPane("routeCanvasPane"));
  const hitCellSize = 64;
  let options = null;
  let drawPending = false;
  let hitRecords = [];
  let hitGrid = new Map();
  let projectionCache = null;
  let tooltip = null;
  // A scheduled redraw can fire after map.remove() during a React remount;
  // touching the map then throws (_leaflet_pos gone with the panes).
  let mapRemoved = false;
  map.on("unload", () => { mapRemoved = true; });
  let groupDiscs = [];

  const closeTooltip = () => {
    if (tooltip) {
      map.closeTooltip(tooltip);
      tooltip = null;
    }
  };

  const hitTest = (point) => {
    const hits = [];
    const cellX = Math.floor(point.x / hitCellSize);
    const cellY = Math.floor(point.y / hitCellSize);
    const candidates = new Set();
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (const record of hitGrid.get(`${cellX + dx},${cellY + dy}`) || []) candidates.add(record);
      }
    }
    for (const record of candidates) {
      if (
        point.x < record.minX - record.hitWidth ||
        point.x > record.maxX + record.hitWidth ||
        point.y < record.minY - record.hitWidth ||
        point.y > record.maxY + record.hitWidth
      ) continue;
      for (let index = 1; index < record.points.length; index += 1) {
        if (distanceToSegment(point, record.points[index - 1], record.points[index]) <= record.hitWidth) {
          hits.push(record);
          break;
        }
      }
    }
    return hits;
  };

  const draw = () => {
    drawPending = false;
    if (mapRemoved) {
      canvas.style.display = "none";
      return;
    }
    const features = options?.features;
    const data = options?.data;
    if (!features || !data || !options.visible) {
      canvas.style.display = "none";
      hitRecords = [];
      hitGrid = new Map();
      closeTooltip();
      return;
    }
    canvas.style.display = "block";
    const size = map.getSize();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.x * dpr;
    canvas.height = size.y * dpr;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;
    const origin = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(canvas, origin);
    const zoom = map.getZoom();
    const projectionSource = features;
    if (!projectionCache || projectionCache.source !== projectionSource || projectionCache.zoom !== zoom) {
      projectionCache = { source: projectionSource, zoom, points: new Map() };
    }
    const pixelOrigin = map.getPixelOrigin();
    // Per corridor, projected once per zoom: `anchors` are the Bezier chain's
    // points (start, then control, control, end per segment) for drawing, and
    // `samples` the curve flattened for bounds and hit-testing. A piece with
    // no curve draws its raw polyline.
    const worldShapeFor = (key, feature) => {
      if (!projectionCache.points.has(key)) {
        const project = (lat, lon) => map.project([lat, lon], zoom);
        const b = feature.b;
        const anchors = [];
        if (b) for (let i = 0; i + 1 < b.length; i += 2) anchors.push(project(b[i], b[i + 1]));
        const samples = corridorLatLngs(feature).map(([lat, lon]) => project(lat, lon));
        projectionCache.points.set(key, { anchors: b ? anchors : null, samples });
      }
      return projectionCache.points.get(key);
    };
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size.x, size.y);

    const records = [];
    const selectedRoute = options.selectedRoute;
    features.forEach((feature, index) => {
      if (options.onlySelected && !feature.r.some(
        (routeDirection) => routeDirection.split("|")[0] === selectedRoute,
      )) return;
      const metrics = corridorMetrics(
        data, options.era, index, options.week, options.view, options.recThresh, options.servicePeriod,
      );
      if (!metrics) return;
      const selectedCorridor = selectedRoute && feature.r.some(
        (routeDirection) => routeDirection.split("|")[0] === selectedRoute,
      );
      const shape = worldShapeFor(index, feature);
      const toScreen = (projected) => ({
        x: projected.x - pixelOrigin.x - origin.x,
        y: projected.y - pixelOrigin.y - origin.y,
      });
      const points = shape.samples.map(toScreen);
      const bounds = pointBounds(points);
      if (bounds.maxX < -80 || bounds.minX > size.x + 80 || bounds.maxY < -80 || bounds.minY > size.y + 80) return;
      const routes = [...new Set(feature.r.map((routeDirection) => routeDirection.split("|")[0]))];
      records.push({
        points,
        curve: shape.anchors ? shape.anchors.map(toScreen) : null,
        ...bounds,
        routes,
        route: routes[0],
        load: metrics.load,
        imp: metrics.imp,
        color: metrics.color,
        weight: (selectedCorridor ? 2.5 : 1) + metrics.thickness * (selectedCorridor ? 8 : 7),
        // Service colours are classes, and a faint class reads as the wrong
        // one, so those views draw near-opaque regardless of load.
        opacity: selectedCorridor ? 0.95 : selectedRoute ? 0.07
          : metrics.service ? 0.85 : 0.32 + metrics.thickness * 0.35,
        corridorIndex: index,
        selected: !!selectedCorridor,
      });
    });

    // Draw the selected line last so it remains legible over the stacked network.
    records.sort((first, second) => Number(first.selected) - Number(second.selected));
    for (const record of records) {
      context.beginPath();
      if (record.curve) {
        const [start, ...rest] = record.curve;
        context.moveTo(start.x, start.y);
        for (let i = 0; i + 2 < rest.length; i += 3) {
          context.bezierCurveTo(rest[i].x, rest[i].y, rest[i + 1].x, rest[i + 1].y, rest[i + 2].x, rest[i + 2].y);
        }
      } else {
        record.points.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
      }
      context.strokeStyle = record.color;
      context.globalAlpha = record.opacity;
      context.lineWidth = record.weight;
      // Curved pieces meet end to end on a shared tangent, so flat ends butt
      // together into one continuous line that changes colour and width only
      // at a node. Round ends would overlap there, and at partial opacity
      // every join would draw as a darker bead.
      context.lineCap = record.curve ? "butt" : "round";
      context.lineJoin = "round";
      context.stroke();
      record.hitWidth = Math.max(7, record.weight / 2 + 3);
    }
    context.globalAlpha = 1;

    // Nodes mark where the corridor's answer changes. Only the stop-group ones
    // are drawn: those are where load actually steps, and a dot on every
    // junction where routes merely diverge would bury the network in dots.
    // They are meaningless when zoomed out past the point corridors resolve.
    // Stop groups sit on corridors by definition, so a click anywhere on a
    // bubble used to land on the road underneath it instead. Their discs are
    // projected here, in the same frame as the corridors, so the hit test can
    // stand aside for them without re-projecting 2,987 markers per mousemove.
    groupDiscs = [];
    for (const marker of options.groupMarkers || []) {
      if (!marker.options.interactive) continue;
      const projected = map.project(marker.getLatLng(), zoom);
      groupDiscs.push({
        x: projected.x - pixelOrigin.x - origin.x,
        y: projected.y - pixelOrigin.y - origin.y,
        r: (marker.options.radius || 0) + 1,
      });
    }

    const nodes = options.nodes;
    if (nodes && zoom >= NODE_MIN_ZOOM) {
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        if (node.g < 0) continue;
        const flow = nodeFlow(data, options.era, node, options.week);
        if (!flow || flow.board + flow.alight <= 0) continue;
        const projected = map.project(node.p, zoom);
        const point = {
          x: projected.x - pixelOrigin.x - origin.x,
          y: projected.y - pixelOrigin.y - origin.y,
        };
        if (point.x < -20 || point.x > size.x + 20 || point.y < -20 || point.y > size.y + 20) continue;
        // Sized off the stop-group domain, not the corridor one: this is a
        // boarding count, and the two are orders of magnitude apart. Kept
        // small deliberately -- the node marks a place on the line, and the
        // line is what carries the value.
        const radius = Math.min(6, 1.2 + Math.sqrt((flow.board + flow.alight) / data.domains.group) * 5);
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = "#fcfcfb";
        context.globalAlpha = 0.85;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = "#3d3a33";
        context.globalAlpha = 0.6;
        context.stroke();
        records.push({
          points: [point, point],
          minX: point.x,
          maxX: point.x,
          minY: point.y,
          maxY: point.y,
          hitWidth: Math.max(6, radius + 2),
          node: true,
          tooltipHtml: nodeHoverHtml(flow),
        });
      }
      context.globalAlpha = 1;
    }

    hitRecords = records;
    hitGrid = new Map();
    for (const record of records) {
      const minCellX = Math.floor(record.minX / hitCellSize);
      const maxCellX = Math.floor(record.maxX / hitCellSize);
      const minCellY = Math.floor(record.minY / hitCellSize);
      const maxCellY = Math.floor(record.maxY / hitCellSize);
      for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
        for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
          const key = `${cellX},${cellY}`;
          if (!hitGrid.has(key)) hitGrid.set(key, []);
          hitGrid.get(key).push(record);
        }
      }
    }
  };

  const redraw = () => {
    if (drawPending) return;
    drawPending = true;
    window.requestAnimationFrame(draw);
  };

  // A visible stop group takes the click, and the hover with it -- otherwise
  // the tooltip would offer a line while the click opened a stop group.
  const overGroup = (point) => groupDiscs.some((disc) => {
    const dx = point.x - disc.x;
    const dy = point.y - disc.y;
    return dx * dx + dy * dy <= disc.r * disc.r;
  });

  const eventPoint = (event) => {
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const onMove = (event) => {
    const point = eventPoint(event);
    if (overGroup(point)) {
      closeTooltip();
      return;
    }
    const hits = hitTest(point);
    map.getContainer().style.cursor = hits.length ? "pointer" : "";
    if (!hits.length) {
      closeTooltip();
      return;
    }
    // A corridor under the cursor wins over the area beneath it. Stopping the
    // event here is what makes that true: Leaflet's own renderer listens on
    // the overlay canvas, and at tract level that canvas covers every pixel,
    // so letting the event through would open the tract's tooltip on top of
    // this one everywhere on the map.
    event.stopPropagation();
    const record = hits.find((hit) => hit.node) || hits[0];
    const latLng = map.containerPointToLatLng([
      event.clientX - map.getContainer().getBoundingClientRect().left,
      event.clientY - map.getContainer().getBoundingClientRect().top,
    ]);
    if (!tooltip) tooltip = L.tooltip({ sticky: true });
    const tooltipHtml = record.tooltipHtml || corridorHoverHtml(
      options.data,
      options.era,
      record.corridorIndex,
      record.load,
      record.imp,
      options.view,
      options.recThresh,
      options.servicePeriod,
      options.week,
    );
    tooltip
      .setContent(tooltipHtml)
      .setLatLng(latLng)
      .addTo(map);
  };

  const onClick = (event) => {
    const point = eventPoint(event);
    if (overGroup(point)) return;
    const hits = hitTest(point).filter((hit) => !hit.node);
    if (!hits.length) return;
    event.preventDefault();
    event.stopPropagation();
    const routes = [...new Set(hits.flatMap((record) => record.routes))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const wrapBounds = mapWrapRef.current.getBoundingClientRect();
    getCallbacks().onContext({
      x: Math.max(8, Math.min(event.clientX - wrapBounds.left, wrapBounds.width - 220)),
      y: Math.max(8, Math.min(event.clientY - wrapBounds.top, wrapBounds.height - 420)),
      routes,
    });
  };

  // The listeners go on the map container, in the capture phase, not on the
  // canvas. The corridor pane sits at z-index 350, below Leaflet's overlay
  // pane at 400, so the overlay canvas is the top element over the whole map
  // and the corridor canvas never receives a real mouse event -- which is why
  // corridors had no tooltip and no click menu. Capturing on the container
  // runs the corridor hit test before the overlay canvas sees the event,
  // while leaving the drawing order alone.
  canvas.style.pointerEvents = "none";
  const container = map.getContainer();
  container.addEventListener("mousemove", onMove, true);
  container.addEventListener("mouseleave", closeTooltip, true);
  container.addEventListener("click", onClick, true);
  map.on("move zoom resize", redraw);

  return {
    setOptions(nextOptions) {
      options = nextOptions;
      redraw();
    },
    redraw,
    remove() {
      mapRemoved = true;
      map.off("move zoom resize", redraw);
      container.removeEventListener("mousemove", onMove, true);
      container.removeEventListener("mouseleave", closeTooltip, true);
      container.removeEventListener("click", onClick, true);
      closeTooltip();
      canvas.remove();
    },
  };
}

// The counts are the stop group's, covering every route that stops there --
// which is not necessarily only the routes on the corridor under the cursor.
// So the net is reported as the group's, not as this corridor's load step.
function nodeHoverHtml(flow) {
  const arrow = flow.net >= 0 ? "&#9650;" : "&#9660;";
  const row = (key, value) =>
    `<div class="row"><span class="k">${escapeHtml(t(key))}</span><span>${value}</span></div>`;
  return `<div style="font-size:12px"><div class="row"><span class="k">${flow.name}</span></div>`
    + row("explorer.rowBoardingsWk", discloseHtml(flow.board - flow.boardImp, flow.boardImp))
    + row("explorer.rowDropOffsWk", discloseHtml(flow.alight - flow.alightImp, flow.alightImp))
    + row("explorer.rowNetAtGroup",
      `${arrow} ${Math.abs(Math.round(flow.net)).toLocaleString()}`)
    + "</div>";
}

function corridorHoverHtml(data, era, index, load, imp, view, recThresh, servicePeriod, week) {
  const extraRow = (key, value) =>
    `<div class="row"><span class="k">${escapeHtml(t(key))}</span>`
    + `<span>${escapeHtml(value)}</span></div>`;
  let extra = "";
  const snap = isServiceView(view) ? displaySnapshot(data, week) : null;
  const service = snap ? corridorService(data, snap, index) : null;
  if (service) {
    // Every period, the active one in bold, so a hover answers "how does
    // this street compare at night" without touching the selector.
    extra = snap.periods.map((period, p) => {
      const text = period.windows.length
        ? `${formatHeadway(service.headway[p])} · ${formatMph(service.mph[p])}`
        : t("explorer.tipNoPeak");
      return `<div class="row"><span class="k">${escapeHtml(period.label)}</span><span>${
        p === servicePeriod ? `<b>${text}</b>` : text
      }</span></div>`;
    }).join("");
  }
  const stats = corridorStats(data, era);
  const baseline = stats.base[index];
  if (view === "rel") {
    extra = baseline > 0
      ? extraRow("explorer.rowVsBaseline",
        t("numbers.percentFlat", { n: (100 * load / baseline).toFixed(0) }))
      : "";
  } else if (view === "imp" && load > 0) {
    extra = extraRow("explorer.rowImputed",
      t("numbers.percentFlat", { n: (100 * imp / load).toFixed(1) }));
  } else if (view === "recovery") {
    const month = stats.recovery[index * data.meta.recovery_thresholds.length + recThresh];
    extra = extraRow("explorer.rowRecovered",
      month === -2 ? t("explorer.recoveryTooSmall")
        : month === -1 ? t("explorer.recoveryNotYet") : data.meta.months[month]);
  }
  // Name the lines that make up the corridor, not just its total. A corridor
  // is a union of route-directions sharing a street, so the number above is a
  // sum over all of them; without the list it reads as one route's load.
  // Opposite directions collapse to one name -- they are the same line here,
  // and the click menu opens them the same way.
  const feature = data.corridors[era]?.[index];
  const names = [...new Set((feature?.r || []).map((rd) => rd.split("|")[0]))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const shown = names.slice(0, ROUTE_LIST_MAX).map(escapeHtml).join(", ");
  const rest = names.length - ROUTE_LIST_MAX;
  const routeRow = names.length
    ? `<div class="row"><span class="k">${escapeHtml(names.length === 1
      ? t("explorer.tipLine") : t("explorer.tipLines", { n: names.length }))}</span>
       <span>${shown}${rest > 0 ? escapeHtml(t("explorer.tipLinesMore", { n: rest })) : ""}</span></div>`
    : "";
  return `<div style="font-size:12px">${routeRow}`
    + `<div class="row"><span class="k">${escapeHtml(t("explorer.rowOnboardLoad"))}</span>`
    + `<span>${discloseHtml(load - imp, imp)}</span></div>${extra}`
    + `</div>`;
}

/* ------------------------------------------------------------- commute view */


function peakLabel(hour) {
  if (hour === 12) return "12p";
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

/* ---- the commute grid: two sources x two ends of the commute ----

   Picking one cell maps that measure's concentration; picking both cells of a
   column compares them. Mixing columns is not offered, because bus arrivals
   over resident workers is not a ratio of anything.

   The AC Transit row is net round-trip commuters, not raw morning arrivals: a
   morning arrival on its own cannot tell a commuter from a shopper, a student
   or someone changing to BART. Against LODES workplace-ness the round-trip
   measure scores rho 0.45 where raw arrivals score 0.22, and it holds that
   across 2019/2023/2026 while raw arrivals decay. See round_trip() in
   scripts/build_commute_pack.py. */

// Only the home end is offered: where bus commuters live against where all
// employed residents live. The workplace cells were dropped from the app.
const COMMUTE_CELLS = {
  "ac-home": { label: "explorer.cellAcHome", col: "home", src: "ac" },
  "all-home": { label: "explorer.cellAllHome", col: "home", src: "all" },
};
const COMMUTE_DEFAULT_CELLS = ["ac-home"];
// The three buttons, each a set of cells: one measure alone, or both compared.
const COMMUTE_MODES = [
  ["ac", "explorer.cellAcHome", ["ac-home"]],
  ["all", "explorer.cellAllHome", ["all-home"]],
  ["compare", "explorer.modeCompare", ["ac-home", "all-home"]],
];

// LODES is published per tract and per year, so those two cells exist only at
// tract level; the AC cells work at every area level.
function cellIsTractOnly(cell) {
  return COMMUTE_CELLS[cell].src === "all";
}

export function commuteLocksTractFor(cells) {
  return cells.some(cellIsTractOnly);
}

/* Toggling a cell. Two cells of one column compare; a click in the other
   column starts over rather than building a cross-column pair that has no
   meaning, and the last selected cell cannot be switched off -- the map would
   have nothing to draw. */
export function toggleCommuteCell(cells, cell) {
  if (cells.includes(cell)) {
    return cells.length > 1 ? cells.filter((c) => c !== cell) : cells;
  }
  const col = COMMUTE_CELLS[cell].col;
  const sameCol = cells.filter((c) => COMMUTE_CELLS[c].col === col);
  return sameCol.length === 1 ? orderCells([...sameCol, cell]) : [cell];
}

/* A pair always reads AC Transit first, whichever cell was clicked first, so
   the diverging ramp means one fixed thing: red is more AC Transit than all
   commuters would imply, blue is more non-AC. Click order must never be able
   to flip the map's colours. */
function orderCells(cells) {
  return [...cells].sort(
    (a, b) => (COMMUTE_CELLS[a].src === "ac" ? 0 : 1) - (COMMUTE_CELLS[b].src === "ac" ? 0 : 1),
  );
}

function cellValue(data, level, key, p, cell) {
  const spec = COMMUTE_CELLS[cell];
  if (spec.src === "all") {
    if (level !== "tract" || !data.lodes) return null;
    const field = spec.col === "work" ? "jobs" : "workers";
    return lodesAt(data.lodes, field, lodesYear(data, p), key);
  }
  const rt = commuteRt(data.commute, level, key, p);
  if (rt) return spec.col === "work" ? rt.work : rt.home;
  // Pack built before the round-trip bins existed: fall back to the raw
  // morning marginals so an older bundle still renders the grid.
  const stats = commuteStats(data.commute, level, key, p);
  if (!stats) return null;
  return spec.col === "work" ? stats.amIn : stats.amOut;
}

function cellTotal(data, level, p, cell) {
  const spec = COMMUTE_CELLS[cell];
  if (spec.src === "all") {
    return lodesTotal(data.lodes, spec.col === "work" ? "jobs" : "workers",
      lodesYear(data, p));
  }
  const totals = commuteRtTotals(data.commute, level, p);
  if (totals) return spec.col === "work" ? totals.work : totals.home;
  return lodesArrivals(data.commute, level, p, spec.col).sum;
}

function cellDomain(data, level, p, cell) {
  const spec = COMMUTE_CELLS[cell];
  if (spec.src === "all") {
    return lodesDomain(data.lodes, lodesYear(data, p),
      spec.col === "work" ? "jobs" : "workers");
  }
  if (data.commute.rt) {
    return commuteRtDomain(data.commute, level, p, spec.col);
  }
  return commuteDomain(data.commute, level, p, spec.col === "work" ? "amIn" : "amOut");
}

// Concentration: this place's share of everyone the cell counts.
function cellShare(data, level, key, p, cell) {
  const value = cellValue(data, level, key, p, cell);
  const total = cellTotal(data, level, p, cell);
  return value === null || !(total > 0) ? NaN : value / total;
}

/* Is there enough here to say anything? The AC cells need the shared service
   floor; the LODES cells do not, because an unserved tract still has jobs. */
function cellDrawable(data, level, key, p, cell) {
  if (COMMUTE_CELLS[cell].src === "all") {
    const value = cellValue(data, level, key, p, cell);
    return value !== null && value >= COMMUTE_MIN;
  }
  const stats = commuteStats(data.commute, level, key, p);
  return !!stats && stats.total >= COMMUTE_MIN;
}

/* One cell: that count on the magenta ramp, against the 98th percentile of the
   same measure. Compare: AC Transit commuters divided by all commuters living
   in the tract, on the blue-red diverging ramp centred on the median tract --
   white is the median, red a higher share, blue a lower one -- log2, so either
   end is 4x or 1/4x the median. */
function commuteCellColor(data, level, key, p, cells) {
  if (!cells.every((cell) => cellDrawable(data, level, key, p, cell))) return null;
  if (cells.length === 1) {
    const value = cellValue(data, level, key, p, cells[0]);
    if (value === null) return null;
    return ramp(SEQ_MAGENTA, seqT(value, cellDomain(data, level, p, cells[0])));
  }
  const ratio = commuteCellRatio(data, level, key, p, cells);
  return Number.isFinite(ratio) ? ramp(DIVERGING, divT(ratio / compareMedian(data, level, p))) : null;
}

/* AC Transit commuters per all commuters in one tract: the estimated round-trip
   bus commuters on an average weekday over the LODES employed residents. NaN --
   grey -- when there are no workers to divide by. */
function commuteCellRatio(data, level, key, p, cells) {
  if (cells.length !== 2) return NaN;
  const [ac, all] = orderCells(cells);
  const a = cellValue(data, level, key, p, ac);
  const b = cellValue(data, level, key, p, all);
  return a === null || !(b > 0) ? NaN : a / b;
}

// The median compare ratio over tracts drawn at all, cached per snapshot.
function compareMedian(data, level, p) {
  const cache = data.commute.commuteDomains;
  const cacheKey = `compareMedian|${level}|${p}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const cells = ["ac-home", "all-home"];
  const values = [];
  const n = level === "tract" ? data.meta.tracts.length : 0;
  for (let key = 0; key < n; key += 1) {
    if (!cells.every((cell) => cellDrawable(data, level, key, p, cell))) continue;
    const ratio = commuteCellRatio(data, level, key, p, cells);
    if (ratio > 0) values.push(ratio);
  }
  values.sort((a, b) => a - b);
  cache[cacheKey] = values.length ? values[Math.floor(values.length / 2)] : 1;
  return cache[cacheKey];
}

function commuteValue(data, level, key, cells, p) {
  const stats = commuteStats(data.commute, level, key, p);
  return {
    color: commuteCellColor(data, level, key, p, cells),
    value: stats ? stats.total : 0,
  };
}

/* Memo tables for the LODES ramps, held beside the pack rather than on it so
   the parsed object stays a faithful copy of lodes.json. */
const lodesMemos = new WeakMap();

function lodesMemo(lodes) {
  let memo = lodesMemos.get(lodes);
  if (!memo) {
    memo = { domains: {}, totals: {} };
    lodesMemos.set(lodes, memo);
  }
  return memo;
}

// p98 of the year's counts, the same rule commuteDomain uses.
function lodesDomain(lodes, year, field = "jobs") {
  const { domains } = lodesMemo(lodes);
  const cacheKey = `${field}|${year}`;
  if (!domains[cacheKey]) {
    const values = (lodes[field]?.[year] || []).filter((v) => v >= COMMUTE_MIN);
    values.sort((a, b) => a - b);
    domains[cacheKey] = values.length ? values[Math.floor(values.length * 0.98)] : 1;
  }
  return domains[cacheKey];
}

function lodesTotal(lodes, field, year) {
  const { totals } = lodesMemo(lodes);
  const cacheKey = `${field}|${year}`;
  if (!(cacheKey in totals)) {
    totals[cacheKey] = (lodes[field]?.[year] || []).reduce((s, v) => s + v, 0);
  }
  return totals[cacheKey];
}

function lodesYear(data, p) {
  return lodesYearFor(data.lodes, data.commute.meta.periods[p].id);
}

function commuteTipHtml(data, level, keyIndex, name, p, cells) {
  const rows = cells.map((cell) => {
    const value = cellValue(data, level, keyIndex, p, cell);
    const label = COMMUTE_CELLS[cell].src === "all"
      ? t("explorer.tipLodesLabel",
        { label: t(COMMUTE_CELLS[cell].label), year: lodesYear(data, p) })
      : t(COMMUTE_CELLS[cell].label);
    return `<div class="row"><span class="k">${escapeHtml(label)}</span><span>${
      value === null ? escapeHtml(t("units.noValue")) : fmt(value)
    }</span></div>`;
  }).join("");
  const ratio = commuteCellRatio(data, level, keyIndex, p, cells);
  const stats = commuteStats(data.commute, level, keyIndex, p);
  return `<div style="font-size:12px"><b>${escapeHtml(name)}</b>
    ${rows}
    ${Number.isFinite(ratio)
      ? `<div class="row"><span class="k">${escapeHtml(t("explorer.rowAcShare"))}</span>`
        + `<span>${escapeHtml(t("numbers.percentFlat", { n: (100 * ratio).toFixed(1) }))}</span></div>`
      : ""}
    ${stats
      ? `<div class="row"><span class="k">${escapeHtml(t("explorer.rowAllRiders"))}</span>`
        + `<span>${fmt(stats.total)}</span></div>`
      : ""}
  </div>`;
}

function CommutePanel({ data, commute, level, keyIndex, p }) {
  if (!commute) return null;
  const stats = commuteStats(commute, level, keyIndex, p);
  if (!stats || stats.total <= 0) return null;
  const now = commuteHourly(commute, level, keyIndex, p);
  const base = commuteHourly(commute, level, keyIndex, commute.baseIdx);
  const period = commute.meta.periods[p];
  const growth = stats.baseTotal > 0 && p !== commute.baseIdx
    ? t("numbers.percentFlat", { n: (100 * stats.total / stats.baseTotal).toFixed(0) })
    : t("units.noValue");
  return (
    <>
      <h4>{t("explorer.headingWeekdayProfile", { label: period.label })}</h4>
      <HourlyChart now={now} base={base} windows={commute.meta.windows} />
      <div style={{ marginBottom: 6 }}>
        <Row label={t("explorer.rowRidersWeekday")}>{fmt(stats.total)}</Row>
        <Row label={t("explorer.rowVsBaseline")}>{growth}</Row>
        <Row label={t("explorer.rowAmBalance")}>
          {t("explorer.balanceValue", {
            sign: stats.amNet >= 0 ? "+" : "",
            pct: (100 * stats.amNet).toFixed(0),
            dir: t(stats.amNet >= 0 ? "explorer.amArrive" : "explorer.amDepart"),
          })}
        </Row>
        <Row label={t("explorer.rowPmBalance")}>
          {t("explorer.balanceValue", {
            sign: stats.pmNet >= 0 ? "+" : "",
            pct: (100 * stats.pmNet).toFixed(0),
            dir: t(stats.pmNet >= 0 ? "explorer.amDepart" : "explorer.amArrive"),
          })}
        </Row>
        <Row label={t("explorer.rowPeakStrength")}>
          {Number.isFinite(stats.peakRatio)
            ? t("explorer.peakRatio", { n: stats.peakRatio.toFixed(1) })
            : t("units.noValue")}
        </Row>
      </div>
    </>
  );
}

function renderMapLayers(api, data, options) {
  const { routeCanvas } = api;
  const { week, view, level, detail, recThresh } = options;
  renderDataLayer(api, data, options);

  // Corridors belong to the stop-group map (and the routes-only one). Over
  // tracts, block groups and cities they bury the areas, so there only an
  // opened route's own corridors are drawn, to keep it findable.
  const selectedRoute = detail?.lv === "route" ? detail.key : null;
  // Recovery time on stop groups leaves them out too: it is a per-place map
  // that does not follow the time bar, and the corridors would.
  const corridorLevel = (level === "group" && view !== "recovery") || level === "none";
  const era = eraForWeek(data, week);
  if (!era || !data.corridors[era] || (!corridorLevel && !selectedRoute)) {
    routeCanvas?.setOptions({ visible: false });
    return;
  }
  corridorStats(data, era);
  corridorDomain(data);
  const features = data.corridors[era];

  // Corridors are the shared street representation. Each path is drawn once
  // and carries all routes that use it, so overlapping services do not turn
  // into a stack of parallel lines at close zoom. The commute view only
  // recolours areas, so corridors keep the plain magnitude ramp there.
  routeCanvas?.setOptions({
    visible: true,
    data,
    era,
    features,
    week,
    view: view === "commute" || view === "income" ? "total" : view,
    recThresh,
    servicePeriod: options.servicePeriod,
    selectedRoute,
    onlySelected: !corridorLevel,
    nodes: corridorLevel ? data.corridorNodes?.[era] || null : null,
    groupMarkers: level === "group" ? api.groupMarkers : null,
  });
}

const ABOUT_SEEN_KEY = "acpra-about-seen";

function AboutModal({ onClose }) {
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="about-backdrop" role="presentation" onClick={onClose}>
      <div
        className="about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aboutTitle"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="aboutTitle">{t("explorer.aboutTitle")}</h2>
        <p><T id="explorer.about3" c={[<b />, <span className="gold" />]} /></p>
        <div className="about-actions">
          <ViewLink className="about-link" view="story">{t("explorer.aboutStory")}</ViewLink>
          <ViewLink className="about-link" view="methodology">{t("explorer.aboutMethodology")}</ViewLink>
          <button className="btn" type="button" onClick={onClose}>{t("explorer.aboutExplore")}</button>
        </div>
      </div>
    </div>
  );
}

export default function RidershipExplorer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [week, setWeek] = useState(0);
  const [view, setView] = useState("total");
  const [level, setLevel] = useState("group");
  const [recThresh, setRecThresh] = useState(3);
  const [servicePeriod, setServicePeriod] = useState(0);
  // Bumped whenever on-demand data lands, so the map and panels redraw.
  const [loadTick, setLoadTick] = useState(0);
  // The methodology note opens on a first visit and from the sidebar after.
  const [aboutOpen, setAboutOpen] = useState(false);
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(ABOUT_SEEN_KEY)) setAboutOpen(true);
    } catch {
      setAboutOpen(true);
    }
  }, []);
  const closeAbout = () => {
    setAboutOpen(false);
    try {
      window.localStorage.setItem(ABOUT_SEEN_KEY, "1");
    } catch {
      // Private windows can refuse storage; the note just shows again next time.
    }
  };
  const [playing, setPlaying] = useState(false);
  const [detail, setDetail] = useState(null);
  const [selection, setSelection] = useState(null);
  const [routeMode, setRouteMode] = useState("own");
  const [contextMenu, setContextMenu] = useState(null);
  const [commuteCells, setCommuteCells] = useState(COMMUTE_DEFAULT_CELLS);
  const [commuteFocus, setCommuteFocus] = useState(null);
  const [commuteFocusMode, setCommuteFocusMode] = useState("to");
  const [regionChooser, setRegionChooser] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapWrapRef = useRef(null);
  const mapApiRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const callbacksRef = useRef({});

  useEffect(() => {
    let cancelled = false;
    loadVisualizationData()
      .then((loaded) => {
        if (cancelled) return;
        setData(loaded);
        setWeek(loaded.BASE);
        setLoading(false);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const openDetail = (lv, key, label) => {
    setSelection(null);
    setContextMenu(null);
    setDetail({ lv, key, label });
  };
  const openRouteDetail = (route) => {
    setSelection(null);
    setContextMenu(null);
    setDetail({ lv: "route", key: route, label: `Route ${route}` });
  };
  const closeDetail = () => setDetail(null);
  const clearSelection = () => setSelection(null);

  const commute = data?.commute || null;
  // The commute snapshot follows the time bar: the latest snapshot month at
  // or before the selected week (clamped to the first snapshot for the
  // pre-2019-02 weeks).
  let commutePeriodIdx = 0;
  if (commute) {
    const month = data.meta.weeks[week].slice(0, 7);
    const periods = commute.meta.periods;
    for (let i = 0; i < periods.length; i += 1) {
      if (periods[i].id <= month) commutePeriodIdx = i;
      else break;
    }
  }
  const odInFlightRef = useRef(null);

  // What the current view needs beyond the startup bundle. A route's detail
  // charts every era and shows its month of service; any detail panel shows
  // the commute profile.
  const needs = data ? {
    levels: [level],
    eras: detail?.lv === "route" ? Object.keys(data.meta.sections) : [eraForWeek(data, week)],
    serviceMonth: data.service && (isServiceView(view) || detail?.lv === "route")
      ? serviceSnapshot(data, week) : null,
    commute: view === "commute" || !!detail,
    speed: !!selection,
  } : null;
  const needsKey = needs ? JSON.stringify({ ...needs, serviceMonth: needs.serviceMonth?.id }) : "";
  const loadingData = !!needs && isPending(data, needs);
  useEffect(() => {
    if (!data) return undefined;
    let cancelled = false;
    ensureData(data, needs)
      .then((changed) => { if (changed && !cancelled) setLoadTick((tick) => tick + 1); })
      .catch((loadError) => { if (!cancelled) setError(loadError); });
    return () => { cancelled = true; };
    // needsKey stands for needs; the object itself is new every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, needsKey]);

  // Predictive buffering. Which way the time bar last moved decides what is
  // "ahead"; play always moves forward. A short pause before planning lets a
  // fast drag settle, so the queue follows where the bar is going rather than
  // every week it passed through.
  const prefetcherRef = useRef(null);
  const lastWeekRef = useRef(null);
  const directionRef = useRef(1);
  if (lastWeekRef.current !== null && week !== lastWeekRef.current) {
    directionRef.current = week > lastWeekRef.current ? 1 : -1;
  }
  lastWeekRef.current = week;
  const focusActive = view === "commute" && !!commuteFocus;
  useEffect(() => {
    if (!data) return undefined;
    if (!prefetcherRef.current || prefetcherRef.current.data !== data) {
      prefetcherRef.current = { data, ...createPrefetcher(data) };
    }
    const prefetcher = prefetcherRef.current;
    const direction = playing ? 1 : directionRef.current;
    const timer = window.setTimeout(() => {
      const jobs = [];
      // The next era's corridors first when a crossing is near: they are the
      // biggest thing a scrub can hit, and every view draws them.
      for (const needs of eraLookahead(data, week, direction)) jobs.push(prefetcher.ensure(needs));
      if (isServiceView(view)) {
        for (const needs of serviceLookahead(data, week, direction)) jobs.push(prefetcher.ensure(needs));
      }
      if (focusActive && data.commute) {
        for (const id of commuteOdLookahead(data.commute, commutePeriodIdx, direction)) {
          jobs.push(() => loadCommuteOD(data.commute, id));
        }
      } else if (view === "commute" && data.commute) {
        // No focus yet: the snapshot a click would open.
        const id = data.commute.meta.periods[commutePeriodIdx]?.id;
        if (id && data.commute.meta.od?.[id]) jobs.push(() => loadCommuteOD(data.commute, id));
      }
      prefetcher.schedule(jobs);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [data, week, view, playing, focusActive, commutePeriodIdx]);

  // LODES is published per tract, so the All-commuters and Compare modes only
  // exist at tract level; entering them moves the map and greys the selector.
  const commuteLocksTract = view === "commute"
    && commuteLocksTractFor(commuteCells);
  // Speed and level of service live on the corridors, which only the
  // stop-group and routes-only maps draw.
  const serviceLocksCorridors = isServiceView(view);
  useEffect(() => {
    if (!serviceLocksCorridors) return;
    setLevel((current) => (current === "group" || current === "none" ? current : "group"));
    setDetail((current) => (current && current.lv !== "route" && current.lv !== "group" ? null : current));
  }, [serviceLocksCorridors]);
  useEffect(() => {
    if (!commuteLocksTract) return;
    setLevel((current) => (current === "tract" ? current : "tract"));
    setCommuteFocus(null);
    setDetail((current) => (current && current.lv !== "route" && current.lv !== "tract" ? null : current));
  }, [commuteLocksTract]);

  // Clicking a place in the commute view recolours the map by inferred flows
  // to (or from) it; the O-D file for the time bar's snapshot is fetched on
  // demand and refetched here whenever the snapshot moves under an active
  // focus (the week slider drives the snapshot).
  // While the next snapshot downloads, the focus keeps the flows it has
  // (`listsAnchor` records whose they are) rather than dropping them, which
  // used to flash the whole map back to the unfocused colours on every step.
  useEffect(() => {
    if (!commute || !commuteFocus) return;
    const anchorId = commute.meta.periods[commutePeriodIdx].id;
    if (commuteFocus.anchor !== anchorId) {
      setCommuteFocus((current) => current ? { ...current, anchor: anchorId } : current);
      return;
    }
    if (commuteFocus.lists && commuteFocus.listsAnchor === anchorId) return;
    const token = `${anchorId}|${commuteFocus.level}|${commuteFocus.key}`;
    if (odInFlightRef.current === token) return;
    odInFlightRef.current = token;
    loadCommuteOD(commute, anchorId)
      .then((store) => {
        setCommuteFocus((current) => {
          if (!current || current.anchor !== anchorId
            || current.level !== commuteFocus.level) return current;
          if (current.kind === "region") {
            return {
              ...current,
              listsAnchor: anchorId,
              lists: commuteRegionLists(data.meta, store, current.keys, current.level),
            };
          }
          if (current.key !== commuteFocus.key) return current;
          return { ...current, listsAnchor: anchorId, lists: commuteODLists(store, current.level, current.key) };
        });
      })
      .catch(() => {
        setCommuteFocus((current) => current && current.anchor === anchorId
          ? { ...current, listsAnchor: anchorId, lists: { in: [], out: [] } }
          : current);
      })
      .finally(() => {
        if (odInFlightRef.current === token) odInFlightRef.current = null;
      });
  }, [commute, commuteFocus, commutePeriodIdx]);

  callbacksRef.current = {
    onDetail: openDetail,
    onContext: setContextMenu,
    onMapClick: (lv, key, label) => {
      openDetail(lv, key, label);
      if (view === "commute" && commute && lv !== "route" && !commuteLocksTract) {
        setCommuteFocus({
          kind: "place",
          level: lv,
          key,
          label,
          anchor: commute.meta.periods[commutePeriodIdx].id,
          lists: null,
        });
      }
    },
    onBoxSelect: (northWest, southEast) => {
      if (!data) return;
      const groups = data.meta.stop_groups;
      const picked = [];
      for (let index = 0; index < groups.n; index += 1) {
        if (
          groups.lat[index] <= northWest.lat &&
          groups.lat[index] >= southEast.lat &&
          groups.lon[index] >= northWest.lng &&
          groups.lon[index] <= southEast.lng
        ) picked.push(index);
      }
      if (!picked.length) return;
      // In the commute view a box can become a region origin ("from") or
      // destination ("to") for the inferred-riders recolouring.
      if (view === "commute" && commute && level !== "none" && !commuteLocksTract) {
        const api = mapApiRef.current;
        const point = api?.map ? api.map.latLngToContainerPoint([northWest.lat, northWest.lng]) : null;
        const wrap = mapWrapRef.current?.getBoundingClientRect();
        setSelection(null);
        setDetail(null);
        setContextMenu(null);
        setRegionChooser({
          keys: picked,
          bounds: { north: northWest.lat, south: southEast.lat, west: northWest.lng, east: southEast.lng },
          x: point ? Math.max(8, Math.min(point.x, (wrap?.width || 800) - 260)) : 20,
          y: point ? Math.max(8, Math.min(point.y, (wrap?.height || 600) - 170)) : 20,
        });
        return;
      }
      setSelection({
        keys: picked,
        bounds: { north: northWest.lat, south: southEast.lat, west: northWest.lng, east: southEast.lng },
      });
      setDetail(null);
      setContextMenu(null);
    },
  };

  // Dismiss the box-selection chooser on any click outside it.
  useEffect(() => {
    if (!regionChooser) return undefined;
    const dismiss = (event) => {
      if (!event.target.closest?.("#regionChooser")) setRegionChooser(null);
    };
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, [regionChooser]);

  const chooseRegion = (mode) => {
    if (!regionChooser || !commute) return;
    setCommuteFocusMode(mode);
    setSelection(null);
    setDetail(null);
    setCommuteFocus({
      kind: "region",
      level,
      keys: regionChooser.keys,
      label: `${regionChooser.keys.length} stop group${regionChooser.keys.length === 1 ? "" : "s"}`,
      anchor: commute.meta.periods[commutePeriodIdx].id,
      lists: null,
    });
    setRegionChooser(null);
  };

  useEffect(() => {
    if (!data || !mapContainerRef.current) return undefined;
    let disposed = false;
    let map;
    let resizeObserver;

    import("leaflet").then((leafletModule) => {
      if (disposed || !mapContainerRef.current) return;
      const L = leafletModule.default || leafletModule;
      const basemap = CARTO_KEY
        ? {
            url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            className: "basemap-carto",
          }
        : {
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: "&copy; OpenStreetMap contributors",
            className: "basemap-muted",
          };
      map = L.map(mapContainerRef.current, {
        renderer: L.canvas({ padding: 0.12 }),
        preferCanvas: true,
        boxZoom: false,
      }).setView([37.804, -122.271], BASE_ZOOM);
      L.tileLayer(basemap.url, { attribution: basemap.attribution, maxZoom: 19, className: basemap.className }).addTo(map);
      map.createPane("routeCanvasPane");
      map.getPane("routeCanvasPane").style.zIndex = 350;
      const dataLayer = L.layerGroup().addTo(map);
      const api = {
        L,
        map,
        dataLayer,
        disposed: false,
      };
      api.routeCanvas = createRouteCanvasLayer(map, L, () => callbacksRef.current, mapWrapRef);
      mapApiRef.current = api;

      const onMapClick = () => callbacksRef.current.onContext(null);
      map.on("click", onMapClick);

      let start = null;
      let box = null;
      const onMouseDown = (event) => {
        if (!event.shiftKey || event.button !== 0) return;
        if (event.target?.closest?.(".leaflet-control")) return;
        event.preventDefault();
        map.dragging.disable();
        const bounds = mapWrapRef.current.getBoundingClientRect();
        start = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        box = document.createElement("div");
        box.className = "box-select";
        mapWrapRef.current.appendChild(box);
      };
      const onMouseMove = (event) => {
        if (!start || !box || !mapWrapRef.current) return;
        const bounds = mapWrapRef.current.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        Object.assign(box.style, {
          left: `${Math.min(start.x, x)}px`,
          top: `${Math.min(start.y, y)}px`,
          width: `${Math.abs(x - start.x)}px`,
          height: `${Math.abs(y - start.y)}px`,
        });
      };
      const onMouseUp = (event) => {
        if (!start || !mapWrapRef.current) return;
        map.dragging.enable();
        const bounds = mapWrapRef.current.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const first = map.containerPointToLatLng([Math.min(start.x, x), Math.min(start.y, y)]);
        const second = map.containerPointToLatLng([Math.max(start.x, x), Math.max(start.y, y)]);
        box?.remove();
        start = null;
        box = null;
        if (Math.abs(second.lat - first.lat) < 1e-4) return;
        callbacksRef.current.onBoxSelect(first, second);
      };
      mapContainerRef.current.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => map.invalidateSize());
        resizeObserver.observe(mapWrapRef.current);
      }
      setMapReady(true);

      api.cleanup = () => {
        map.off("click", onMapClick);
        mapContainerRef.current?.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        resizeObserver?.disconnect();
        api.routeCanvas?.remove();
        if (start) map.dragging.enable();
        box?.remove();
      };
    }).catch((mapError) => {
      if (!disposed) {
        setError(mapError);
        setLoading(false);
      }
    });

    return () => {
      disposed = true;
      if (mapApiRef.current) {
        mapApiRef.current.disposed = true;
        mapApiRef.current.cleanup?.();
      }
      if (map) map.remove();
      mapApiRef.current = null;
      setMapReady(false);
    };
  }, [data]);

  useEffect(() => {
    const api = mapApiRef.current;
    if (!data || !mapReady || !api || api.disposed) return;
    renderMapLayers(api, data, {
      // `areaStyle` reads state.data to colour a tract or block group. It is
      // handed api.renderState, i.e. this object, so leaving data out of it
      // broke every area level for every view -- colorFor was being called
      // with undefined.
      data,
      week,
      view,
      level,
      detail,
      recThresh,
      servicePeriod,
      commute: data.commute,
      commuteCells,
      commutePeriodIdx,
      commuteFocus,
      commuteFocusMode,
      callbacks: {
        onDetail: (...args) => callbacksRef.current.onDetail(...args),
        onContext: (...args) => callbacksRef.current.onContext(...args),
        onMapClick: (...args) => callbacksRef.current.onMapClick(...args),
      },
    });
  }, [data, mapReady, loadTick, week, view, level, detail, recThresh, servicePeriod, commuteCells, commutePeriodIdx, commuteFocus, commuteFocusMode]);

  useEffect(() => {
    if (!playing || !data) return undefined;
    const timer = window.setInterval(() => setWeek((current) => (current + 1) % data.W), 220);
    return () => window.clearInterval(timer);
  }, [playing, data]);

  const levelLocked = (value) => (commuteLocksTract && value !== "tract")
    || (serviceLocksCorridors && value !== "group" && value !== "none");

  let systemTotal = 0;
  let systemImputed = 0;
  if (data) {
    for (let index = 0; index < data.store.group.n; index += 1) {
      systemTotal += totalAt(data, "group", index, week);
      systemImputed += imputedAt(data, "group", index, week);
    }
  }

  return (
    <>
      <div id="app">
        <aside id="sidebar">
          <h1>{t("explorer.title")}</h1>

          <section>
            <h2>{t("explorer.headingView")}</h2>
            {[
              ["total", "explorer.viewTotal"],
              ["rel", "explorer.viewRel"],
              ["recovery", "explorer.viewRecovery"],
              ...(data?.commute ? [["commute", "explorer.viewCommute"]] : []),
              ...(data?.service
                ? [["speed", "explorer.viewSpeed"], ["los", "explorer.viewLos"]] : []),
              ["imp", "explorer.viewImp"],
            ].map(([value, label]) => (
              <div key={value}>
                <label>
                  <input
                    type="radio"
                    name="view"
                    value={value}
                    checked={view === value}
                    onChange={(event) => {
                      setView(event.target.value);
                      if (event.target.value !== "commute") setCommuteFocus(null);
                    }}
                  />
                  {t(label)}
                </label>
              </div>
            ))}
            {view === "recovery" ? (
              <div id="recCtl">
                <label className="inline">
                  {t("explorer.reachedLabel")}
                  <select value={recThresh} onChange={(event) => setRecThresh(Number(event.target.value))}>
                    {[
                      [0, "50%"], [1, "60%"], [2, "70%"], [3, "80%"], [4, "90%"], [5, "100%"],
                    ].map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                  {t("explorer.ofBaseline")}
                </label>
              </div>
            ) : null}
            {isServiceView(view) && data?.service ? (
              <div id="recCtl">
                <div className="seg seg-wrap">
                  {(displaySnapshot(data, week)?.periods || data.service.snapshots[0].periods).map((period, index, snapPeriods) => (
                    <button
                      key={period.id}
                      type="button"
                      title={periodHours(period, snapPeriods)}
                      className={`segbtn${servicePeriod === index ? " on" : ""}`}
                      onClick={() => setServicePeriod(index)}
                    >
                      {period.label.replace("Weekday ", "")}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {view === "commute" && data?.commute ? (
              <div id="recCtl">
                {commuteFocus ? (
                  <>
                    <div className="focus-banner">
                      <span className="focus-name" title={commuteFocus.label}>{commuteFocus.label}</span>
                      <button
                        className="btn small ghost"
                        type="button"
                        onClick={() => setCommuteFocus(null)}
                      >
                        {t("explorer.closeMark")}
                      </button>
                    </div>
                    <div className="seg">
                      {[
                        ["to", "explorer.focusTo"],
                        ["from", "explorer.focusFrom"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={`segbtn${commuteFocusMode === value ? " on" : ""}`}
                          onClick={() => setCommuteFocusMode(value)}
                        >
                          {t(label)}
                        </button>
                      ))}
                    </div>
                    {commuteFocus.lists ? null : (
                      <p className="hint">{t("explorer.hintFocusLoading")}</p>
                    )}
                  </>
                ) : (
                  <div className="seg seg-wrap">
                    {COMMUTE_MODES.map(([mode, label, cells]) => {
                      const disabled = cells.some(cellIsTractOnly) && !data.lodes;
                      const on = cells.length === commuteCells.length && cells.every((cell) => commuteCells.includes(cell));
                      return (
                        <button
                          key={mode}
                          type="button"
                          className={`segbtn${on ? " on" : ""}`}
                          disabled={disabled}
                          aria-pressed={on}
                          onClick={() => setCommuteCells(cells)}
                        >
                          {t(label)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </section>

          <section>
            <h2>{t("explorer.headingLevel")}</h2>
            {[
              ["group", "explorer.levelGroup"],
              ["bgroup", "explorer.levelBgroup"],
              ["tract", "explorer.levelTract"],
              ...(data?.cities ? [["city", "explorer.levelCity"]] : []),
              ["none", "explorer.levelNone"],
            ].map(([value, label]) => (
              <label key={value} style={levelLocked(value) ? { opacity: 0.55 } : undefined}>
                <input
                  type="radio"
                  name="level"
                  value={value}
                  checked={level === value}
                  disabled={levelLocked(value)}
                  onChange={(event) => {
                    const nextLevel = event.target.value;
                    setLevel(nextLevel);
                    setCommuteFocus(null);
                    setDetail((current) => current && current.lv !== "route" && current.lv !== nextLevel ? null : current);
                  }}
                />
                {t(label)}
              </label>
            ))}
          </section>

          <section>
            <h2>{t("explorer.headingSelection")}</h2>
            <button className="btn" type="button" disabled={!selection} onClick={clearSelection}>
              {t("explorer.clearSelection")}
            </button>
          </section>

          <button className="btn about-btn" type="button" onClick={() => setAboutOpen(true)}>
            {t("explorer.aboutTitle")}
          </button>
        </aside>

        <main id="mapWrap" ref={mapWrapRef}>
          <div id="map" ref={mapContainerRef} />
          {/* The key floats over the map's top-right corner, where it stays in
              view beside whatever it explains; the detail panel sits below it
              in the bottom-right. */}
          <section id="legendBox">
            <h2>{t("explorer.headingLegend")}</h2>
            <Legend
              data={data}
              view={view}
              level={level}
              recThresh={recThresh}
              commute={data?.commute}
              commuteCells={commuteCells}
              period={data?.commute ? data.commute.meta.periods[commutePeriodIdx] : null}
              commuteFocus={commuteFocus}
              commuteFocusMode={commuteFocusMode}
              servicePeriod={servicePeriod}
              week={week}
              focusMax={commuteFocus?.lists
                ? (commuteFocusMode === "from"
                  ? commuteFocus.lists.out[0]?.flow
                  : commuteFocus.lists.in[0]?.flow) || 1
                : 1}
            />
          </section>
          {contextMenu ? (
            <div className="ctx-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
              <div className="ctx-head">{t("explorer.ctxRoutes")}</div>
              {contextMenu.routes.map((route) => (
                <button className="ctx-item" type="button" key={route} onClick={() => openRouteDetail(route)}>
                  {route}
                </button>
              ))}
            </div>
          ) : null}
          {regionChooser ? (
            <div className="ctx-menu" id="regionChooser" style={{ left: regionChooser.x, top: regionChooser.y }}>
              <div className="ctx-head">
                {t("explorer.selectionCount", {
                  n: regionChooser.keys.length,
                  s: regionChooser.keys.length === 1 ? "" : "s",
                })}
              </div>
              <button className="ctx-item" type="button" onClick={() => chooseRegion("to")}>
                {t("explorer.ctxInferredTo")}
              </button>
              <button className="ctx-item" type="button" onClick={() => chooseRegion("from")}>
                {t("explorer.ctxInferredFrom")}
              </button>
              <button
                className="ctx-item"
                type="button"
                onClick={() => {
                  setSelection({ keys: regionChooser.keys, bounds: regionChooser.bounds });
                  setDetail(null);
                  setRegionChooser(null);
                }}
              >
                {t("explorer.ctxWeeklyChart")}
              </button>
            </div>
          ) : null}
          {data ? <RouteSearch data={data} week={week} onPick={openRouteDetail} /> : null}
          {detail && data ? (
            <DetailPanel
              data={data}
              detail={detail}
              week={week}
              routeMode={routeMode}
              onRouteClick={openRouteDetail}
              onModeChange={setRouteMode}
            onClose={closeDetail}
            commute={data.commute}
            periodIdx={commutePeriodIdx}
            commuteCells={commuteCells}
          />
          ) : null}
          {selection && data ? (
            <SelectionPanel
              data={data}
              selection={selection}
              week={week}
              canvasRef={selectionCanvasRef}
              onClear={clearSelection}
            />
          ) : null}
        </main>

        <footer id="timebar">
          <button className="btn" type="button"
            aria-label={t(playing ? "explorer.pauseLabel" : "explorer.playLabel")}
            onClick={() => setPlaying((current) => !current)}>
            {t(playing ? "explorer.pauseMark" : "explorer.playMark")}
          </button>
          <div id="weekLabel">
            {data ? t("explorer.weekOf", { week: data.meta.weeks[week] }) : t("units.noValue")}
          </div>
          <input
            type="range"
            id="weekSlider"
            min="0"
            max={data ? data.W - 1 : 386}
            value={data ? week : 0}
            step="1"
            disabled={!data}
            onChange={(event) => setWeek(Number(event.target.value))}
          />
          <div id="weekTotal">
            {data ? (
              <>
                {t("explorer.systemRidership")}{" "}
                <DisclosureValue real={systemTotal - systemImputed} imp={systemImputed} />
              </>
            ) : null}
          </div>
        </footer>
      </div>
      {aboutOpen ? <AboutModal onClose={closeAbout} /> : null}
      {loading ? <div id="loading">{t("explorer.loadingApp")}</div> : null}
      {!loading && loadingData ? (
        <div className="loading-chip">{t("explorer.loadingView")}</div>
      ) : null}
      {error ? (
        <div className="error-state">
          <div><strong>{t("explorer.errorTitle")}</strong>{error.message}</div>
        </div>
      ) : null}
    </>
  );
}
