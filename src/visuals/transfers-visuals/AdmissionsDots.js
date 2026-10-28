import React, { useState } from 'react';
import {
  color, format, max, min, sum, scaleLinear, scaleSqrt,
} from 'd3';
import admissions from './admissions.json';
import './admissions-dots.css';

const number = format(',');
const percent = format('.1%');

// Fixed, separated hues for the six displayed major groups.
const categoryColors = {
  'Arts & Humanities': '#8054a6',
  'Engineering & Computing': '#0072b2',
  'Life Sciences & Health': '#009e73',
  'Physical Sciences & Math': '#e69f00',
  'Social Sciences & Public Affairs': '#d55e00',
  Other: '#777777',
};

const majorColor = (category) => categoryColors[category];

// The midpoint describes the published range, not the average student's GPA.
function gpaMidpoint(range) {
  const bounds = range?.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/);
  return bounds ? (Number(bounds[1]) + Number(bounds[2])) / 2 : null;
}

// Editorial display groups; original source disciplines remain in admissions.json.
const disciplineGroups = {
  'Arts & Humanities': 'Arts & Humanities',
  'Computer Science': 'Engineering & Computing',
  Engineering: 'Engineering & Computing',
  'Life Sciences': 'Life Sciences & Health',
  'Public Health': 'Life Sciences & Health',
  Nursing: 'Life Sciences & Health',
  Pharmacy: 'Life Sciences & Health',
  'Other Health Science': 'Life Sciences & Health',
  'Physical Sciences/Math': 'Physical Sciences & Math',
  'Social Sciences': 'Social Sciences & Public Affairs',
  'Public Admin': 'Social Sciences & Public Affairs',
  Education: 'Social Sciences & Public Affairs',
};
const categoryFor = (discipline) => disciplineGroups[discipline] || 'Other';

const categories = Object.keys(categoryColors);
const x = scaleLinear().domain([0, 1]).range([78, 856]);
const baseHeight = 560;

// Cache each campus layout once; searching only highlights its dots.
function makeChart(majors) {
  const items = majors.filter((m) => m.applicants > 0 && m.admits !== null).map((m) => ({
    ...m, id: `${m.school}/${m.name}`, colorKey: categoryFor(m.discipline), value: m.admits / m.applicants, size: m.applicants, gpa: gpaMidpoint(m.admitGpa),
  }));
  const radius = scaleSqrt().domain([0, max(items, (m) => m.size)]).range([4, 23]);
  const plotted = items.filter((m) => m.gpa !== null);
  const y = scaleLinear()
    .domain([Math.floor(min(plotted, (m) => m.gpa) * 10) / 10 - 0.05, Math.ceil(max(plotted, (m) => m.gpa) * 10) / 10 + 0.05])
    .range([baseHeight - 65, 50]);
  // Keep admission rates exact; choose the closest collision-free vertical
  // position to each GPA midpoint. Large dots settle first, with stable ties.
  const dots = [];
  [...plotted].sort((a, b) => b.size - a.size || a.id.localeCompare(b.id)).forEach((major) => {
    const cx = x(major.value);
    const preferred = y(major.gpa);
    const r = radius(major.size);
    const nearby = dots.filter((dot) => Math.abs(dot.x - cx) < dot.r + r + 3);
    const candidates = [preferred];
    nearby.forEach((dot) => {
      const distance = Math.sqrt((dot.r + r + 3) ** 2 - (dot.x - cx) ** 2);
      candidates.push(dot.y - distance, dot.y + distance);
    });
    candidates.sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
    const cy = candidates.find((candidate) => nearby.every((dot) => Math.hypot(dot.x - cx, dot.y - candidate) >= dot.r + r + 2.9));
    dots.push({
      ...major, x: cx, y: cy, r,
    });
  });

  // Place higher-GPA majors first. Within 15 percentage points on x,
  // subsequent lower-GPA majors must stay below their higher-GPA neighbors.
  const orderedDots = [];
  [...plotted].sort((a, b) => b.gpa - a.gpa || a.id.localeCompare(b.id)).forEach((major) => {
    const cx = x(major.value);
    const r = radius(major.size);
    let cy = y(major.gpa);
    orderedDots.forEach((dot) => {
      const dx = Math.abs(dot.x - cx);
      const separation = dot.r + r + 3;
      if (dx < separation) {
        cy = Math.max(cy, dot.y + Math.sqrt(separation ** 2 - dx ** 2));
      } else if (Math.abs(dot.value - major.value) <= 0.15 && major.gpa < dot.gpa) {
        cy = Math.max(cy, dot.y + 2);
      }
    });
    orderedDots.push({
      ...major, x: cx, y: cy, r,
    });
  });
  const orderedHeight = Math.max(baseHeight, Math.ceil(max(orderedDots, (dot) => dot.y + dot.r)) + 65) + 30;
  return {
    items, dots, orderedDots, orderedHeight,
  };
}
const charts = Object.fromEntries(Object.entries(admissions.campuses).map(([name, data]) => [name, makeChart(data.majors)]));

