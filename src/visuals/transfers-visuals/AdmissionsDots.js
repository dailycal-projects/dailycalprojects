import React, { useEffect, useRef, useState } from 'react';
import {
  color, format, max, min, sum, scaleLinear, scaleSqrt,
} from 'd3';
import useHoverCard from './useHoverCard';
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
  // Place higher-GPA majors first. Within 15 percentage points on x,
  // subsequent lower-GPA majors must stay below their higher-GPA neighbors.
  const dots = [];
  [...plotted].sort((a, b) => b.gpa - a.gpa || a.id.localeCompare(b.id)).forEach((major) => {
    const cx = x(major.value);
    const r = radius(major.size);
    let cy = y(major.gpa);
    dots.forEach((dot) => {
      const dx = Math.abs(dot.x - cx);
      const separation = dot.r + r + 3;
      if (dx < separation) {
        cy = Math.max(cy, dot.y + Math.sqrt(separation ** 2 - dx ** 2));
      } else if (Math.abs(dot.value - major.value) <= 0.15 && major.gpa < dot.gpa) {
        cy = Math.max(cy, dot.y + 2);
      }
    });
    dots.push({
      ...major, x: cx, y: cy, r,
    });
  });
  const height = Math.max(baseHeight, Math.ceil(max(dots, (dot) => dot.y + dot.r)) + 65) + 30;
  return {
    items, dots, height,
  };
}
const charts = Object.fromEntries(Object.entries(admissions.campuses).map(([name, data]) => [name, makeChart(data.majors)]));

const campuses = ['Berkeley', 'Davis', 'Irvine', 'Los Angeles', 'Merced', 'Riverside', 'San Diego', 'Santa Barbara', 'Santa Cruz'];

// Keep the canvas steady while campus datasets crossfade.
const chartHeight = max(Object.values(charts), (chart) => chart.height);

