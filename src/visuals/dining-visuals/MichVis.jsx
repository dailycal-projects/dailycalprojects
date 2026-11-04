import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as styles from './michVis.module.css';

const COLOR_LO = '#F5E6D3';
const COLOR_MID1 = '#C4956A';
const COLOR_MID2 = '#6B8F71';
const COLOR_HI = '#3B5E4F';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const M = {
  top: 10, right: 20, bottom: 50, left: 150,
};
const CELL = 62;
const PAD = 5;

// Sentence case: first letter capitalised, rest lowercase
function formatItemName(name) {
  if (!name) return name;
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty',
];
function toWord(n) {
  return n <= 20 ? NUMBER_WORDS[n] : n.toLocaleString();
}

function parseDataset(raw) {
  return raw.map((row) => {
    const r = {};
    Object.entries(row).forEach(([k, v]) => {
      r[k.trim().replace(/^﻿/, '')] = (v || '').trim();
    });
    const s = r.Date || '';
    if (s.length === 8) {
      const dt = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
      const dow = dt.getDay();
      r._day = DAYS[dow === 0 ? 6 : dow - 1];
    } else {
      r._day = 'Unknown';
    }
    r._location = (r.Location || '').replace(/_/g, ' ').trim().replace(/Cafe 3/i, 'Café 3');
    return r;
  });
}

function aggregate(rows) {
  const map = {};
  rows.forEach((d) => {
    const { _location: loc, _day: day } = d;
    if (!loc || !day || day === 'Unknown') return;
    if (!map[loc]) map[loc] = {};
    map[loc][day] = (map[loc][day] || 0) + 1;
  });
  return map;
}

