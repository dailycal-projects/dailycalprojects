"use client";

/* The explainer's one figure, drawn the way a maths video would draw it.

   Every passage hands it a state name and it draws that state. The
   transitions between them are the explanation, so nothing is ever redrawn
   from scratch: a bar that gains a segment keeps its base, a route that has
   to make room for its neighbours slides up rather than cutting away, and
   the four weeks are the same route split, not a new chart.

   Conventions borrowed from Manim, because they are what make a figure read
   as a blackboard rather than as a dashboard: shapes are a translucent fill
   inside a full-strength stroke of the same colour, motion is eased on a
   sigmoid and staggered across the row so the eye can follow it, quantities
   are named in real typeset maths beside the figure, and a brace names a
   group rather than a caption doing it from a distance.

   The route is illustrative. Its numbers are round on purpose so the
   arithmetic in the copy can be followed by eye: 20 trips of which 12
   reported, a coverage factor of 0.6, a calibration factor of 1.12. */

import { useMemo } from "react";
import katex from "katex";
import { t } from "../../lib/i18n";

const STOPS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
const OBSERVED = [120, 85, 160, 210, 95, 140, 60];
const SPARSE = [0, 15, 0, 25, 10, 0, 8];

export const C_ROUTE = 0.6;
export const C_PRA = 1.12;
export const N_TRIPS = 20;
export const N_PRESENT = 12;
export const W_IMPUTED = 0.3;
// present trips per week, in the same 12 of 20; week four went dark
export const WEEK_NODES = [5, 4, 3, 0];

const VB = { w: 840, h: 480 };
const PAD = { left: 50, right: 262, top: 52, bottom: 60 };
const PLOT = { w: VB.w - PAD.left - PAD.right, h: VB.h - PAD.top - PAD.bottom };
const BAR_W = 40;
const MAX = 430; // ceiling the route's bars scale against, in riders
const PANEL_TOP = 112; // where the trip column and its arithmetic begin

/* Manim's `smooth` rate function is a sigmoid: nothing in these figures ever
   starts or stops abruptly. */
const EASE = "cubic-bezier(.45,.03,.55,.97)";
const MOVE = `.85s ${EASE}`;
const FADE = `.5s ${EASE}`;

const COLORS = {
  observed: "var(--mth-observed)",
  coverage: "var(--mth-coverage)",
  calibration: "var(--mth-calibration)",
  schedule: "var(--mth-schedule)",
  real: "var(--mth-real)",
  imputed: "var(--mth-imputed)",
  donor: "var(--mth-donor)",
  dead: "var(--mth-dead)",
};

const scale = (value, height = PLOT.h, max = MAX) => (value / max) * height;
const xOf = (index) => PAD.left + (index + 0.5) * (PLOT.w / STOPS.length) - BAR_W / 2;

/* A stacked bar growing upward from y = 0 of whatever group holds it, so the
   group can be moved without the bars having to be recomputed. Zero-height
   segments are skipped, so an empty stop reads as empty rather than as a
   hairline. */
function Bar({ x, segments, width = BAR_W, height = PLOT.h, max = MAX, delay = 0 }) {
  let top = 0;
  return segments.map(({ key, value, color }) => {
    const h = Math.max(0, scale(value, height, max));
    top -= h;
    if (h <= 0.4) return null;
    return (
      <rect
        key={key}
        x={x}
        width={width}
        className="mth-fig-bar"
        style={{
          y: `${top}px`,
          height: `${h}px`,
          fill: color,
          stroke: color,
          transition: `y ${MOVE} ${delay}ms, height ${MOVE} ${delay}ms`,
        }}
      />
    );
  });
}

/* A curly brace naming a group of things. `depth` is signed: positive points
   the tip left, negative points it right. */