export default function AdmissionsDots({ sourceNotes }) {
  const [campus, setCampus] = useState('Berkeley');
  const [query, setQuery] = useState('');
  const [testRunning, setTestRunning] = useState(true);
  const [outgoingCampus, setOutgoingCampus] = useState(null);
  useEffect(() => {
    if (!testRunning) return undefined;
    const timer = setTimeout(() => {
      setOutgoingCampus(campus);
      setCampus(campuses[(campuses.indexOf(campus) + 1) % campuses.length]);
    }, 2500);
    return () => clearTimeout(timer);
  }, [testRunning, campus]);
  useEffect(() => {
    if (!outgoingCampus) return undefined;
    const timer = setTimeout(() => setOutgoingCampus(null), 350);
    return () => clearTimeout(timer);
  }, [outgoingCampus]);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  useEffect(() => {
    if (testRunning || hovered || query.trim()) return undefined;
    const timer = setTimeout(() => {
      setSelected(null);
      setTestRunning(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [campus, testRunning, hovered, query]);
  const [hintDismissed, setHintDismissed] = useState(false);
  const hoverDot = (id) => {
    setTestRunning(false);
    setOutgoingCampus(null);
    setHovered(id);
    setHintDismissed(true);
  };
  const hintTextRef = useRef(null);
  const [hintWidth, setHintWidth] = useState(240);
  useEffect(() => {
    if (hintTextRef.current) setHintWidth(hintTextRef.current.getComputedTextLength() + 20);
  }, [campus, hintDismissed]);
  const chart = charts[campus];
  const items = chart?.items || [];
  const dots = chart?.dots || [];
  const height = chartHeight;
  const search = query.trim().toLowerCase();
  const matches = (m) => `${m.name} ${m.school} ${m.colorKey}`.toLowerCase().includes(search);
  const activeId = testRunning ? null : hovered || selected;
  const active = dots.find((m) => m.id === activeId);
  const { card, exiting } = useHoverCard(active ? { ...active, campus } : null, active ? `${campus}/${active.id}` : null);
  const hintMajor = campus === 'Berkeley' && !testRunning && !hintDismissed ? dots.find((m) => m.name === 'Applied Mathematics') : null;
  const selectedMajor = dots.find((m) => m.id === selected);
  const clear = () => { setSelected(null); setHovered(null); };
  const shown = items.filter(matches);
  return (
    <section className="admissions-dots" aria-label="Transfer admission rates by major">
      <h2 className="admissions-heading">
        Latest transfer admissions rates for
        {' '}
        <span className="admissions-campus-select">
          <span key={campus} className={testRunning ? 'admissions-campus-in' : undefined} aria-hidden={!testRunning}>{`UC ${campus}`}</span>
          {outgoingCampus && <span className="admissions-campus-out" aria-hidden="true">{`UC ${outgoingCampus}`}</span>}
          {!testRunning && (
          <select aria-label="UC campus" value={campus} onChange={(e) => { setCampus(e.target.value); setOutgoingCampus(null); setQuery(''); clear(); }}>
            {campuses.map((name) => <option key={name} value={name}>{`UC ${name}`}</option>)}
          </select>
          )}

        </span>
      </h2>
      {chart ? (
        <>
          <div className="admissions-controls">
            <label className="admissions-search" htmlFor="admission-dots-search">
              Filter by major
              <input id="admission-dots-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setTestRunning(false); }} placeholder="Try Engineering or Psychology" />
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
                    {!testRunning && <line x1={x(v)} x2={x(v)} y1={50} y2={height - 65} stroke="#d1d0ce" strokeDasharray="4 5" />}
                    <line x1={x(v)} x2={x(v)} y1={height - 65} y2={height - 59} stroke="#888" />
                    <text x={x(v)} y={height - 40} textAnchor="middle">{format('.0%')(v)}</text>
                  </g>
                ))}
                <text className="admissions-axis-title" transform={`translate(30,${(50 + height - 65) / 2}) rotate(-90)`} textAnchor="middle">← GPA range midpoint →</text>
                {outgoingCampus && (
                <g key={`outgoing-${outgoingCampus}`} className="admissions-dots-out" pointerEvents="none" aria-hidden="true">
                  {charts[outgoingCampus].dots.map((m) => <circle key={m.id} cx={m.x} cy={m.y} r={m.r} fill={majorColor(m.colorKey)} fillOpacity={0.86} stroke={color(majorColor(m.colorKey)).darker(0.9).formatHex()} strokeWidth={1.8} />)}
                </g>
                )}
                <g key={campus} className={testRunning ? 'admissions-dots-in' : undefined}>
                  {dots.map((m) => (
                    <circle key={m.id} cx={m.x} cy={m.y} r={m.r} fill={majorColor(m.colorKey)} fillOpacity={matches(m) ? 0.86 : 0.1} opacity={active && active.id !== m.id ? 0.5 : 1} stroke={active?.id === m.id ? '#172e40' : color(majorColor(m.colorKey)).darker(0.9).formatHex()} strokeWidth={active?.id === m.id ? 3 : 1.8} tabIndex={matches(m) ? 0 : -1} role="button" aria-label={`${m.name}${m.school ? `, ${m.school}` : ''}: ${number(m.admits)} of ${number(m.applicants)} admitted, ${percent(m.value)}, GPA range midpoint ${format('.2f')(m.gpa)}`} aria-pressed={selected === m.id} onMouseEnter={() => hoverDot(m.id)} onMouseLeave={() => setHovered(null)} onFocus={() => hoverDot(m.id)} onBlur={() => setHovered(null)} onClick={() => { setSelected(selected === m.id ? null : m.id); hoverDot(m.id); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === m.id ? null : m.id); } if (e.key === 'Escape') clear(); }} />
                  ))}
                </g>
                {hintMajor && (
                  <g className="admissions-hover-hint" pointerEvents="none" aria-hidden="true">
                    <defs>
                      <marker id="admissions-hint-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M1,1 L9,5 L1,9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </marker>
                    </defs>
                    <path d={`M430,${height * 0.46} C390,${height * 0.46} ${hintMajor.x - 5},${height * 0.43} ${hintMajor.x},${hintMajor.y + hintMajor.r + 8}`} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#admissions-hint-arrow)" />
                    <rect x={440} y={height * 0.46 - 19} width={hintWidth} height={36} rx={3} fill="white" fillOpacity="0.9" />
                    <text ref={hintTextRef} x={450} y={height * 0.46 + 4}>Hover on a dot to see details</text>
                  </g>
                )}
                <text className="admissions-axis-title" x={467} y={height - 10} textAnchor="middle">Admission rate</text>
              </svg>
              {card && (
              <div
                key={card.id}
                className={`admissions-tooltip${card.name === 'Computer Science' && card.campus === 'Berkeley' ? ' is-wide' : ''}${exiting ? ' is-exiting' : ''}`}
                style={{
                  left: card.x <= 450 ? `calc(${((card.x + card.r + 1.5) / 900) * 100}% + 12px)` : undefined,
                  right: card.x > 450 ? `calc(${((900 - card.x + card.r + 1.5) / 900) * 100}% + 12px)` : undefined,
                  top: `${Math.max(8, Math.min(65, (card.y / height) * 100 - 8))}%`,
                }}
              >
                <strong>{`${card.name} at UC ${card.campus}`}</strong>
                {card.school && <span><em>{card.colorKey === 'Other' && card.school.toLowerCase() === 'not applicable' ? 'Other' : card.school}</em></span>}
                <span>
                  {`${number(card.admits)} / ${number(card.applicants)} admitted (`}
                  <b>{percent(card.value)}</b>
                  )
                </span>
                <span>{`Admitted GPA: ${card.admitGpa}`}</span>

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
            <p>{`${number(selectedMajor.admits)} admitted out of ${number(selectedMajor.applicants)} applicants (${percent(selectedMajor.value)}). ${number(selectedMajor.enrollees)} enrolled.${selectedMajor.admitGpa ? ` Admitted-student GPA IQR: ${selectedMajor.admitGpa}.` : ''}`}</p>
          </div>
          )}
          <button
            className="admissions-hover-test"
            type="button"
            aria-pressed={testRunning}
            onClick={() => {
              clear();
              if (testRunning) {
                setTestRunning(false);
                setOutgoingCampus(null);
              } else {
                setQuery('');
                setHintDismissed(true);
                setTestRunning(true);
              }
            }}
          >
            {testRunning ? 'Stop campus test' : 'Test campus sequence'}
          </button>
          {sourceNotes && (
            <div className="admissions-method">
              <p>
                {typeof sourceNotes === 'function' ? sourceNotes({
                  campus,
                  majorCount: items.length,
                  admitCount: sum(items, (m) => m.admits),
                  applicantCount: sum(items, (m) => m.applicants),
                }) : sourceNotes}
              </p>
            </div>
          )}
        </>
      ) : <p className="admissions-empty" role="status">{`Major-level admissions data for UC ${campus} has not been added yet.`}</p>}
    </section>
  );
}
