import { quantile } from "../stats";
import { strings } from "../strings";

const MAX_DOTS = 160;
const MIN_FOR_BOX = 20; // fewer values than this: dots only, no box and whiskers

/** Thin unlabeled box-and-whiskers with values as dots and a red "you" line.
 * For big pools the scale spans the whiskers (and you), so a few $10k outliers don't squash everyone else. */
export function BoxStrip({ values, you }: { values: number[]; you: number }) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const med = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const loW = sorted.find((v) => v >= q1 - 1.5 * iqr) ?? sorted[0];
  const hiW = [...sorted].reverse().find((v) => v <= q3 + 1.5 * iqr) ?? sorted[sorted.length - 1];
  // small pools: show every value; big pools: trim to the whiskers
  const all = sorted.length < 30;
  const lo = Math.min(all ? sorted[0] : loW, you);
  const hi = Math.max(all ? sorted[sorted.length - 1] : hiW, you);
  const pad = (hi - lo) * 0.04 || 50;
  const pos = (v: number) => ((v - lo + pad) / (hi - lo + 2 * pad)) * 100;
  const x = (v: number) => `${pos(v).toFixed(2)}%`;
  const youPct = pos(you);
  const labelX = youPct < 6 ? 15 : youPct > 94 ? -15 : 0;
  const inRange = sorted.filter((v) => v >= lo - pad && v <= hi + pad);
  const step = Math.max(1, Math.ceil(inRange.length / MAX_DOTS));
  return (
    <svg className="boxstrip" width="100%" height="48" role="img" aria-label={strings.chart.spreadLabel}>
      {sorted.length >= MIN_FOR_BOX ? (
        <>
          <line x1={x(loW)} x2={x(hiW)} y1="32" y2="32" className="bs-whisker" />
          <line x1={x(loW)} x2={x(loW)} y1="27" y2="37" className="bs-whisker" />
          <line x1={x(hiW)} x2={x(hiW)} y1="27" y2="37" className="bs-whisker" />
          <rect x={x(q1)} width={`${Math.max(0.4, pos(q3) - pos(q1))}%`} y="25" height="14" rx="3" className="bs-box" />
          <line x1={x(med)} x2={x(med)} y1="25" y2="39" className="bs-median" />
        </>
      ) : (
        <line x1="0" x2="100%" y1="32" y2="32" className="bs-track" />
      )}
      {inRange.map((v, i) =>
        i % step ? null : <circle key={i} cx={x(v)} cy={sorted.length < MIN_FOR_BOX ? 32 : 26 + ((i * 7919) % 13)} r={sorted.length < MIN_FOR_BOX ? 4 : 2.3} className="bs-dot" />,
      )}
      <line x1={x(you)} x2={x(you)} y1="18" y2="46" className="bs-you" />
      <svg x={x(you)} y="0" overflow="visible">
        <rect x={labelX - 16} y="0" width="32" height="17" rx="8.5" className="bs-you-pill" />
        <text x={labelX} y="12.5" textAnchor="middle" className="bs-you-label">
          {strings.you}
        </text>
      </svg>
    </svg>
  );
}