function Brace({ x, y0, y1, depth = 7, label, color, opacity = 1 }) {
  const w = depth;
  const mid = (y0 + y1) / 2;
  const d = [
    `M ${x},${y0}`,
    `q ${-w},0 ${-w},${Math.abs(w)}`,
    `L ${x - w},${mid - Math.abs(w)}`,
    `q 0,${Math.abs(w)} ${-w},${Math.abs(w)}`,
    `q ${w},0 ${w},${Math.abs(w)}`,
    `L ${x - w},${y1 - Math.abs(w)}`,
    `q 0,${Math.abs(w)} ${w},${Math.abs(w)}`,
  ].join(" ");
  const tip = x - 2 * w;
  return (
    <g style={{ opacity, transition: `opacity ${FADE}` }}>
      <path className="mth-fig-brace" d={d} style={{ stroke: color }} />
      <text
        className="mth-fig-label"
        x={tip - (w > 0 ? 9 : -9)}
        y={mid}
        textAnchor={w > 0 ? "end" : "start"}
        dominantBaseline="middle"
        style={{ fill: color }}
      >
        {label}
      </text>
    </g>
  );
}

/* Typeset maths inside the figure. The quantities the prose names are the
   same glyphs here, in the colour of the thing they measure -- which is the
   whole trick behind following one of these videos without a legend. */
function Tex({ x, y, tex, color, size = 19, width = 260, height = 54, opacity = 1, align = "left" }) {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, strict: "ignore" }),
    [tex],
  );
  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      style={{ overflow: "visible", opacity, transition: `opacity ${FADE}` }}
    >
      <div
        className="mth-fig-tex"
        style={{ fontSize: `${size}px`, color, textAlign: align }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  );
}

/* The trip column: one dot per scheduled trip, solid where the counter
   reported and hollow where it did not. This is the thing the coverage
   factor is a ratio of, so it is braced rather than captioned. */
function Trips({ present, total = N_TRIPS, x, y, cols = 4, gap = 19, braced = true }) {
  const rows = Math.ceil(total / cols);
  const lastPresentRow = Math.ceil(present / cols);
  const gridRight = x + (cols - 1) * gap + 12;
  return (
    <g>
      {Array.from({ length: total }, (_, i) => (
        <circle
          key={i}
          cx={x + (i % cols) * gap}
          cy={y + Math.floor(i / cols) * gap}
          r={5.4}
          className={`mth-fig-dot${i < present ? "" : " is-dead"}`}
        />
      ))}
      {braced ? (
        <>
          <Brace
            x={gridRight}
            y0={y - 8}
            y1={y + (lastPresentRow - 1) * gap + 8}
            depth={-6}
            label={t("figure.braceReported")}
            color={COLORS.observed}
            opacity={present > 0 ? 1 : 0}
          />
          <Brace
            x={gridRight}
            y0={y + lastPresentRow * gap - gap + 12}
            y1={y + (rows - 1) * gap + 8}
            depth={-6}
            label={t("figure.braceMissing")}
            color={COLORS.dead}
            opacity={present < total ? 1 : 0}
          />
        </>
      ) : null}
    </g>
  );
}

/* One route: a baseline, its bars, and its stop names. Drawn about y = 0 so
   the caller can put it anywhere and move it later. */
function Route({
  values,
  segmentsAt,
  width = BAR_W,
  height = PLOT.h,
  max = MAX,
  labels = true,
  xAt = xOf,
  axis = [PAD.left - 10, PAD.left + PLOT.w],
}) {
  return (
    <g>
      <rect className="mth-fig-axis" x={axis[0]} y={0} width={axis[1] - axis[0]} height={1} />
      {values.map((value, i) => (
        <Bar
          key={i}
          x={xAt(i)}
          width={width}
          height={height}
          max={max}
          delay={i * 45}
          segments={segmentsAt(value, i)}
        />
      ))}
      {labels
        ? values.map((value, i) => (
          <text key={i} className="mth-fig-tick" x={xAt(i) + width / 2} y={20}>
            {STOPS[i]}
          </text>
        ))
        : null}
    </g>
  );
}