function renderHeatmap(itemName, dataset, filterLocation, filterMeal, chartEl, legendEl, tooltipEl) {
  d3.select(chartEl).selectAll('*').remove();
  d3.select(legendEl).selectAll('*').remove();

  let rows = dataset.filter((d) => d.Item_Name === itemName);
  if (filterLocation !== 'ALL') rows = rows.filter((d) => d._location === filterLocation);
  if (filterMeal !== 'ALL') rows = rows.filter((d) => d.Meal === filterMeal);

  if (!rows.length) return { subtitle: '', noResults: true, showLegend: false };

  const a = aggregate(rows);
  const locs = [...new Set(rows.map((d) => d._location))].filter(Boolean).sort();
  const activeDays = DAYS.filter((day) => locs.some((loc) => a[loc]?.[day]));

  let peakC = 0; let peakL = ''; let peakD = '';
  locs.forEach((loc) => activeDays.forEach((day) => {
    const c = a[loc]?.[day] || 0;
    if (c > peakC) { peakC = c; peakL = loc; peakD = day; }
  }));

  // New subtitle format: "The most popular day and location for [dish] was on [day] at [dining hall],
  // where it was served [number] times between Feb. 10 to March 10."
  const displayName = formatItemName(itemName);
  const countWord = toWord(peakC);
  const subtitle = `The most popular day and location for <strong>${displayName}</strong> was on `
    + `<strong>${peakD}s</strong> at <strong>${peakL}</strong>, where it was served `
    + `<strong>${countWord}</strong> time${peakC !== 1 ? 's' : ''} between Feb. 10 to March 10.`;

  const W = M.left + activeDays.length * (CELL + PAD) + M.right;
  const H = M.top + locs.length * (CELL + PAD) + M.bottom;

  const svg = d3.select(chartEl).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);

  const xSc = d3.scaleBand().domain(activeDays).range([0, activeDays.length * (CELL + PAD)]).padding(0);
  const ySc = d3.scaleBand().domain(locs).range([0, locs.length * (CELL + PAD)]).padding(0);

  const counts = locs.flatMap((loc) => activeDays.map((day) => a[loc]?.[day] || 0)).filter((c) => c > 0);
  const minC = d3.min(counts);
  const maxC = d3.max(counts);

  const cScale = d3.scaleSequential()
    .domain([minC, maxC])
    .interpolator(d3.interpolateRgbBasis([COLOR_LO, COLOR_MID1, COLOR_MID2, COLOR_HI]));

  g.append('g')
    .attr('transform', `translate(0,${locs.length * (CELL + PAD) + 6})`)
    .call(d3.axisBottom(xSc).tickSize(0))
    .call((ax) => ax.select('.domain').remove())
    .selectAll('text')
    .style('font-family', "'Source Sans 3',sans-serif")
    .style('font-size', '12px')
    .attr('fill', '#555')
    .attr('dy', '1.1em');

  g.append('g')
    .call(d3.axisLeft(ySc).tickSize(0))
    .call((ax) => ax.select('.domain').remove())
    .selectAll('text')
    .style('font-family', "'Source Sans 3',sans-serif")
    .style('font-size', '12px')
    .attr('fill', '#555')
    .attr('dx', '-8px');

  locs.forEach((loc) => {
    activeDays.forEach((day) => {
      const count = a[loc]?.[day];
      if (!count) return;
      const cx = xSc(day);
      const cy = ySc(loc);
      const fill = cScale(count);
      const rgb = d3.color(fill);
      const lum = 0.2126 * rgb.r / 255 + 0.7152 * rgb.g / 255 + 0.0722 * rgb.b / 255;
      const tf = lum > 0.42 ? '#1a1a1a' : '#ffffff';
      const cell = g.append('g');
      cell.append('rect')
        .attr('x', cx + 2).attr('y', cy + 2)
        .attr('width', CELL - 2)
        .attr('height', CELL - 2)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('fill', fill)
        .style('cursor', 'default')
        .style('transition', 'opacity 0.12s')
        .on('mousemove', (evt) => {
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = `${evt.clientX + 14}px`;
          tooltipEl.style.top = `${evt.clientY - 38}px`;
          tooltipEl.innerHTML = `<strong>${loc}</strong><br/>${day}: <strong>${count}</strong> serving${count !== 1 ? 's' : ''}`;
        })
        .on('mouseleave', () => { tooltipEl.style.opacity = '0'; })
        .on('mouseover', function () { d3.select(this).style('opacity', '0.82'); })
        .on('mouseout', function () { d3.select(this).style('opacity', '1'); });
      cell.append('text')
        .attr('x', cx + 2 + (CELL - 2) / 2).attr('y', cy + 2 + (CELL - 2) / 2)
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle')
        .style('font-family', "'Source Sans 3',sans-serif")
        .style('font-size', '12.5px')
        .style('font-weight', '600')
        .style('pointer-events', 'none')
        .attr('fill', tf)
        .text(count);
    });
  });

  // Legend — only render gradient, no blank label
  const lW = 260;
  // Set explicit dimensions so the SVG element has size before D3 writes
  d3.select(legendEl)
    .attr('width', lW + 40)
    .attr('height', 36)
    .style('display', 'block');
  const defs = d3.select(legendEl).append('defs');
  const grad = defs.append('linearGradient').attr('id', 'michLg');
  d3.range(0, 1.01, 0.1).forEach((t) => {
    grad.append('stop')
      .attr('offset', `${t * 100}%`)
      .attr('stop-color', cScale(minC + t * (maxC - minC)));
  });
  d3.select(legendEl).append('rect')
    .attr('x', 8).attr('y', 2)
    .attr('width', lW)
    .attr('height', 13)
    .attr('rx', 3)
    .style('fill', 'url(#michLg)');
  const lxSc = d3.scaleLinear().domain([minC, maxC]).range([8, 8 + lW]);
  d3.select(legendEl).append('g').attr('transform', 'translate(0,15)')
    .call(d3.axisBottom(lxSc).ticks(4).tickSize(3))
    .call((ax) => ax.select('.domain').remove())
    .selectAll('text')
    .style('font-family', "'Source Sans 3',sans-serif")
    .style('font-size', '10px')
    .attr('fill', '#aaa');

  return { subtitle, noResults: false, showLegend: true };
}

const DEFAULT_ITEM = 'Scrambled Eggs';

