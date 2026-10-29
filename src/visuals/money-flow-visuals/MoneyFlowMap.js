import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { withPrefix } from 'gatsby';
import { theme } from '../../styles/theme';
import us from './data/us-states-10m.json';

// Built from scripts/uc_donations_by_state.py: UC employee donations to federal
// candidates, grouped by the state of the race. "US" is presidential races.
const DATA_URL = withPrefix('/money-flow/uc_donations_by_state.csv');
const DONORS_URL = withPrefix('/money-flow/uc_top_donors_by_state.csv');
const RECIPIENTS_URL = withPrefix('/money-flow/uc_top_recipients_by_state.csv');

const WIDTH = 975;
const MAP_HEIGHT = 610;
// Extra room below the map for the legend.
const HEIGHT = MAP_HEIGHT + 50;
const ORIGIN = 'CA';
const FLOW_COLOR = theme.palette.darkBlue;
const ORIGIN_COLOR = theme.palette.yellow;
const EMPTY_FILL = '#eef0f2';
const LABELED_STATES = 5;
// Arrows start at UC Berkeley's campus.
const SOURCE_COORDS = [-122.2585, 37.8719];
// While Shift is held, states slide away from the cursor: one right under it
// ends up SCATTER_CLEARANCE beyond its own rough radius, and the push fades to
// nothing SCATTER_REACH farther out. Big states count as at most
// SCATTER_MAX_RADIUS across so they don't fly off the map.
const SCATTER_CLEARANCE = 30;
const SCATTER_REACH = 110;
const SCATTER_MAX_RADIUS = 60;

// Choropleth bins, in dollars donated to races in the state.
const BINS = [5000, 10000, 25000, 50000, 100000];
const BIN_COLORS = d3.quantize(d3.interpolateLab('#d3e4f0', '#0b3550'), BINS.length + 1);

const MODES = [
  { id: 'arrows', label: 'Arrows' },
  { id: 'choropleth', label: 'Choropleth' },
];

const FIPS = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10', DC: '11', FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20', KY: '21', LA: '22', ME: '23', MD: '24', MA: '25', MI: '26', MN: '27', MS: '28', MO: '29', MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44', SC: '45', SD: '46', TN: '47', TX: '48', UT: '49', VT: '50', VA: '51', WA: '53', WV: '54', WI: '55', WY: '56',
};

const UNMAPPED_NAMES = { US: 'presidential races', MP: 'Northern Mariana Islands' };
const PARTIES = {
  DEM: 'D', REP: 'R', IND: 'I', LIB: 'L', GRE: 'G',
};

const formatDollars = d3.format('$,.0f');
const formatShort = (v) => (v >= 1000 ? `$${d3.format(',.0f')(v / 1000)}K` : formatDollars(v));
const formatPct = d3.format('.1%');
const formatContributions = (n) => `${d3.format(',')(n)} contribution${n === 1 ? '' : 's'}`;

