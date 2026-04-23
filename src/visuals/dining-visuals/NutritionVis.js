import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as styles from './nutritionVis.module.css';

const KEYWORDS = {
  grains: [
    'rice', 'noodle', 'pasta', 'bread', 'roll', 'bun', 'tortilla', 'wrap', 'pita',
    'bagel', 'english muffin', 'waffle', 'pancake', 'oatmeal', 'oat', 'grits',
    'quinoa', 'grain', 'farro', 'barley', 'couscous', 'polenta', 'cornbread',
    'biscuit', 'croissant', 'muffin', 'danish', 'flatbread', 'lavash', 'naan',
    'pretzel', 'crouton', 'cracker', 'cereal', 'granola', 'pilaf', 'risotto',
    'lo mein', 'udon', 'ramen', 'spaghetti', 'linguine', 'penne', 'mac', 'grilled bread',
  ],
  proteins: [
    'chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'tilapia', 'cod',
    'shrimp', 'tofu', 'tempeh', 'egg', 'eggs', 'sausage', 'bacon', 'ham', 'lamb',
    'steak', 'burger', 'meatball', 'meatloaf', 'pepperoni', 'salami', 'lentil',
    'bean', 'beans', 'chickpea', 'hummus', 'edamame', 'seitan', 'veggie burger',
    'black bean', 'kidney bean', 'falafel', 'crab', 'lobster', 'clam', 'oyster',
    'scallop', 'brisket', 'pulled pork', 'carnitas', 'chorizo', 'soyrizo', 'gyro',
    'deli', 'pastrami', 'roast beef', 'ground beef', 'ground turkey',
  ],
  greens: [
    'spinach', 'kale', 'lettuce', 'arugula', 'chard', 'collard', 'broccoli',
    'asparagus', 'green bean', 'green beans', 'snap pea', 'edamame', 'bok choy',
    'cabbage', 'brussels', 'zucchini', 'cucumber', 'celery', 'leek', 'fennel',
    'watercress', 'endive', 'radicchio', 'romaine', 'mixed green', 'spring mix',
    'herb', 'basil', 'parsley', 'cilantro', 'mint', 'dill', 'chive', 'broccolini',
    'rapini', 'pesto', 'salad', 'slaw', 'coleslaw', 'microgreen',
  ],
};

const CATEGORY_META = {
  grains: { hex: '#C4956A', light: '#F5E6D3' },
  proteins: { hex: '#7A9CBF', light: '#D8E8F5' },
  greens: { hex: '#6B8F71', light: '#D8EAD8' },
};

const M = {
  top: 10, right: 90, bottom: 40, left: 210,
};
const W = 880;
const iW = W - M.left - M.right;

function categorizeItem(name) {
  const n = name.toLowerCase();
  const entries = Object.entries(KEYWORDS);
  for (let i = 0; i < entries.length; i++) {
    const [cat, kws] = entries[i];
    if (kws.some((kw) => n.includes(kw))) return cat;
  }
  return null;
}

