import React, { useMemo, useState } from 'react';
import {
  curveMonotoneX, format, hierarchy, line, max, rollups, scaleLinear, scaleSequential, interpolateBlues, sum, treemap,
} from 'd3';
import data from './data.json';
import './transfers.css';

const count = format(',');
const pct = format('.0%');
const BLUE = '#174b70';
const GOLD = '#be811c';
const colors = ['#174b70', '#be811c', '#497c68', '#976477', '#647eb5', '#a35433', '#777343', '#705898', '#32868c'];
const names = {
  UCB: 'Berkeley', UCD: 'Davis', UCI: 'Irvine', UCLA: 'Los Angeles', UCM: 'Merced', UCR: 'Riverside', UCSB: 'Santa Barbara', UCSC: 'Santa Cruz', UCSD: 'San Diego',
};
const pretty = (s) => (s.trim() ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unspecified CIP label');
const total = (rows) => sum(rows, (r) => r[5]);
const grouped = (rows, key) => rollups(rows, total, (r) => r[key]).map(([id, value]) => ({ id, value })).sort((a, b) => b.value - a.value || a.id - b.id);
const label = (d, field) => pretty(data[field][d.id]);
const specs = {
  ranking: ['01', 'Which colleges send the most students?', 'A ranked bar chart of the 15 largest published enrollment sums.'],
  trend: ['02', 'The long view', 'Published enrollment sums across all source colleges, year by year.'],
  heatmap: ['03', 'A college-by-year view', 'Track the current top 12 colleges across all 14 years. Gray means no published cells.'],
  majors: ['04', 'What do transfer students study?', 'The 12 largest published CIP subfamilies across source colleges. These are federal categories, not campus major names.'],
  treemap: ['05', 'A field-of-study mosaic', 'Tile area represents each CIP family’s share of the selected campus-year’s published enrollment sum.'],
  destinations: ['06', 'Where does one college’s cohort go?', 'Compare published enrollment sums across UC campuses for a single community college.'],
  mix: ['07', 'A campus fingerprint', 'Campus shares of published enrollment sums for the 10 largest source colleges across UC.'],
  trajectories: ['08', 'Five colleges, fourteen years', 'Compare trajectories for the five largest source colleges in the selected year. Gaps indicate no published cells.'],
  scatter: ['09', 'Berkeley and UCLA, side by side', 'Each dot is a source college with published cells at both campuses. The diagonal marks equal published enrollment sums.'],
  change: ['10', 'How has the picture changed?', 'The 12 largest absolute differences between 2012–13 and the selected year, among colleges with published cells in both years.'],
  concentration: ['11', 'How concentrated are the pathways?', 'The cumulative share of published enrollments as source colleges are added, largest first.'],
  profile: ['12', 'One college’s academic profile', 'The 12 largest published CIP subfamilies for one community college at the selected campus.'],
};

function Bars({ entries, getLabel, color = BLUE }) {
  const h = Math.max(140, entries.length * 36 + 42);
  const x = scaleLinear().domain([0, max(entries, (d) => d.value) || 1]).range([0, 395]);
  return (
    <svg viewBox={`0 0 760 ${h}`} role="img" aria-label="Horizontal bars comparing published enrollment sums">
      {x.ticks(4).map((v) => (
        <g key={v}>
          <line x1={290 + x(v)} x2={290 + x(v)} y1={15} y2={h - 30} stroke="#e4e8ea" />
          <text x={290 + x(v)} y={h - 10} textAnchor="middle">{count(v)}</text>
        </g>
      ))}
      {entries.map((d, i) => (
        <g key={d.id} transform={`translate(0,${i * 36 + 15})`}>
          <title>
            {getLabel(d)}
            :
            {' '}
            {count(d.value)}
            {' '}
            published enrollments
          </title>
          <text x={280} y={17} textAnchor="end">{getLabel(d).length > 39 ? `${getLabel(d).slice(0, 37)}…` : getLabel(d)}</text>
          <rect x={290} y={0} width={x(d.value)} height={24} fill={color} rx={2} />
          <text x={298 + x(d.value)} y={17}>{count(d.value)}</text>
        </g>
      ))}
    </svg>
  );
}

function Lines({ series, percent = false, rank = false }) {
  const points = series.flatMap((s) => s.points).filter((p) => p.value !== null);
  const x = scaleLinear().domain([0, rank ? Math.max(1, max(points, (p) => p.index)) : data.years.length - 1]).range([60, 710]);
  const y = scaleLinear().domain([0, percent ? 1 : max(points, (p) => p.value) || 1]).nice().range([300, 25]);
  const path = line().defined((p) => p.value !== null).x((p) => x(p.index)).y((p) => y(p.value))
    .curve(curveMonotoneX);
  return (
    <>
      <svg viewBox="0 0 760 350" role="img" aria-label="Line chart of published enrollment sums">
        {y.ticks(5).map((v) => (
          <g key={v}>
            <line x1={60} x2={710} y1={y(v)} y2={y(v)} stroke="#e4e8ea" />
            <text x={50} y={y(v) + 4} textAnchor="end">{percent ? pct(v) : count(v)}</text>
          </g>
        ))}
        {(rank ? x.ticks(6) : [0, 3, 6, 9, 13]).map((v) => <text key={v} x={x(v)} y={326} textAnchor="middle">{rank ? v : data.years[v]}</text>)}
        {series.map((s, i) => (
          <g key={s.name}>
            <path d={path(s.points)} fill="none" stroke={colors[i]} strokeWidth={3} />
            {s.points.filter((p) => p.value !== null).map((p) => (
              <circle key={p.index} cx={x(p.index)} cy={y(p.value)} r={4} fill={colors[i]}>
                <title>
                  {s.name}
                  ,
                  {' '}
                  {rank ? `${p.index} colleges` : data.years[p.index]}
                  :
                  {' '}
                  {percent ? pct(p.value) : count(p.value)}
                </title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      <div className="transfer-legend">
        {series.map((s, i) => (
          <span key={s.name}>
            <i style={{ background: colors[i] }} />
            {s.name}
          </span>
        ))}
      </div>
    </>
  );
}

function Chart({
  type, rows, year, campus, college,
}) {
  const selected = rows.filter((r) => r[1] === year && r[2] === campus);
  const colleges = grouped(selected, 0);
  if (type === 'ranking') return <Bars entries={colleges.slice(0, 15)} getLabel={(d) => label(d, 'colleges')} />;
  if (type === 'majors' || type === 'profile') return <Bars entries={grouped(type === 'profile' ? selected.filter((r) => r[0] === college) : selected, 4).slice(0, 12)} getLabel={(d) => label(d, 'majors')} color={type === 'profile' ? GOLD : BLUE} />;
  if (type === 'destinations') return <Bars entries={grouped(rows.filter((r) => r[1] === year && r[0] === college), 2)} getLabel={(d) => names[data.campuses[d.id]]} />;
  if (type === 'trend' || type === 'trajectories') {
    const ids = type === 'trend' ? [null] : colleges.slice(0, 5).map((d) => d.id);
    const series = ids.map((id) => ({ name: id === null ? names[data.campuses[campus]] : pretty(data.colleges[id]), points: data.years.map((_, index) => { const cells = rows.filter((r) => r[1] === index && r[2] === campus && (id === null || r[0] === id)); return { index, value: cells.length ? total(cells) : null }; }) }));
    return <Lines series={series} />;
  }
  if (type === 'concentration') {
    let running = 0;
    const denominator = sum(colleges, (d) => d.value);
    const points = [{ index: 0, value: 0 }, ...colleges.map((d, i) => { running += d.value; return { index: i + 1, value: running / denominator }; })];
    return <Lines series={[{ name: 'Source colleges, ordered by published enrollment sum', points }]} percent rank />;
  }
  if (type === 'heatmap') {
    const top = colleges.slice(0, 12);
    const cells = top.flatMap((d, row) => data.years.map((_, col) => {
      const matches = rows.filter((r) => r[0] === d.id && r[1] === col && r[2] === campus); return {
        row, col, name: pretty(data.colleges[d.id]), value: matches.length ? total(matches) : null,
      };
    }));
    const color = scaleSequential(interpolateBlues).domain([0, max(cells, (d) => d.value) || 1]);
    return (
      <>
        <svg viewBox={`0 0 760 ${top.length * 34 + 60}`} role="img" aria-label="College by year heatmap">
          {top.map((d, i) => <text key={d.id} x={264} y={i * 34 + 48} textAnchor="end">{pretty(data.colleges[d.id]).slice(0, 36)}</text>)}
          {data.years.map((v, i) => <text key={v} x={287 + i * 33} y={20} textAnchor="middle">{v.slice(2, 4)}</text>)}
          {cells.map((d) => (
            <rect key={`${d.row}-${d.col}`} x={272 + d.col * 33} y={30 + d.row * 34} width={30} height={30} rx={2} fill={d.value === null ? '#e6e6e6' : color(d.value)}>
              <title>
                {d.name}
                ,
                {' '}
                {data.years[d.col]}
                :
                {' '}
                {d.value === null ? 'No published cells' : count(d.value)}
              </title>
            </rect>
          ))}
        </svg>
        <p className="transfer-small">
          Columns show academic year start (12 = 2012–13). Light to dark blue: fewer to more published enrollments (maximum
          {count(max(cells, (d) => d.value) || 0)}
          ). Gray: no published cells.
        </p>
      </>
    );
  }
  if (type === 'treemap') {
    const families = grouped(selected, 3);
    const root = hierarchy({ children: families }).sum((d) => d.value || 0);
    treemap().size([740, 390]).padding(4)(root);
    const tiles = root.leaves();
    return (
      <svg viewBox="0 0 760 410" role="img" aria-label="Treemap of published enrollments by CIP family">
        {tiles.map((d, i) => (
          <g key={d.data.id} transform={`translate(${d.x0 + 10},${d.y0 + 10})`}>
            <title>
              {label(d.data, 'families')}
              :
              {' '}
              {count(d.value)}
              {' '}
              (
              {pct(d.value / root.value)}
              )
            </title>
            <rect width={d.x1 - d.x0} height={d.y1 - d.y0} fill={colors[i % colors.length]} rx={3} />
            {d.x1 - d.x0 > 95 && d.y1 - d.y0 > 45 && (
            <>
              <text x={9} y={22} fill="white">{label(d.data, 'families').slice(0, Math.floor((d.x1 - d.x0) / 7) - 3)}</text>
              <text x={9} y={41} fill="white">{count(d.value)}</text>
            </>
            )}
          </g>
        ))}
      </svg>
    );
  }
  if (type === 'mix') {
    const annual = rows.filter((r) => r[1] === year);
    const top = grouped(annual, 0).slice(0, 10);
    return (
      <>
        <svg viewBox="0 0 760 405" role="img" aria-label="Stacked campus shares for ten community colleges">
          {top.map((d, i) => {
            let offset = 0;
            return (
              <g key={d.id} transform={`translate(0,${i * 36 + 20})`}>
                <text x={270} y={18} textAnchor="end">{pretty(data.colleges[d.id]).slice(0, 37)}</text>
                {data.campuses.map((c, j) => {
                  const value = total(annual.filter((r) => r[0] === d.id && r[2] === j)); const width = 450 * (value / d.value); const x = offset; offset += width; return (
                    <rect key={c} x={285 + x} y={0} width={width} height={26} fill={colors[j]}>
                      <title>{`${pretty(data.colleges[d.id])}, ${names[c]}: ${count(value)} (${pct(value / d.value)} of published sum)`}</title>
                    </rect>
                  );
                })}
              </g>
            );
          })}
          <text x={285} y={395}>0%</text>
          <text x={735} y={395} textAnchor="end">100% of published sum</text>
        </svg>
        <div className="transfer-legend">
          {data.campuses.map((c, i) => (
            <span key={c}>
              <i style={{ background: colors[i] }} />
              {names[c]}
            </span>
          ))}
        </div>
      </>
    );
  }
  if (type === 'scatter') {
    const a = new Map(grouped(rows.filter((r) => r[1] === year && r[2] === data.campuses.indexOf('UCB')), 0).map((d) => [d.id, d.value]));
    const b = grouped(rows.filter((r) => r[1] === year && r[2] === data.campuses.indexOf('UCLA')), 0).filter((d) => a.has(d.id));
    const limit = max(b, (d) => Math.max(d.value, a.get(d.id))) || 1;
    const x = scaleLinear().domain([0, limit]).nice().range([70, 710]);
    const y = scaleLinear().domain(x.domain()).range([350, 25]);
    return (
      <svg viewBox="0 0 760 410" role="img" aria-label="Berkeley versus UCLA published enrollments by community college">
        {x.ticks(5).map((v) => (
          <g key={v}>
            <line x1={70} x2={710} y1={y(v)} y2={y(v)} stroke="#e4e8ea" />
            <text x={60} y={y(v) + 4} textAnchor="end">{count(v)}</text>
            <text x={x(v)} y={374} textAnchor="middle">{count(v)}</text>
          </g>
        ))}
        <path d="M70,350L710,25" stroke="#999" strokeDasharray="5 5" />
        <text x={70} y={15}>UCLA</text>
        <text x={390} y={402} textAnchor="middle">Berkeley published enrollment sum</text>
        {b.map((d) => (
          <circle key={d.id} cx={x(a.get(d.id))} cy={y(d.value)} r={6} fill={BLUE} opacity={0.65}>
            <title>
              {label(d, 'colleges')}
              : Berkeley
              {' '}
              {count(a.get(d.id))}
              ; UCLA
              {' '}
              {count(d.value)}
            </title>
          </circle>
        ))}
      </svg>
    );
  }
  if (type === 'change') {
    const baseline = new Map(grouped(rows.filter((r) => r[1] === 0 && r[2] === campus), 0).map((d) => [d.id, d.value]));
    const changes = colleges.filter((d) => baseline.has(d.id)).map((d) => ({ ...d, start: baseline.get(d.id), delta: d.value - baseline.get(d.id) })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 12);
    const x = scaleLinear().domain([0, max(changes, (d) => Math.max(d.start, d.value)) || 1]).range([285, 680]);
    return (
      <>
        <svg viewBox={`0 0 760 ${changes.length * 35 + 50}`} role="img" aria-label="Dumbbell comparison of published enrollments in two academic years">
          {changes.map((d, i) => (
            <g key={d.id} transform={`translate(0,${i * 35 + 20})`}>
              <title>
                {label(d, 'colleges')}
                : 2012–13
                {' '}
                {count(d.start)}
                ;
                {' '}
                {data.years[year]}
                {' '}
                {count(d.value)}
                ; change
                {' '}
                {format('+,')(d.delta)}
              </title>
              <text x={272} y={4} textAnchor="end">{label(d, 'colleges').slice(0, 37)}</text>
              <line x1={x(d.start)} x2={x(d.value)} y1={0} y2={0} stroke="#b9c5cd" strokeWidth={4} />
              <circle cx={x(d.start)} r={5} fill={GOLD} />
              <circle cx={x(d.value)} r={5} fill={BLUE} />
              <text x={700} y={4}>{format('+,')(d.delta)}</text>
            </g>
          ))}
          {x.ticks(4).map((v) => <text key={v} x={x(v)} y={changes.length * 35 + 35} textAnchor="middle">{count(v)}</text>)}
        </svg>
        <div className="transfer-legend">
          <span>
            <i style={{ background: GOLD }} />
            2012–13
          </span>
          <span>
            <i style={{ background: BLUE }} />
            {data.years[year]}
          </span>
        </div>
      </>
    );
  }
  return null;
}

export default function TransferVisual({ type = 'ranking' }) {
  const [year, setYear] = useState(data.years.length - 1);
  const [campus, setCampus] = useState(data.campuses.indexOf('UCB'));
  const [college, setCollege] = useState(data.colleges.indexOf('BERKELEY CITY COLLEGE'));
  const [showTable, setShowTable] = useState(false);
  const [number, title, description] = specs[type];
  const hasCampus = !['destinations', 'mix', 'scatter'].includes(type);
  const hasCollege = ['destinations', 'profile'].includes(type);
  const hasYear = type !== 'trend';
  const tableRows = useMemo(() => data.rows.filter((r) => (!hasYear || ['heatmap', 'trajectories', 'change'].includes(type) || r[1] === year)
    && (!hasCampus || r[2] === campus)
    && (!hasCollege || r[0] === college)
    && (type !== 'scatter' || ['UCB', 'UCLA'].includes(data.campuses[r[2]]))), [type, year, campus, college, hasYear, hasCampus, hasCollege]);
  const observed = tableRows.filter((r) => (!hasYear || r[1] === year));
  const download = () => {
    const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const lines = [['Community college', 'Academic year', 'Campus', 'CIP family', 'CIP subfamily', 'Published enrollees'], ...tableRows.map((r) => [data.colleges[r[0]], data.years[r[1]], data.campuses[r[2]], data.families[r[3]], data.majors[r[4]], r[5]])];
    const url = URL.createObjectURL(new Blob([lines.map((r) => r.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `transfers-${type}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className="transfer-visual" aria-label={`${number}. ${title}`}>
      <div className="transfer-eyebrow">
        VISUAL OPTION
        {number}
      </div>
      <h3>{title}</h3>
      <p className="transfer-description">{description}</p>
      <div className="transfer-controls">
        {hasYear && (
        <label htmlFor={`${type}-year`}>
          Academic year
          <select id={`${type}-year`} value={year} onChange={(e) => setYear(+e.target.value)}>{data.years.map((v, i) => <option key={v} value={i}>{v}</option>)}</select>
        </label>
        )}
        {hasCampus && (
        <label htmlFor={`${type}-campus`}>
          UC campus
          <select id={`${type}-campus`} value={campus} onChange={(e) => setCampus(+e.target.value)}>{data.campuses.map((v, i) => <option key={v} value={i}>{names[v]}</option>)}</select>
        </label>
        )}
        {hasCollege && (
        <label htmlFor={`${type}-college`}>
          Community college
          <select id={`${type}-college`} value={college} onChange={(e) => setCollege(+e.target.value)}>{data.colleges.map((v, i) => <option key={v} value={i}>{pretty(v)}</option>)}</select>
        </label>
        )}
      </div>
      {observed.length ? <div className="transfer-chart"><Chart type={type} rows={data.rows} year={year} campus={campus} college={college} /></div> : <p className="transfer-empty" role="status">No published cells for this selection. This does not mean zero transfers.</p>}
      <p className="transfer-source">Source: UC, Transfers by major. Published enrollment sums only; suppressed cells are excluded. These figures are not admission rates. College source labels are kept separate.</p>
      <div className="transfer-actions">
        <button type="button" onClick={() => setShowTable(!showTable)} aria-expanded={showTable}>
          {showTable ? 'Hide' : 'Show'}
          {' '}
          source data
        </button>
        <button type="button" onClick={download}>Download selection (CSV)</button>
      </div>
      {showTable && (
      <div className="transfer-table">
        <p>
          {count(tableRows.length)}
          {' '}
          published cells in this selection. Showing the first 100; download for all rows.
        </p>
        <table>
          <caption>Published source cells underlying this option</caption>
          <thead><tr>{['College', 'Year', 'Campus', 'CIP subfamily', 'Enrollees'].map((v) => <th key={v} scope="col">{v}</th>)}</tr></thead>
          <tbody>
            {tableRows.slice(0, 100).map((r) => (
              <tr key={r.slice(0, 5).join('-')}>
                <td>{pretty(data.colleges[r[0]])}</td>
                <td>{data.years[r[1]]}</td>
                <td>{data.campuses[r[2]]}</td>
                <td>{pretty(data.majors[r[4]])}</td>
                <td>{count(r[5])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}