export default function RouteFigure({ state }) {
  if (state === "mix") return <MixPanel />;
  if (state === "weeks" || state === "blend") return <WeekPanel state={state} />;

  const donorPanel = state === "donors" || state === "donorFill";
  const sparse = state === "sparse" || donorPanel;
  const showCoverage = ["coverage", "calibration"].includes(state);
  const showCalibration = state === "calibration";
  const values = sparse ? SPARSE : OBSERVED;

  // Where the route's baseline sits. In the donor states it climbs to leave
  // the lower half of the frame for the routes that cover the same corners.
  const baseline = donorPanel ? PAD.top + 128 : PAD.top + PLOT.h;
  const donorMax = 260;
  const donorH = 72;

  const segmentsAt = (value, i) => [
    { key: "observed", value, color: COLORS.observed },
    { key: "coverage", value: showCoverage ? value * (1 / C_ROUTE - 1) : 0, color: COLORS.coverage },
    {
      key: "calibration",
      value: showCalibration ? (value / C_ROUTE) * (C_PRA - 1) : 0,
      color: COLORS.calibration,
    },
    {
      key: "donor",
      value: state === "donorFill" ? Math.max(0, OBSERVED[i] * 0.78 - value) : 0,
      color: COLORS.donor,
    },
  ];

  return (
    <svg className="mth-fig" viewBox={`0 0 ${VB.w} ${VB.h}`}>
      <g style={{ transform: `translateY(${baseline}px)`, transition: `transform ${MOVE}` }}>
        <Route values={values} segmentsAt={segmentsAt} />
      </g>

      {/* the routes that cover the same corners, below */}
      <g style={{ opacity: donorPanel ? 1 : 0, transition: `opacity ${FADE}` }} aria-hidden={!donorPanel}>
        <g style={{ transform: `translateY(${PAD.top + 268}px)` }}>
          <Route
            values={OBSERVED.slice(0, 4)}
            segmentsAt={(value) => [{ key: "o", value, color: COLORS.observed }]}
            height={donorH}
            max={donorMax}
            labels={false}
            axis={[PAD.left - 10, xOf(3) + BAR_W + 10]}
          />
          <text className="mth-fig-label" x={PAD.left - 10} y={20}>{t("figure.routeA")}</text>
        </g>
        <g style={{ transform: `translateY(${PAD.top + 376}px)` }}>
          <Route
            values={[0, 0, 0, 0, ...OBSERVED.slice(4)]}
            segmentsAt={(value) => [{ key: "o", value, color: COLORS.observed }]}
            height={donorH}
            max={donorMax}
            labels={false}
            axis={[xOf(4) - 10, PAD.left + PLOT.w]}
          />
          <text className="mth-fig-label" x={xOf(4) - 10} y={20}>{t("figure.routeB")}</text>
        </g>
      </g>

      {/* the trips the counters were meant to see, and what follows from them */}
      <g style={{ transform: `translateY(${PANEL_TOP}px)` }}>
        <Trips present={sparse ? 1 : N_PRESENT} x={PAD.left + PLOT.w + 62} y={10} />

        <Tex
          x={PAD.left + PLOT.w + 44}
          y={168}
          opacity={showCoverage || showCalibration ? 1 : 0}
          color={COLORS.coverage}
          tex={String.raw`c_{\text{route}} = \tfrac{12}{20} = 0.6`}
        />
        <Tex
          x={PAD.left + PLOT.w + 44}
          y={212}
          opacity={showCalibration ? 1 : 0}
          color={COLORS.calibration}
          tex={String.raw`c_{\text{pra}} = 1.12`}
        />
      </g>
    </svg>
  );
}

/* The mixing step. One week's ridership is the two terms of the blend drawn
   side by side, in the app's own real and imputed colours, each holding the
   same seven stops in the same blue, green and teal. Nothing in the gold bar
   is invented -- it is the month again, levelled by the schedule instead of
   by what the counters happened to see that week. */