export default function NutritionVis() {
  const [activeCat, setActiveCat] = useState('grains');
  const [activeN, setActiveN] = useState(10);
  const [categorized, setCategorized] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [catSummary, setCatSummary] = useState(null);

  const chartAreaRef = useRef(null);
  const tooltipRef = useRef(null);
  const d3State = useRef({
    svgEl: null, gEl: null, xAxisG: null, yAxisG: null,
  });
  const chartBuilt = useRef(false);

  useEffect(() => {
    d3.csv('/allMenus.csv').then((raw) => {
      const counts = { grains: {}, proteins: {}, greens: {} };
      raw.forEach((row) => {
        const name = (row.Item_Name || '').trim();
        if (!name) return;
        const cat = categorizeItem(name);
        if (!cat) return;
        const key = name.replace(/\b\w/g, (c) => c.toUpperCase());
        counts[cat][key] = (counts[cat][key] || 0) + 1;
      });
      setCategorized(counts);
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!categorized || !chartAreaRef.current) return;

    if (!chartBuilt.current) {
      const state = d3State.current;
      const H = 480;

      state.svgEl = d3.select(chartAreaRef.current).append('svg')
        .attr('width', W).attr('height', H);

      state.gEl = state.svgEl.append('g').attr('transform', `translate(${M.left},${M.top})`);
      state.gEl.append('g').attr('class', 'grid-g');
      state.xAxisG = state.gEl.append('g').attr('class', 'x-axis');
      state.yAxisG = state.gEl.append('g').attr('class', 'y-axis');
      state.gEl.append('g').attr('class', 'bars-g');
      state.gEl.append('g').attr('class', 'labels-g');

      state.svgEl.append('text')
        .attr('class', 'x-foot')
        .attr('x', M.left + iW / 2)
        .attr('y', H - 4)
        .attr('text-anchor', 'middle')
        .style('font-family', "'Source Sans 3', sans-serif")
        .style('font-size', '11px')
        .style('fill', '#aaa')
        .text('Times served across all dining halls');

      chartBuilt.current = true;
    }

    renderChart(categorized, activeCat, activeN);
  }, [categorized, activeCat, activeN]);

  function renderChart(data, cat, n) {
    const state = d3State.current;
    if (!state.svgEl) return;

    const meta = CATEGORY_META[cat];
    const T = 550;
    const ease = d3.easeCubicInOut;

    const chartData = Object.entries(data[cat] || {})
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n);

    if (!chartData.length) return;

    const rowH = 38;
    const iH = chartData.length * rowH;
    const H = iH + M.top + M.bottom + 10;

    state.svgEl.transition().duration(T).ease(ease).attr('height', H);
    state.svgEl.select('.x-foot').transition().duration(T).ease(ease)
      .attr('y', H - 4);

    const xSc = d3.scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count) * 1.08])
      .range([0, iW]);

    const ySc = d3.scaleBand()
      .domain(chartData.map((d) => d.label))
      .range([0, iH])
      .padding(0.28);

    const t = d3.transition().duration(T).ease(ease);

    // Grid lines
    const gridTicks = xSc.ticks(5);
    const gridSel = state.gEl.select('.grid-g').selectAll('line.grid').data(gridTicks, (d) => d);
    gridSel.enter().append('line').attr('class', 'grid')
      .attr('x1', (d) => xSc(d))
      .attr('x2', (d) => xSc(d))
      .attr('y1', 0)
      .attr('y2', iH)
      .attr('stroke', '#f2f2f2')
      .attr('stroke-width', 1)
      .merge(gridSel)
      .transition(t)
      .attr('x1', (d) => xSc(d))
      .attr('x2', (d) => xSc(d))
      .attr('y2', iH);
    gridSel.exit().remove();

    // X axis
    state.xAxisG.transition(t)
      .attr('transform', `translate(0,${iH})`)
      .call(d3.axisBottom(xSc).ticks(5).tickSize(0)
        .tickFormat((d) => (d >= 1000 ? `${(d / 1000).toFixed(1)}k` : d)))
      .call((ax) => ax.select('.domain').attr('stroke', '#e0e0e0'))
      .call((ax) => ax.selectAll('text')
        .style('font-family', "'Source Sans 3',sans-serif")
        .style('font-size', '11px')
        .attr('fill', '#aaa')
        .attr('dy', '1.3em'));

    // Y axis
    state.yAxisG.transition(t)
      .call(d3.axisLeft(ySc).tickSize(0))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) => ax.selectAll('text')
        .style('font-family', "'Source Sans 3',sans-serif")
        .style('font-size', '13px')
        .attr('fill', '#333')
        .attr('dx', '-10px'));

    // Track bars
    const tracks = state.gEl.select('.bars-g').selectAll('rect.track').data(chartData, (d) => d.label);
    tracks.enter().append('rect').attr('class', 'track')
      .attr('x', 0)
      .attr('y', (d) => ySc(d.label))
      .attr('width', iW)
      .attr('height', ySc.bandwidth())
      .attr('fill', meta.light)
      .attr('rx', 3)
      .attr('opacity', 0)
      .merge(tracks)
      .transition(t)
      .attr('y', (d) => ySc(d.label))
      .attr('height', ySc.bandwidth())
      .attr('fill', meta.light)
      .attr('opacity', 1);
    tracks.exit().transition(t).attr('opacity', 0).remove();

    // Main bars
    const tooltip = tooltipRef.current;
    const bars = state.gEl.select('.bars-g').selectAll('rect.bar').data(chartData, (d) => d.label);
    bars.enter().append('rect').attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => ySc(d.label))
      .attr('height', ySc.bandwidth())
      .attr('width', 0)
      .attr('fill', meta.hex)
      .attr('rx', 3)
      .on('mousemove', (event, d) => {
        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX + 14}px`;
        tooltip.style.top = `${event.clientY - 38}px`;
        tooltip.innerHTML = `<strong>${d.label}</strong><br/>Served <strong>${d.count.toLocaleString()}</strong> time${d.count !== 1 ? 's' : ''}`;
      })
      .on('mouseleave', () => { tooltip.style.opacity = '0'; })
      .merge(bars)
      .transition(t)
      .attr('y', (d) => ySc(d.label))
      .attr('height', ySc.bandwidth())
      .attr('width', (d) => xSc(d.count))
      .attr('fill', meta.hex);
    bars.exit().transition(t).attr('width', 0).remove();

    // Value labels
    const vals = state.gEl.select('.labels-g').selectAll('text.val').data(chartData, (d) => d.label);
    vals.enter().append('text').attr('class', 'val')
      .attr('x', (d) => xSc(d.count) + 7)
      .attr('y', (d) => ySc(d.label) + ySc.bandwidth() / 2)
      .attr('dominant-baseline', 'central')
      .style('font-family', "'Source Sans 3',sans-serif")
      .style('font-size', '12px')
      .style('font-weight', '600')
      .attr('fill', '#444')
      .attr('opacity', 0)
      .merge(vals)
      .transition(t)
      .attr('x', (d) => xSc(d.count) + 7)
      .attr('y', (d) => ySc(d.label) + ySc.bandwidth() / 2)
      .attr('opacity', 1)
      .text((d) => d.count.toLocaleString());
    vals.exit().transition(t).attr('opacity', 0).remove();

    // Rank numbers
    const ranks = state.gEl.select('.labels-g').selectAll('text.rank').data(chartData, (d) => d.label);
    ranks.enter().append('text').attr('class', 'rank')
      .attr('x', -M.left + 4)
      .attr('y', (d) => ySc(d.label) + ySc.bandwidth() / 2)
      .attr('dominant-baseline', 'central')
      .style('font-family', "'Source Sans 3',sans-serif")
      .style('font-size', '11px')
      .style('font-weight', '600')
      .attr('fill', meta.hex)
      .attr('opacity', 0)
      .merge(ranks)
      .transition(t)
      .attr('y', (d) => ySc(d.label) + ySc.bandwidth() / 2)
      .attr('fill', meta.hex)
      .attr('opacity', 1)
      .text((d, i) => `#${i + 1}`);
    ranks.exit().transition(t).attr('opacity', 0).remove();

    const total = Object.values(data[cat]).reduce((a, b) => a + b, 0);
    const unique = Object.keys(data[cat]).length;
    setCatSummary({
      total, unique, cat, meta,
    });
  }

  if (loading) return <p className={styles.loading}>Loading data…</p>;
  if (error) return <p className={styles.loading}>⚠️ Could not load allMenus.csv.</p>;

  return (
    <div className={styles.wrapper}>
      <p className={styles.eyebrow}>Berkeley Dining · Nutrition</p>
      <h2 className={styles.title}>What&apos;s most often on the plate?</h2>
      <p className={styles.deck}>
        The most frequently served grains, proteins, and greens across all Berkeley
        dining halls — counted by how many times each item appeared on the menu.
        Hover any bar for details.
      </p>

      <div className={styles.tabs}>
        {['grains', 'proteins', 'greens'].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.tab}${activeCat === cat ? ` ${styles.tabActive}` : ''}`}
            style={activeCat === cat ? {
              color: CATEGORY_META[cat].hex,
              borderColor: CATEGORY_META[cat].hex,
              background: CATEGORY_META[cat].light,
            } : {}}
            onClick={() => setActiveCat(cat)}
          >
            <span className={styles.dot} style={{ background: CATEGORY_META[cat].hex }} />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.controls}>
        <label className={styles.controlsLabel}>Show top</label>
        <div className={styles.nButtons}>
          {[5, 10, 15].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.nBtn}${activeN === n ? ` ${styles.nBtnActive}` : ''}`}
              onClick={() => setActiveN(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {catSummary && (
        <div
          className={styles.catSummary}
          style={{ background: catSummary.meta.light, color: catSummary.meta.hex }}
        >
          <span style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: catSummary.meta.hex,
            display: 'inline-block',
            flexShrink: 0,
          }}
          />
          {catSummary.unique.toLocaleString()}
          {' '}
          unique
          {catSummary.cat}
          &nbsp;·&nbsp;
          {catSummary.total.toLocaleString()}
          {' '}
          total servings
        </div>
      )}

      <div className={styles.chartArea} ref={chartAreaRef} />

      <p className={styles.source}>Anika Bhutani/The Daily Californian</p>

      <div ref={tooltipRef} className={styles.tooltip} style={{ opacity: 0 }} />
    </div>
  );
}