export default function MichVis() {
  const [dataset, setDataset] = useState([]);
  const [allItems, setAllItems] = useState([]);
  // displayItems: sentence-cased versions for UI; maps index → raw CSV name
  const [displayItems, setDisplayItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [acItems, setAcItems] = useState([]);
  const [acIdx, setAcIdx] = useState(-1);
  const [showAc, setShowAc] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [subtitle, setSubtitle] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [locations, setLocations] = useState([]);
  const [meals, setMeals] = useState([]);
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterMeal, setFilterMeal] = useState('ALL');
  const [showLegend, setShowLegend] = useState(false);

  const chartRef = useRef(null);
  const legendRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    d3.csv('/allMenus.csv').then((raw) => {
      const data = parseDataset(raw);
      const items = [...new Set(data.map((d) => d.Item_Name))].filter(Boolean).sort();
      const locs = [...new Set(data.map((d) => d._location))].sort();
      const mls = [...new Set(data.map((d) => d.Meal))].filter(Boolean).sort();
      setDataset(data);
      setAllItems(items);
      // Build sentence-cased display list (used in autocomplete)
      setDisplayItems(items.map(formatItemName));
      setLocations(locs);
      setMeals(mls);
      setLoading(false);
      const matchedDefault = items.find(
        (i) => i.toLowerCase() === DEFAULT_ITEM.toLowerCase(),
      ) || items[0];
      // Show sentence-cased version in the input
      setSearchQuery(formatItemName(matchedDefault));
      setCurrentItem(matchedDefault);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!currentItem || !dataset.length || !chartRef.current) return;
    const result = renderHeatmap(
      currentItem, dataset, filterLocation, filterMeal,
      chartRef.current, legendRef.current, tooltipRef.current,
    );
    setSubtitle(result.subtitle);
    setNoResults(result.noResults);
    setShowLegend(result.showLegend);
  }, [currentItem, filterLocation, filterMeal, dataset]);

  function handleSearchInput(e) {
    const q = e.target.value;
    setSearchQuery(q);
    setAcIdx(-1);
    if (q.length < 2) { setAcItems([]); setShowAc(false); return; }
    // Match against sentence-cased display items
    const hits = displayItems
      .filter((i) => i.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 12);
    setAcItems(hits);
    setShowAc(hits.length > 0);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') setAcIdx((i) => Math.min(i + 1, acItems.length - 1));
    else if (e.key === 'ArrowUp') setAcIdx((i) => Math.max(i - 1, 0));
    else if (e.key === 'Enter') {
      if (acIdx >= 0) pick(acItems[acIdx]);
      else if (acItems.length) pick(acItems[0]);
    } else if (e.key === 'Escape') setShowAc(false);
  }

  // pick receives a sentence-cased display name; look up the raw CSV name to pass to renderHeatmap
  function pick(displayName) {
    setSearchQuery(displayName);
    setShowAc(false);
    // Find raw CSV item whose sentence-cased form matches
    const idx = displayItems.indexOf(displayName);
    const rawName = idx >= 0 ? allItems[idx] : allItems.find(
      (i) => formatItemName(i).toLowerCase() === displayName.toLowerCase(),
    );
    if (rawName) setCurrentItem(rawName);
  }

  if (loading) return <p className={styles.loading}>Loading menu data…</p>;
  if (error) return <p className={styles.loading}>⚠️ Could not load allMenus.csv.</p>;

  return (
    <div className={styles.main}>
      {/* Title — restored */}
      <h2 className={styles.title}>Search Berkeley Dining menus</h2>

      <p className={styles.searchLabel}>Menu item</p>
      {subtitle && (
        <p
          className={styles.subtitle}
          dangerouslySetInnerHTML={{ __html: subtitle }}
        />
      )}

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="e.g. Scrambled eggs, Pasta, Chicken…"
          autoComplete="off"
          value={searchQuery}
          onChange={handleSearchInput}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowAc(false), 150)}
        />
        {showAc && (
          <div className={styles.autocompleteList}>
            {acItems.map((item, i) => (
              <div
                key={item}
                className={`${styles.autocompleteItem}${i === acIdx ? ` ${styles.autocompleteItemActive}` : ''}`}
                onMouseDown={() => pick(item)}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      <p className={styles.searchHint}>Type 2 or more characters to search.</p>

      <div className={styles.filterRow}>
        <label className={styles.filterLabel}>Location</label>
        <select
          className={styles.filterSelect}
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        >
          <option value="ALL">All Locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <label className={styles.filterLabel}>Meal</label>
        <select
          className={styles.filterSelect}
          value={filterMeal}
          onChange={(e) => setFilterMeal(e.target.value)}
        >
          <option value="ALL">All Meals</option>
          {meals.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className={styles.chartContainer} ref={chartRef} />
      {noResults && <p className={styles.noResults}>No results found for this item.</p>}

      <p className={styles.vizSource}>
        Chart: Anika Bhutani/The Daily Californian &nbsp;·&nbsp;
        Source:
        {' '}
        <a href="https://dining.berkeley.edu/menus/" target="_blank" rel="noreferrer">
          Berkeley Dining
        </a>
        &nbsp;·&nbsp;
        Visualization adapted from
        {' '}
        &ldquo;
        <a href="https://www.michigandaily.com/web/data/diving-deep-into-mdining/" target="_blank" rel="noreferrer">Diving deep into MDining</a>
        &rdquo;
        {' '}
        by The Michigan Daily Data Team
      </p>

      <div ref={tooltipRef} className={styles.tooltip} style={{ opacity: 0 }} />
    </div>
  );
}