function MixPanel() {
  const base = 400;
  const full = 292; // a whole week's ridership, before it is divided
  const inset = { w: 154, slot: 22, bar: 16, h: 66, max: 420 };
  const bars = [
    {
      key: "real",
      x: 236,
      w: 200,
      share: 1 - W_IMPUTED,
      color: COLORS.real,
      title: "what the counters saw",
      term: String.raw`(1-w)\,p_{\text{week}} = 0.7`,
    },
    {
      key: "imputed",
      x: 476,
      w: 200,
      share: W_IMPUTED,
      color: COLORS.imputed,
      title: "what the schedule expects",
      term: String.raw`w\,p_{\text{sched}} = 0.3`,
    },
  ];
  const insetX = (bar) => bar.x + (bar.w - inset.w) / 2;
  const xAt = (i) => i * inset.slot + (inset.slot - inset.bar) / 2;
  const monthSegments = (value) => [
    { key: "observed", value, color: COLORS.observed },
    { key: "coverage", value: value * (1 / C_ROUTE - 1), color: COLORS.coverage },
    { key: "calibration", value: (value / C_ROUTE) * (C_PRA - 1), color: COLORS.calibration },
  ];

  return (
    <svg className="mth-fig" viewBox={`0 0 ${VB.w} ${VB.h}`}>
      <Tex
        x={40}
        y={34}
        width={VB.w - 80}
        height={60}
        size={19}
        align="center"
        color="var(--mth-ink)"
        tex={String.raw`r_{\text{week}} = r_{\text{month}}\bigl(\textcolor{#3987e5}{(1-w)\,p_{\text{week}}} + \textcolor{#c98500}{w\,p_{\text{sched}}}\bigr)`}
      />

      {/* both terms stand on one line, so their heights are comparable */}
      <rect className="mth-fig-axis" x={bars[0].x - 16} y={base} width={bars[1].x + bars[1].w + 16 - bars[0].x} height={1} />

      {/* the two terms, which arrive as the month lands in them */}
      {bars.map((bar) => (
        <g key={bar.key}>
          <rect
            className="mth-fig-bar"
            x={bar.x}
            width={bar.w}
            y={base - full * bar.share}
            height={full * bar.share}
            style={{ fill: bar.color, stroke: bar.color, fillOpacity: 0.22 }}
          />
          <text className="mth-fig-num" x={bar.x + bar.w / 2} y={base - full * bar.share - 14}>
            {t("figure.pctOfWeek", { pct: Math.round(bar.share * 100) })}
          </text>
          <text className="mth-fig-tick" x={bar.x + bar.w / 2} y={base + 26} style={{ fill: bar.color }}>
            {bar.title}
          </text>
          <Tex
            x={bar.x}
            y={base + 32}
            width={bar.w}
            height={40}
            size={15}
            align="center"
            color={bar.color}
            tex={bar.term}
          />
        </g>
      ))}

      {/* the month itself, once inside each bar */}
      {bars.map((bar) => (
        <g key={`month-${bar.key}`} style={{ transform: `translate(${insetX(bar)}px, ${base - 16}px)` }}>
          <Route
            values={OBSERVED}
            segmentsAt={monthSegments}
            width={inset.bar}
            height={inset.h}
            max={inset.max}
            labels={false}
            xAt={xAt}
            axis={[-6, inset.w]}
          />
        </g>
      ))}

    </svg>
  );
}

/* The month and its weeks, stacked: one row per week under a copy of the
   month itself, the seven stops running across every row so a stop is a
   column you can read straight down. The month keeps its blue, green and
   teal; a week keeps only blue, because at this point what matters about a
   week is not how its ridership was corrected but how much of it there is.

   The gold is the schedule's share of each stop, and a dashed line drops from
   every stop of the month through the gold it becomes in each week -- the
   point being that the gold is not invented, it is this month's shape held at
   the level the schedule expects. Week four's counters went dark entirely,
   which is what the blend has to answer for. */