// FEC names are "LAST, FIRST MIDDLE" in caps; show them as "First Middle Last".
const formatName = (raw) => {
  const titleCase = (t) => t.toLowerCase()
    .replace(/(^|[\s'(-])\p{L}/gu, (c) => c.toUpperCase())
    .replace(/\bMc(\p{L})/gu, (_, c) => `Mc${c.toUpperCase()}`);
  const [last, first] = raw.split(/,\s*/);
  return titleCase(first ? `${first} ${last}` : last);
};

// "House, NY-14", "Senate" or "President", from FEC office codes.
const formatRace = (r) => {
  if (r.office === 'S') return 'Senate';
  if (r.office === 'P') return 'President';
  const district = +r.district;
  return `House, ${r.state}-${district ? d3.format('02')(district) : 'AL'}`;
};

// A quadratic curve from source to target that bends left of travel (or right,
// for mostly southward flows like Alaska and Hawaii, so they arc over the Pacific),
// with a separate triangular head so heads stay legible on thin lines.
const arrowGeometry = (source, target, width) => {
  const [sx, sy] = source;
  const [tx, ty] = target;
  const dx = tx - sx;
  const dy = ty - sy;
  const bend = dy > Math.abs(dx) ? -0.18 : 0.18;
  const cx = (sx + tx) / 2 + dy * bend;
  const cy = (sy + ty) / 2 - dx * bend;

  const headLength = Math.max(7, width * 1.6);
  const headWidth = Math.max(6, width * 2);
  const ex = tx - cx;
  const ey = ty - cy;
  const elen = Math.hypot(ex, ey) || 1;
  const ux = ex / elen;
  const uy = ey / elen;
  const baseX = tx - ux * headLength;
  const baseY = ty - uy * headLength;

  return {
    line: `M${sx},${sy}Q${cx},${cy} ${baseX},${baseY}`,
    head: `M${tx},${ty}L${baseX - uy * (headWidth / 2)},${baseY + ux * (headWidth / 2)}`
      + `L${baseX + uy * (headWidth / 2)},${baseY - ux * (headWidth / 2)}Z`,
  };
};

// One tooltip section: a heading over numbered rows of label, optional subline, value.
const rankedList = (title, items) => {
  if (!items || !items.length) return '';
  const rows = items.map((item, i) => `
    <div style="display:flex;justify-content:space-between;gap:10px;margin-top:2px">
      <span>${i + 1}. ${item.label}${item.sub ? `<br/><span style="color:${theme.palette.darkGrey};font-size:12px;padding-left:14px">${item.sub}</span>` : ''}</span>
      <span style="white-space:nowrap">${formatDollars(item.value)}</span>
    </div>`).join('');
  return `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e3e3e3">
    <strong>${title}</strong>${rows}
  </div>`;
};

const buttonStyle = (active) => ({
  fontFamily: 'inherit',
  fontSize: 14,
  padding: '6px 14px',
  border: `1px solid ${theme.palette.darkBlue}`,
  background: active ? theme.palette.darkBlue : '#fff',
  color: active ? '#fff' : theme.palette.darkBlue,
  cursor: 'pointer',
});

const MoneyFlowMap = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const noteRef = useRef();
  const [mode, setMode] = useState('arrows');
  const modeRef = useRef(mode);
  // Set once the data loads; switches the drawn map between modes.
  const applyModeRef = useRef(null);

  useEffect(() => {
    const projection = d3.geoAlbersUsa().scale(1300).translate([WIDTH / 2, MAP_HEIGHT / 2]);
    const path = d3.geoPath(projection);
    const states = feature(us, us.objects.states).features
      .filter((d) => path.centroid(d).every(Number.isFinite));
    const statesById = new Map(states.map((d) => [d.id, d]));
    const abbrByFips = new Map(Object.entries(FIPS).map(([abbr, fips]) => [fips, abbr]));

    // Hand-placed anchors where a centroid sits awkwardly (Florida's falls in the Gulf side,
    // Michigan's would land in the lake).
    const anchorOverrides = {
      FL: [-81.6, 28.3],
      MI: [-84.6, 43.4],
      LA: [-92.3, 31.0],
    };
    const anchor = (abbr) => (anchorOverrides[abbr]
      ? projection(anchorOverrides[abbr])
      : path.centroid(statesById.get(FIPS[abbr])));

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    let cancelled = false;
    let removeListeners = () => {};

    Promise.all([
      d3.csv(DATA_URL, (r) => ({
        state: r.state,
        total: +r.total_donated,
        contributions: +r.contributions,
      })),
      d3.csv(DONORS_URL, (r) => ({
        state: r.state,
        rank: +r.rank,
        label: formatName(r.name),
        value: +r.total_donated,
      })),
      d3.csv(RECIPIENTS_URL, (r) => ({
        state: r.state,
        rank: +r.rank,
        label: `${formatName(r.name)}${PARTIES[r.party] ? ` (${PARTIES[r.party]})` : ''}`,
        sub: formatRace(r),
        value: +r.total_received,
      })),
    ]).then(([rows, donorRows, recipientRows]) => {
      if (cancelled) return;

      const byRank = (list) => d3.group(list.sort((a, b) => a.rank - b.rank), (r) => r.state);
      const topDonors = byRank(donorRows);
      const topRecipients = byRank(recipientRows);

      const totalsByFips = new Map(rows.filter((r) => FIPS[r.state]).map((r) => [FIPS[r.state], r]));
      const origin = rows.find((r) => r.state === ORIGIN);
      const flows = rows
        .filter((r) => r.state !== ORIGIN && FIPS[r.state] && r.total > 0)
        .sort((a, b) => b.total - a.total);
      const unmapped = rows.filter((r) => r.state !== ORIGIN && !FIPS[r.state]);
      const outOfState = d3.sum(flows, (r) => r.total);

      const widthScale = d3.scaleLinear()
        .domain([0, d3.max(flows, (r) => r.total)])
        .range([0, 16]);
      const strokeWidth = (v) => Math.max(1, widthScale(v));
      // Bigger flows are also more opaque, so small arrows recede behind them.
      const opacityScale = d3.scaleSqrt()
        .domain([0, d3.max(flows, (r) => r.total)])
        .range([0.25, 0.95]);
      const binColor = d3.scaleThreshold().domain(BINS).range(BIN_COLORS);

      svg.selectAll('*').remove();

      const showTooltip = (event, html) => {
        const box = svgRef.current.parentNode.getBoundingClientRect();
        tooltip.style('opacity', 1).html(html);
        const tipHeight = tooltipRef.current.offsetHeight;
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        // Flip above the pointer in the lower half so tall tooltips stay on the map.
        const top = y > box.height / 2 ? y - tipHeight - 14 : y + 14;
        tooltip
          .style('left', `${Math.max(0, Math.min(x + 14, box.width - tooltipRef.current.offsetWidth))}px`)
          .style('top', `${Math.max(0, top)}px`);
      };
      const hideTooltip = () => tooltip.style('opacity', 0);

      const stateLayer = svg.append('g');
      // Everything drawn over the states ignores the pointer, so hovering anywhere
      // over a state reaches it.
      const flowLayer = svg.append('g').attr('pointer-events', 'none');
      const hoverOutline = svg.append('path')
        .attr('fill', 'none')
        .attr('stroke', theme.palette.black)
        .attr('stroke-width', 2)
        .attr('stroke-linejoin', 'round')
        .attr('pointer-events', 'none');
      const labelLayer = svg.append('g').attr('pointer-events', 'none');
      const originDot = svg.append('circle')
        .attr('r', 6)
        .attr('fill', theme.palette.black)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('pointer-events', 'none');
      const arrowLegend = svg.append('g').attr('transform', `translate(${WIDTH - 340}, ${MAP_HEIGHT + 4})`);
      const binLegend = svg.append('g').attr('transform', `translate(${WIDTH - 340}, ${MAP_HEIGHT + 4})`);

      const statePaths = stateLayer.selectAll('path')
        .data(states)
        .join('path')
        .attr('d', path)
        .attr('stroke', '#9aa3ad')
        .attr('stroke-width', 0.75)
        .attr('stroke-linejoin', 'round');

      const source = projection(SOURCE_COORDS);
      originDot.attr('cx', source[0]).attr('cy', source[1]);

      const baseFill = (d) => {
        if (modeRef.current === 'choropleth') {
          const r = totalsByFips.get(d.id);
          return r && r.total > 0 ? binColor(r.total) : EMPTY_FILL;
        }
        return d.id === FIPS[ORIGIN] ? ORIGIN_COLOR : EMPTY_FILL;
      };

      const highlight = (fips) => {
        const arrows = modeRef.current === 'arrows';
        hoverOutline.attr('d', fips ? path(statesById.get(fips)) : null);
        flowLayer.selectAll('g.flow')
          .attr('opacity', (r) => {
            if (!fips || !arrows) return opacityScale(r.total);
            return FIPS[r.state] === fips ? 1 : 0.08;
          });
        statePaths.attr('fill', (d) => (arrows && d.id === fips && fips !== FIPS[ORIGIN]
          ? theme.palette.dcBlue
          : baseFill(d)));
      };

      const stateTooltip = (d) => {
        const abbr = abbrByFips.get(d.id);
        const r = totalsByFips.get(d.id);
        if (!r || r.total <= 0) {
          return `<strong>${d.properties.name}</strong><br/>No recorded donations`;
        }
        const heading = abbr === ORIGIN
          ? 'California (in-state races)'
          : `${modeRef.current === 'arrows' ? 'California → ' : ''}${d.properties.name}`;
        const share = abbr === ORIGIN
          ? ''
          : `<br/><span style="color:${theme.palette.darkGrey}">${formatPct(r.total / outOfState)} of out-of-state giving</span>`;
        return `<strong>${heading}</strong><br/>`
          + `${formatDollars(r.total)} from ${formatContributions(r.contributions)}${share}`
          + `${rankedList('Top recipients', topRecipients.get(abbr))}`
          + `${rankedList('Top 3 donors', topDonors.get(abbr))}`;
      };

      // Largest flows first so thin arrows draw on top.
      flowLayer.selectAll('g.flow')
        .data(flows)
        .join('g')
        .attr('class', 'flow')
        .attr('opacity', (r) => opacityScale(r.total))
        .each(function drawArrow(r) {
          const width = strokeWidth(r.total);
          const geo = arrowGeometry(source, anchor(r.state), width);
          const g = d3.select(this);
          g.append('path')
            .attr('d', geo.line)
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', width + 1.5);
          g.append('path')
            .attr('d', geo.line)
            .attr('fill', 'none')
            .attr('stroke', FLOW_COLOR)
            .attr('stroke-width', width)
            .attr('stroke-linecap', 'butt');
          g.append('path')
            .attr('d', geo.head)
            .attr('fill', FLOW_COLOR);
        });

      statePaths
        .on('mouseenter mousemove', (event, d) => {
          highlight(d.id);
          showTooltip(event, stateTooltip(d));
        })
        .on('mouseleave', () => { highlight(null); hideTooltip(); });

      // Light labels sit on the map with a white halo; dark ones (on dark fills) invert it.
      // Each label is tied to its state (abbr) so it can move with it.
      const label = (abbr, x, y, lines, anchorSide = 'middle', onDark = false) => {
        const text = labelLayer.append('text')
          .datum(abbr)
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchorSide)
          .attr('font-size', 13)
          .attr('fill', onDark ? '#fff' : theme.palette.black)
          .attr('paint-order', 'stroke')
          .attr('stroke', onDark ? BIN_COLORS[BIN_COLORS.length - 1] : '#fff')
          .attr('stroke-width', 3.5)
          .attr('stroke-linejoin', 'round');
        lines.forEach((t, i) => text.append('tspan')
          .attr('x', x)
          .attr('dy', i === 0 ? 0 : '1.15em')
          .attr('font-weight', i === 0 ? 700 : 400)
          .text(t));
      };

      // Holding Shift scatters states away from the cursor and turns off their
      // hover, so none of them can be hovered. Arrows, labels and the UC
      // Berkeley dot move with their states. Releasing Shift (or leaving the map)
      // lets everything glide back.
      const stateCenter = new Map(states.map((d) => [d.id, path.centroid(d)]));
      const stateRadius = new Map(states.map((d) => [
        d.id, Math.min(Math.sqrt(path.area(d) / Math.PI), SCATTER_MAX_RADIUS),
      ]));
      let pointer = null;
      let scattering = false;
      let offsets = new Map(); // FIPS -> [dx, dy]
      const offsetFor = (fips) => offsets.get(fips) || [0, 0];
      const shifted = (abbr, [x, y]) => {
        const [dx, dy] = offsetFor(FIPS[abbr]);
        return [x + dx, y + dy];
      };
      const translate = (fips) => {
        const [dx, dy] = offsetFor(fips);
        return `translate(${dx},${dy})`;
      };
      const scatterOffsets = ([mx, my]) => new Map(states.map((d) => {
        const [cx, cy] = stateCenter.get(d.id);
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.hypot(dx, dy);
        const near = stateRadius.get(d.id) + SCATTER_CLEARANCE;
        if (dist >= near + SCATTER_REACH) return [d.id, [0, 0]];
        // Ease the push off with distance, like the PAC chart's circles.
        const angle = dist > 0 ? Math.atan2(dy, dx) : -Math.PI / 2;
        const pushed = near + (dist / (near + SCATTER_REACH)) * SCATTER_REACH;
        return [d.id, [mx + pushed * Math.cos(angle) - cx, my + pushed * Math.sin(angle) - cy]];
      }));
      const applyOffsets = (duration) => {
        const ease = (t) => t.duration(duration).ease(d3.easeCubicOut);
        statePaths.transition('scatter').call(ease)
          .attr('transform', (d) => translate(d.id));
        labelLayer.selectAll('text').transition('scatter').call(ease)
          .attr('transform', (abbr) => translate(FIPS[abbr]));
        const movedSource = shifted(ORIGIN, source);
        originDot.transition('scatter').call(ease)
          .attr('cx', movedSource[0])
          .attr('cy', movedSource[1]);
        flowLayer.selectAll('g.flow').each(function moveArrow(r) {
          const geo = arrowGeometry(movedSource, shifted(r.state, anchor(r.state)), strokeWidth(r.total));
          const parts = d3.select(this).selectAll('path');
          parts.filter((_, i) => i < 2).transition('scatter').call(ease).attr('d', geo.line);
          parts.filter((_, i) => i === 2).transition('scatter').call(ease).attr('d', geo.head);
        });
      };
      const setScattering = (on) => {
        if (on === scattering) return;
        scattering = on;
        statePaths.attr('pointer-events', on ? 'none' : null);
        if (on) {
          highlight(null);
          hideTooltip();
        } else {
          offsets = new Map();
          applyOffsets(500);
        }
      };
      const scatter = () => {
        offsets = scatterOffsets(pointer);
        applyOffsets(150);
      };
      svg
        .on('mousemove.scatter', (event) => {
          pointer = d3.pointer(event, svg.node());
          setScattering(event.shiftKey);
          if (scattering) scatter();
        })
        .on('mouseleave.scatter', () => {
          pointer = null;
          setScattering(false);
        });
      // Pressing or releasing Shift without moving the mouse also counts.
      const onShift = (event) => {
        if (event.key !== 'Shift') return;
        setScattering(event.type === 'keydown' && pointer !== null);
        if (scattering) scatter();
      };
      window.addEventListener('keydown', onShift);
      window.addEventListener('keyup', onShift);
      removeListeners = () => {
        window.removeEventListener('keydown', onShift);
        window.removeEventListener('keyup', onShift);
      };

      // Width legend for arrows.
      arrowLegend.append('text')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', theme.palette.black)
        .text('Donated to races in each state');
      [10000, 50000, 100000].forEach((v, i) => {
        const x = i * 110;
        const y = 24;
        arrowLegend.append('line')
          .attr('x1', x).attr('x2', x + 50)
          .attr('y1', y)
          .attr('y2', y)
          .attr('stroke', FLOW_COLOR)
          .attr('stroke-width', strokeWidth(v))
          .attr('opacity', opacityScale(v));
        arrowLegend.append('text')
          .attr('x', x + 58).attr('y', y + 4)
          .attr('font-size', 12)
          .attr('fill', theme.palette.darkGrey)
          .text(formatShort(v));
      });

      // Binned swatch legend for the choropleth, with a separate "none" swatch.
      const swatch = 46;
      const binsX = 56;
      binLegend.append('text')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', theme.palette.black)
        .text('Donated to races in each state');
      binLegend.append('rect')
        .attr('y', 10)
        .attr('width', 30)
        .attr('height', 12)
        .attr('fill', EMPTY_FILL)
        .attr('stroke', '#9aa3ad')
        .attr('stroke-width', 0.75);
      binLegend.append('text')
        .attr('x', 15)
        .attr('y', 36)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', theme.palette.darkGrey)
        .text('None');
      binLegend.selectAll('rect.bin')
        .data(BIN_COLORS)
        .join('rect')
        .attr('class', 'bin')
        .attr('x', (_, i) => binsX + i * swatch)
        .attr('y', 10)
        .attr('width', swatch - 2)
        .attr('height', 12)
        .attr('fill', (c) => c);
      binLegend.selectAll('text.tick')
        .data(BINS)
        .join('text')
        .attr('class', 'tick')
        .attr('x', (_, i) => binsX + (i + 1) * swatch - 1)
        .attr('y', 36)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', theme.palette.darkGrey)
        .text(formatShort);

      applyModeRef.current = (nextMode) => {
        const arrows = nextMode === 'arrows';
        flowLayer.style('display', arrows ? null : 'none');
        originDot.style('display', arrows ? null : 'none');
        arrowLegend.style('display', arrows ? null : 'none');
        binLegend.style('display', arrows ? 'none' : null);
        highlight(null);
        hideTooltip();

        // Arrows label the largest flows below their heads; the choropleth labels
        // the same states (plus California) on the state itself.
        labelLayer.selectAll('*').remove();
        if (arrows) {
          if (origin) {
            label(ORIGIN, source[0] + 4, source[1] + 26, ['California races', formatShort(origin.total)], 'start');
          }
          flows.slice(0, LABELED_STATES).forEach((r) => {
            const [x, y] = anchor(r.state);
            label(r.state, x, y + 22, [r.state, formatShort(r.total)]);
          });
        } else {
          [origin, ...flows.slice(0, LABELED_STATES)].filter(Boolean).forEach((r) => {
            const [x, y] = anchor(r.state);
            label(r.state, x, y - 4, [r.state, formatShort(r.total)], 'middle', true);
          });
        }
        // New labels start where their states currently are.
        applyOffsets(0);
      };
      applyModeRef.current(modeRef.current);

      const otherStates = flows.filter((r) => r.state !== 'DC').length;
      const hasDC = flows.some((r) => r.state === 'DC');
      const notes = [`${formatDollars(outOfState)} went to races in ${otherStates} other states${hasDC ? ' and D.C.' : '.'}`];
      if (unmapped.length) {
        notes.push(`Not mapped: ${unmapped.map((r) => `${UNMAPPED_NAMES[r.state] || r.state} (${formatDollars(r.total)})`).join(', ')}.`);
      }
      d3.select(noteRef.current).text(notes.join(' '));
    });

    return () => {
      cancelled = true;
      removeListeners();
    };
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    if (applyModeRef.current) applyModeRef.current(mode);
  }, [mode]);

  return (
    <figure style={{ margin: '2rem 0', fontFamily: 'Georgia, serif' }}>
      <h3 style={{ margin: '0 0 0.25rem' }}>Where UC employees’ campaign money goes</h3>
      <p style={{ margin: '0 0 0.75rem', color: theme.palette.darkGrey }}>
        Donations from University of California employees to federal candidates, by the state
        of the race.
        {' '}
        {mode === 'arrows'
          ? 'Arrows start at UC Berkeley; bigger and darker arrows mean more money.'
          : 'Darker states drew more money from UC employees.'}
        {' '}
        Hover over a state for details.
      </p>
      <div role="group" aria-label="Map style" style={{ display: 'flex', marginBottom: '0.75rem' }}>
        {MODES.map((m, i) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            style={{
              ...buttonStyle(mode === m.id),
              borderRadius: i === 0 ? '4px 0 0 4px' : '0 4px 4px 0',
              marginLeft: i === 0 ? 0 : -1,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label={mode === 'arrows'
            ? 'Map of the United States with arrows from UC Berkeley to each state, sized by UC employee donations to races there'
            : 'Map of the United States with each state shaded by UC employee donations to races there'}
        />
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            opacity: 0,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '8px 10px',
            fontSize: 13,
            lineHeight: 1.4,
            width: 280,
            maxWidth: '90%',
            transition: 'opacity 0.1s',
          }}
        />
      </div>
      <figcaption style={{ fontSize: 13, color: theme.palette.darkGrey, marginTop: '0.5rem' }}>
        <span ref={noteRef} />
        {' '}
        Source: Federal Election Commission individual contributions, 2025–26 cycle;
        analysis by The Daily Californian.
      </figcaption>
    </figure>
  );
};

export default MoneyFlowMap;
