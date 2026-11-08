"use client";

import { useMemo, useRef, useState } from "react";
import { SEQ_BLUE } from "./ridership-data";
import { T, t } from "../lib/i18n";

const MONTHS = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

function monthLabel(id) {
  const [year, month] = id.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

// Clean axis steps: 1, 2 or 5 times a power of ten, about `count` ticks.
function niceTicks(lo, hi, count) {
  const span = hi - lo || 1;
  const raw = span / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * power).find((candidate) => candidate >= raw);
  const ticks = [];
  for (let t = Math.floor(lo / step) * step; t <= hi + step * 0.999; t += step) ticks.push(t);
  return ticks;
}

function compact(value) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 0 : 1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)}K`;
  return `${Math.round(value)}`;
}

// Time on the blue ramp, oldest month closest to the dark plane and the latest
// the most contrasting. The steps nearest the plane are skipped, since they do
// not read as a dot at all.
const TIME_RAMP = SEQ_BLUE.slice(0, 5).reverse();

/* A connected scatterplot: each month is a dot at its average bus speed (x)
   and its average riders per week (y), joined in time order, so the path shows
   how the two moved together. Colour runs from the plane's end of the ramp to
   the far end through time (see TIME_RAMP), and the first month, April 2020
   and the latest month are labelled. */
export default function RidershipSpeedChart({ series, speed, meta }) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const ramp = TIME_RAMP;
  const timeColor = (t) => ramp[Math.min(ramp.length - 1, Math.round(t * (ramp.length - 1)))];

  const points = useMemo(() => {
    const mphByMonth = new Map((speed?.months || []).map((entry) => [entry.month, entry.mph]));
    const byMonth = new Map();
    meta.weeks.forEach((label, w) => {
      const month = label.slice(0, 7);
      const entry = byMonth.get(month) || { month, sum: 0, count: 0 };
      entry.sum += series.real[w] + series.imp[w];
      entry.count += 1;
      byMonth.set(month, entry);
    });
    return [...byMonth.values()]
      .map((entry) => ({ month: entry.month, mph: mphByMonth.get(entry.month), riders: entry.sum / entry.count }))
      .filter((p) => Number.isFinite(p.mph));
  }, [series, speed, meta]);

  if (!speed) return <p className="hint">{t("speedChart.loading")}</p>;
  if (points.length < 2) return <p className="hint">{t("speedChart.empty")}</p>;

  const size = 440;
  const pad = { left: 52, right: 16, top: 14, bottom: 40 };
  const inner = { w: size - pad.left - pad.right, h: size - pad.top - pad.bottom };
  const xTicks = niceTicks(Math.min(...points.map((p) => p.mph)), Math.max(...points.map((p) => p.mph)), 5);
  const yTicks = niceTicks(0, Math.max(...points.map((p) => p.riders)), 5);
  const xLo = xTicks[0];
  const xHi = xTicks[xTicks.length - 1];
  const yHi = yTicks[yTicks.length - 1];
  const x = (mph) => pad.left + ((mph - xLo) / (xHi - xLo || 1)) * inner.w;
  const y = (riders) => pad.top + (1 - riders / (yHi || 1)) * inner.h;
  const last = points.length - 1;
  const labelled = [
    [0, monthLabel(points[0].month)],
    [points.findIndex((p) => p.month === "2020-04"), "April 2020"],
    [last, monthLabel(points[last].month)],
  ].filter(([index]) => index > 0 || index === 0);

  const onMove = (event) => {
    const box = svgRef.current.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * size;
    const py = ((event.clientY - box.top) / box.height) * size;
    let best = null;
    let bestDistance = Infinity;
    points.forEach((p, index) => {
      const distance = Math.hypot(x(p.mph) - px, y(p.riders) - py);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    setHover(bestDistance <= 24 ? best : null);
  };

  const active = hover !== null ? points[hover] : null;

  return (
    <div className="rs-chart square">
      <div className="rs-legend" aria-hidden="true">
        <span className="rs-time">
          {points[0].month.slice(0, 4)}
          <i className="rs-time-ramp" style={{ background: `linear-gradient(90deg, ${ramp.join(",")})` }} />
          {points[last].month.slice(0, 4)}
        </span>
      </div>
      <div className="rs-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          className="rs-svg"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={x(t)} x2={x(t)} y1={pad.top} y2={pad.top + inner.h} className="rs-grid" />
              <text x={x(t)} y={pad.top + inner.h + 14} textAnchor="middle" className="rs-tick">{t}</text>
            </g>
          ))}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={pad.left} x2={pad.left + inner.w} y1={y(t)} y2={y(t)} className="rs-grid" />
              <text x={pad.left - 6} y={y(t) + 3} textAnchor="end" className="rs-tick">{compact(t)}</text>
            </g>
          ))}
          <text x={pad.left + inner.w / 2} y={size - 6} textAnchor="middle" className="rs-title">
            {t("speedChart.axisSpeed")}
          </text>
          <text
            x={12}
            y={pad.top + inner.h / 2}
            textAnchor="middle"
            className="rs-title"
            transform={`rotate(-90 12 ${pad.top + inner.h / 2})`}
          >
            {t("speedChart.axisRiders")}
          </text>

          {points.slice(1).map((p, i) => (
            <line
              key={`s${p.month}`}
              x1={x(points[i].mph)}
              y1={y(points[i].riders)}
              x2={x(p.mph)}
              y2={y(p.riders)}
              className="rs-segment"
              style={{ stroke: timeColor((i + 1) / last) }}
            />
          ))}
          {points.map((p, index) => (
            <circle
              key={p.month}
              cx={x(p.mph)}
              cy={y(p.riders)}
              r={hover === index ? 5.5 : 4}
              className="rs-point"
              style={{ fill: timeColor(index / last) }}
            />
          ))}
          {labelled.map(([index, text]) => {
            const p = points[index];
            const right = x(p.mph) < pad.left + inner.w * 0.7;
            return (
              <text
                key={`l${index}`}
                x={x(p.mph) + (right ? 8 : -8)}
                y={y(p.riders) - 7}
                textAnchor={right ? "start" : "end"}
                className="rs-label"
              >
                {text}
              </text>
            );
          })}
          <rect x={pad.left} y={pad.top} width={inner.w} height={inner.h} className="rs-hit" />
        </svg>
        {active ? (
          <div
            className="rs-tooltip"
            style={{
              left: `${Math.min(78, Math.max(22, (x(active.mph) / size) * 100))}%`,
              top: `${Math.max(0, (y(active.riders) / size) * 100 - 28)}%`,
            }}
          >
            <div className="rs-tooltip-title">{monthLabel(active.month)}</div>
            <div><T id="speedChart.tooltipSpeed" c={[<b />]} vars={{ mph: active.mph.toFixed(1) }} /></div>
            <div><T id="speedChart.tooltipRiders" c={[<b />]}
              vars={{ riders: Math.round(active.riders).toLocaleString("en-US") }} /></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