function WeekPanel({ state }) {
  const blended = state === "blend";
  const present = WEEK_NODES.reduce((a, b) => a + b, 0);
  const pWeek = WEEK_NODES.map((n) => n / present);
  const pSched = 0.25;
  const pFinal = pWeek.map((p) => W_IMPUTED * pSched + (1 - W_IMPUTED) * p);

  const LEFT = 104;
  const PLOT_W = 520;
  const SLOT = PLOT_W / STOPS.length;
  const BAR = 38;
  const xAt = (i) => LEFT + i * SLOT + (SLOT - BAR) / 2;
  const axis = [LEFT - 10, LEFT + PLOT_W];

  // Five rows need more height than the other states; the frame is taller for
  // this panel alone and the stylesheet caps it against the viewport.
  const H = 740;
  // One scale for every row, so a week that says it is a third of the month
  // looks like a third of the month.
  const UNIT = 186;
  const MAX_RIDERS = 400;
  const monthBase = 292;
  const weekBases = [392, 480, 568, 656];

  // The month at each stop, fully corrected: what every week below is a share of.
  const month = (value) => (value / C_ROUTE) * C_PRA;

  return (
    <svg className="mth-fig" viewBox={`0 0 ${VB.w} ${H}`}>
      <g style={{ transform: `translateY(${PAD.top - 40}px)` }}>
        <Tex
          x={LEFT - 40}
          y={-16}
          width={VB.w - 2 * (LEFT - 40)}
          height={60}
          size={19}
          align="center"
          color="var(--mth-ink)"
          tex={
            blended
              ? String.raw`r_{\text{week}} = r_{\text{month}}\bigl(\textcolor{#c98500}{w\,p_{\text{sched}}} + \textcolor{#58C4DD}{(1-w)\,p_{\text{week}}}\bigr)`
              : String.raw`r_{\text{week}} = r_{\text{month}}\cdot \textcolor{#58C4DD}{p_{\text{week}}}`
          }
        />
      </g>

      {/* the gold in each week, linked back up the column to the month it is a
          share of. Every segment lives in the gap between one row's baseline
          and the next row's bar, so nothing is drawn across a bar. */}
      <g style={{ opacity: blended ? 1 : 0, transition: `opacity ${FADE} .2s` }} aria-hidden={!blended}>
        {OBSERVED.map((value, i) => weekBases.map((weekBase, row) => {
          const kept = (1 - W_IMPUTED) * pWeek[row];
          const top = weekBase - scale(month(value) * (kept + W_IMPUTED * pSched), UNIT, MAX_RIDERS);
          return (
            <line
              key={`${i}-${row}`}
              className="mth-fig-drop"
              x1={xAt(i) + BAR / 2}
              x2={xAt(i) + BAR / 2}
              y1={(row === 0 ? monthBase : weekBases[row - 1]) + 3}
              y2={top}
            />
          );
        }))}
      </g>

      {/* the month itself */}
      <g style={{ transform: `translateY(${monthBase}px)` }}>
        <Route
          values={OBSERVED}
          width={BAR}
          height={UNIT}
          max={MAX_RIDERS}
          labels={false}
          xAt={xAt}
          axis={axis}
          segmentsAt={(value) => [
            { key: "observed", value, color: COLORS.observed },
            { key: "coverage", value: value * (1 / C_ROUTE - 1), color: COLORS.coverage },
            { key: "calibration", value: (value / C_ROUTE) * (C_PRA - 1), color: COLORS.calibration },
          ]}
        />
        <text className="mth-fig-label" x={LEFT - 22} y={-4} textAnchor="end">{t("figure.theMonth")}</text>
      </g>

      {/* and under it, the weeks */}
      {WEEK_NODES.map((nodes, week) => {
        const kept = blended ? (1 - W_IMPUTED) * pWeek[week] : pWeek[week];
        const fromSchedule = blended ? W_IMPUTED * pSched : 0;
        const last = week === WEEK_NODES.length - 1;
        return (
          <g key={week} style={{ transform: `translateY(${weekBases[week]}px)` }}>
            <Route
              values={OBSERVED}
              width={BAR}
              height={UNIT}
              max={MAX_RIDERS}
              labels={last}
              xAt={xAt}
              axis={axis}
              segmentsAt={(value) => [
                { key: "week", value: month(value) * kept, color: COLORS.observed },
                { key: "schedule", value: month(value) * fromSchedule, color: COLORS.schedule },
              ]}
            />
            <text className="mth-fig-label" x={LEFT - 22} y={-4} textAnchor="end">
              {t("figure.weekN", { n: week + 1 })}</text>
            {blended ? (
              <text className="mth-fig-label" x={LEFT + PLOT_W + 32} y={-2}>
                {t("figure.pctShift", {
                  from: Math.round(pWeek[week] * 100),
                  to: Math.round(pFinal[week] * 100),
                })}
              </text>
            ) : (
              <>
                <Trips present={nodes} total={5} cols={5} gap={16} x={LEFT + PLOT_W + 32} y={-6} braced={false} />
                <text className="mth-fig-label" x={LEFT + PLOT_W + 122} y={-2}>
                  {t("figure.pctOfMonth", { pct: Math.round(pWeek[week] * 100) })}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* after the blend the trip counts are spent; what is left to read is
          how far each week's share moved, under one heading for the column */}
      {blended ? (
        <text className="mth-fig-label" x={LEFT + PLOT_W + 32} y={weekBases[0] - 34}>
          {t("figure.pctOfMonthHeading")}
        </text>
      ) : null}
    </svg>
  );
}