const campuses = ['Berkeley', 'Davis', 'Irvine', 'Los Angeles', 'Merced', 'Riverside', 'San Diego', 'Santa Barbara', 'Santa Cruz'];

export default function AdmissionsDots() {
  const [campus, setCampus] = useState('Berkeley');
  const [layout, setLayout] = useState('ordered');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const chart = charts[campus];
  const items = chart?.items || [];
  const dots = (layout === 'ordered' ? chart?.orderedDots : chart?.dots) || [];
  const height = layout === 'ordered' ? chart?.orderedHeight || baseHeight : baseHeight;
  const search = query.trim().toLowerCase();
  const matches = (m) => `${m.name} ${m.school} ${m.colorKey}`.toLowerCase().includes(search);
  const active = dots.find((m) => m.id === (hovered || selected));
  const selectedMajor = dots.find((m) => m.id === selected);
  const clear = () => { setSelected(null); setHovered(null); };
  const shown = items.filter(matches);
  return (
    <section className="admissions-dots" aria-label="Transfer admission rates by major">
      <h2 className="admissions-heading">
        Latest transfer admissions rates for
        {' '}
        <span className="admissions-campus-select">
          <span aria-hidden="true">{`UC ${campus}`}</span>
          <select aria-label="UC campus" value={campus} onChange={(e) => { setCampus(e.target.value); setQuery(''); clear(); }}>
            {campuses.map((name) => <option key={name} value={name}>{`UC ${name}`}</option>)}
          </select>
        </span>
      </h2>
      {chart ? (
        <>
          <div className="admissions-controls">
            <label className="admissions-search" htmlFor="admission-dots-search">
              Filter by major
              <input id="admission-dots-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try Engineering or Psychology" />
            </label>
          </div>
          <div className="admissions-legend" aria-label="Major group colors">
            {categories.map((name) => (
              <span key={name}>
                <i style={{ background: majorColor(name) }} />
                {name}
              </span>
            ))}
          </div>
          <div className="admissions-scroll">
            <div className="admissions-canvas" style={{ aspectRatio: `900 / ${height}` }}>
              <svg viewBox={`0 0 900 ${height}`} role="group" aria-label="Admission rate versus midpoint of admitted-student GPA range">
                <line x1={78} x2={856} y1={height - 65} y2={height - 65} stroke="#888" />
                {x.ticks(10).map((v) => (
                  <g key={v}>
                    <line x1={x(v)} x2={x(v)} y1={50} y2={height - 65} stroke="#d1d0ce" strokeDasharray="4 5" />
                    <line x1={x(v)} x2={x(v)} y1={height - 65} y2={height - 59} stroke="#888" />
                    <text x={x(v)} y={height - 40} textAnchor="middle">{format('.0%')(v)}</text>
                  </g>
                ))}
                <text className="admissions-axis-title" transform={`translate(30,${(50 + height - 65) / 2}) rotate(-90)`} textAnchor="middle">← GPA range midpoint →</text>
                {dots.map((m) => (
                  <circle key={m.id} cx={m.x} cy={m.y} r={m.r} fill={majorColor(m.colorKey)} fillOpacity={matches(m) ? 0.86 : 0.1} stroke={active?.id === m.id ? '#172e40' : color(majorColor(m.colorKey)).darker(0.9).formatHex()} strokeWidth={active?.id === m.id ? 3 : 1.8} tabIndex={matches(m) ? 0 : -1} role="button" aria-label={`${m.name}${m.school ? `, ${m.school}` : ''}: ${number(m.admits)} of ${number(m.applicants)} admitted, ${percent(m.value)}, GPA range midpoint ${format('.2f')(m.gpa)}`} aria-pressed={selected === m.id} onMouseEnter={() => setHovered(m.id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(m.id)} onBlur={() => setHovered(null)} onClick={() => setSelected(selected === m.id ? null : m.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === m.id ? null : m.id); } if (e.key === 'Escape') clear(); }} />
                ))}
                <text className="admissions-axis-title" x={467} y={height - 10} textAnchor="middle">Admission rate</text>
              </svg>
              {active && (
              <div className="admissions-tooltip" style={{ left: `${Math.max(1, Math.min(65, (active.x / 900) * 100 + (active.x > 580 ? -33 : 2)))}%`, top: `${Math.max(8, Math.min(65, (active.y / height) * 100 - 8))}%` }}>
                <strong>{active.name}</strong>
                {active.school && <span>{active.school}</span>}
                <span>
                  {`${number(active.admits)} / ${number(active.applicants)} admitted (`}
                  <b>{percent(active.value)}</b>
                  )
                </span>
                <span>{`Admitted GPA: ${active.admitGpa}`}</span>

              </div>
              )}
            </div>
          </div>
          {!shown.length && <p role="status">No matches. Try a different search.</p>}
          {selectedMajor && (
          <div className="admissions-detail" aria-live="polite">
            <div className="admissions-detail-heading">
              <h4>
                <i style={{ background: majorColor(selectedMajor.colorKey) }} />
                {selectedMajor.name}
              </h4>
              <button type="button" onClick={clear}>Clear selection</button>
            </div>
            <p>{`${number(selectedMajor.admits)} admitted out of ${number(selectedMajor.applicants)} applicants (${percent(selectedMajor.value)}). ${number(selectedMajor.enrollees)} enrolled.${selectedMajor.admitGpa ? ` Admitted-student GPA range: ${selectedMajor.admitGpa}.` : ''}`}</p>
          </div>
          )}
          <button className="admissions-layout-toggle" type="button" onClick={() => { setLayout(layout === 'ordered' ? 'compact' : 'ordered'); clear(); }}>
            {layout === 'ordered' ? 'Compare compact layout' : 'Show GPA-ordered layout'}
          </button>
          <details className="admissions-method">
            <summary>Source notes</summary>
            <p>
              UC admissions exports; year unspecified. Rates are admits divided by applicants. Vertical positions follow the admitted GPA range midpoint and shift to avoid overlapping dots. The GPA-ordered layout keeps higher-midpoint majors above lower-midpoint majors within 15 percentage points of admission rate. Exact midpoints appear on hover; they are not mean GPAs. Majors without a published range are omitted from the plot.
              {`The ${items.length} published major rows cover ${number(sum(items, (m) => m.admits))} admits and ${number(sum(items, (m) => m.applicants))} applicants.`}
            </p>
          </details>
        </>
      ) : <p className="admissions-empty" role="status">{`Major-level admissions data for UC ${campus} has not been added yet.`}</p>}
    </section>
  );
}
