import React, { useMemo, useState } from 'react';
import {
  format, group, max, scaleLinear, sum,
} from 'd3';
import data from './data.json';
import './college-pathways.css';

const count = format(',');
const percent = format('.1%');
const pretty = (name) => (name.trim() ? name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Unspecified field');
const campuses = {
  UCB: { name: 'Berkeley', color: '#0072b2' },
  UCD: { name: 'Davis', color: '#a6761d' },
  UCI: { name: 'Irvine', color: '#009e73' },
  UCLA: { name: 'Los Angeles', color: '#8054a6' },
  UCM: { name: 'Merced', color: '#777777' },
  UCR: { name: 'Riverside', color: '#d55e00' },
  UCSB: { name: 'Santa Barbara', color: '#dca51b' },
  UCSC: { name: 'Santa Cruz', color: '#c16691' },
  UCSD: { name: 'San Diego', color: '#253d4e' },
};

export function collegeRows(year) {
  const rows = data.rows.filter((row) => row[1] === year);
  return Array.from(group(rows, (row) => row[0]), ([id, cells]) => {
    const destinations = Array.from(group(cells, (row) => row[2]), ([campus, records]) => ({
      campus: data.campuses[campus],
      value: sum(records, (row) => row[5]),
      fields: Array.from(group(records, (row) => row[4]), ([major, observations]) => ({
        name: pretty(data.majors[major]), value: sum(observations, (row) => row[5]),
      })).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)),
    })).sort((a, b) => data.campuses.indexOf(a.campus) - data.campuses.indexOf(b.campus));
    return {
      id, name: pretty(data.colleges[id]), total: sum(destinations, (d) => d.value), destinations,
    };
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

export default function CollegePathways({ sourceNotes }) {
  const [year, setYear] = useState(data.years.length - 1);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('counts');
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const rows = useMemo(() => collegeRows(year), [year]);
  const filtered = rows.filter((row) => row.name.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = filtered.slice(0, 15);
  const height = 90 + visible.length * 46;
  const x = scaleLinear().domain([0, mode === 'share' ? 1 : max(visible, (row) => row.total) || 1]).nice().range([0, 520]);
  const segments = visible.flatMap((college, index) => {
    let offset = 0;
    return college.destinations.map((destination) => {
      const amount = mode === 'share' ? destination.value / college.total : destination.value;
      const segment = {
        ...destination, college, index, x: 310 + x(offset), width: x(amount), key: `${college.id}-${destination.campus}`,
      };
      offset += amount;
      return segment;
    });
  });
  const active = segments.find((segment) => segment.key === (hovered || selected));
  const chosen = segments.find((segment) => segment.key === selected);
  const clear = () => { setHovered(null); setSelected(null); };
  return (
    <section className="college-pathways" aria-label="Community college transfer destinations">
      <h2>Where community college transfers enroll</h2>
      <p className="college-pathways-intro">Each bar is a community college, split by UC destination. Compare published enrollment counts or the campus mix.</p>
      <div className="college-pathways-controls">
        <label htmlFor="pathways-search">
          Filter by community college
          <input id="pathways-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); clear(); }} placeholder="Try Diablo Valley or Berkeley City" />
        </label>
        <label htmlFor="pathways-year">
          Academic year
          <select id="pathways-year" value={year} onChange={(e) => { setYear(+e.target.value); clear(); }}>{data.years.map((name, index) => <option key={name} value={index}>{name}</option>)}</select>
        </label>
      </div>
      <div className="college-pathways-modes" aria-label="Chart measure">
        <button type="button" aria-pressed={mode === 'counts'} onClick={() => setMode('counts')}>Enrollment counts</button>
        <button type="button" aria-pressed={mode === 'share'} onClick={() => setMode('share')}>Campus mix</button>
      </div>
      <div className="college-pathways-legend">
        {Object.entries(campuses).map(([code, campus]) => (
          <span key={code}>
            <i style={{ background: campus.color }} />
            {campus.name}
          </span>
        ))}
      </div>
      <p className="college-pathways-caption">
        {query ? 'Matching colleges' : 'The 15 largest published college totals across UC'}
        . Hover or select a segment for its fields of study.
      </p>
      {visible.length ? (
        <div className="college-pathways-scroll">
          <div className="college-pathways-canvas" style={{ aspectRatio: `900 / ${height}` }}>
            <svg viewBox={`0 0 900 ${height}`} role="group" aria-label={`Published community college transfer enrollments, ${data.years[year]}`}>
              {x.ticks(5).map((value) => (
                <g key={value}>
                  <line x1={310 + x(value)} x2={310 + x(value)} y1={15} y2={height - 65} stroke="#ddd" strokeDasharray="4 5" />
                  <text x={310 + x(value)} y={height - 40} textAnchor="middle">{mode === 'share' ? format('.0%')(value) : count(value)}</text>
                </g>
              ))}
              <line x1={310} x2={830} y1={height - 65} y2={height - 65} stroke="#888" />
              {visible.map((college, index) => (
                <g key={college.id}>
                  <text x={298} y={34 + index * 46} textAnchor="end">{college.name.length > 34 ? `${college.name.slice(0, 32)}…` : college.name}</text>
                  {mode === 'counts' && <text x={840} y={34 + index * 46}>{count(college.total)}</text>}
                </g>
              ))}
              {segments.map((segment) => <rect key={segment.key} x={segment.x} y={16 + segment.index * 46} width={segment.width} height={28} fill={campuses[segment.campus].color} stroke={active?.key === segment.key ? '#111' : 'white'} strokeWidth={active?.key === segment.key ? 2 : 0.7} tabIndex={0} role="button" aria-pressed={selected === segment.key} aria-label={`${segment.college.name}, ${campuses[segment.campus].name}: ${count(segment.value)} published enrollees, ${percent(segment.value / segment.college.total)} of published college total`} onMouseEnter={() => setHovered(segment.key)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(segment.key)} onBlur={() => setHovered(null)} onClick={() => setSelected(selected === segment.key ? null : segment.key)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === segment.key ? null : segment.key); } if (e.key === 'Escape') clear(); }} />)}
              <text className="college-pathways-axis" x={570} y={height - 8} textAnchor="middle">{mode === 'share' ? 'Share of published college enrollment' : 'Published transfer enrollments'}</text>
            </svg>
            {active && (
            <div className="college-pathways-tooltip" style={{ top: `${Math.max(0, Math.min(70, ((active.index * 46 + 45) / height) * 100))}%`, left: `${Math.min(64, Math.max(34, (active.x / 900) * 100))}%` }}>
              <strong>{active.college.name}</strong>
              <em>{`UC ${campuses[active.campus].name}`}</em>
              <span>
                {count(active.value)}
                {' '}
                published enrollees ·
                {' '}
                <b>{percent(active.value / active.college.total)}</b>
                {' '}
                of published college total
              </span>
              {active.fields.slice(0, 3).map((field) => (
                <span key={field.name}>
                  {field.name}
                  :
                  {' '}
                  {count(field.value)}
                </span>
              ))}
            </div>
            )}
          </div>
        </div>
      ) : (
        <p role="status">
          No published college observations match this search in
          {data.years[year]}
          .
        </p>
      )}
      {chosen && (
      <div className="college-pathways-detail">
        <button type="button" onClick={clear}>Clear selection</button>
        <h3>
          {chosen.college.name}
          {' '}
          → UC
          {' '}
          {campuses[chosen.campus].name}
        </h3>
        <ul>
          {chosen.fields.map((field) => (
            <li key={field.name}>
              <span>{field.name}</span>
              <b>{count(field.value)}</b>
            </li>
          ))}
        </ul>
      </div>
      )}
      {sourceNotes && <p className="college-pathways-source">{sourceNotes}</p>}
    </section>
  );
}
