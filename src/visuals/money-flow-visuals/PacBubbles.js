import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { withPrefix } from 'gatsby';
import { theme } from '../../styles/theme';
import isUnlocked from './unlock';

// Built from scripts/uc_pac_recipients.py: the top PACs by UC employee dollars,
// plus a final OTHER row summing the rest.
const DATA_URL = withPrefix('/money-flow/uc_pac_recipients.csv');

// Wider than tall so the type labels beside the ring have room.
const WIDTH = 1140;
const HEIGHT = 860;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
// More contributions sit farther from the center.
// The inner ring is wide because most PACs got only a few contributions and
// need room around it.
const RING_OUTER = 370;
const RING_INNER = 192;
// Circles stay outside this radius so the center label stays clear.
const CENTER_CLEAR = 140;
// Same gap between every pair of neighbouring circles.
const PADDING = 2.5;
// Smallest circle radius, so PACs with a few hundred dollars stay visible.
const MIN_RADIUS = 5;
const RING_TICKS = [1, 10, 100, 1000];

// Legend order. Around the ring the types run clockwise from the bottom-left as
// Traditional, Leadership, Hybrid, Super; each of those adjacent pairs passes
// the colorblind-separation check, and Super and Traditional are kept apart by
// the open wedge at the bottom that holds the ring labels.
const RING_ORDER = ['Traditional', 'Leadership', 'Hybrid', 'Super'];
const LABEL_WEDGE = 0.6;
const TYPES = [
  { id: 'Hybrid', label: 'Hybrid PACs', color: '#4B9CCF' },
  { id: 'Super', label: 'Super PACs', color: '#F28147' },
  { id: 'Traditional', label: 'Traditional PACs', color: '#30B189' },
  { id: 'Leadership', label: 'Leadership PACs', color: '#8a5cc0' },
];
const COLORS = new Map(TYPES.map((t) => [t.id, t.color]));
const LABELED_PACS = 4;
// Circles outside a hovered ring label's group fade to this.
const MUTED_FILL = '#d9d9d9';
const MUTED_STROKE = '#c6c6c6';
// While Shift is held, circles slide away from the cursor: one right under it
// ends up SCATTER_CLEARANCE beyond its own edge, and the push fades to nothing
// SCATTER_REACH farther out.
const SCATTER_CLEARANCE = 30;
const SCATTER_REACH = 90;

const formatDollars = d3.format('$,.0f');
const formatMillions = (v) => `$${d3.format('.1f')(v / 1e6)} million`;
const formatShort = (v) => {
  if (v >= 1e6) return `$${d3.format('.1f')(v / 1e6)}M`;
  return v >= 1000 ? `$${d3.format(',.0f')(v / 1000)}K` : formatDollars(v);
};
const formatContributions = (n) => `${d3.format(',')(n)} contribution${n === 1 ? '' : 's'}`;

// Histogram bin labels sit on the boundaries between bars: "10" is where the
// $10-24 bar starts, and the last bar is everything from the last label up.
// Dollar signs are left to the axis title to save room.
const formatEdge = (v) => (v >= 1000 ? `${v / 1000}K` : `${v}`);

// A small inline-SVG histogram of one PAC's contribution sizes for the tooltip,
// in that PAC's type color. Bins are unequal in width (they follow common round
// amounts), so bars are evenly spaced with the bin edges labelled between them.
// Counts sit above the bars since the tooltip itself can't be hovered.
const histogram = (counts, bins, color) => {
  const w = 256;
  const h = 64;
  const top = 12;
  const slot = w / counts.length;
  const y = d3.scaleLinear().domain([0, d3.max(counts) || 1]).range([h, top]);
  const bars = counts.map((c, i) => {
    const x = i * slot + 1;
    // Nonzero bars are at least 2px tall so small counts stay visible.
    const barTop = Math.min(y(c), h - 2);
    const rect = c
      ? `<rect x="${x}" y="${barTop}" width="${slot - 2}" height="${h - barTop}" rx="1" fill="${color}"/>`
      : '';
    const count = c
      ? `<text x="${x + (slot - 2) / 2}" y="${barTop - 3}" text-anchor="middle" font-size="10.5" fill="${theme.palette.darkGrey}">${d3.format(',')(c)}</text>`
      : '';
    return rect + count;
  }).join('');
  const edges = bins.slice(1).map((b, i) => `<text x="${(i + 1) * slot}" y="${h + 14}" text-anchor="middle" font-size="10.5" fill="${theme.palette.darkGrey}">${formatEdge(b)}</text>`).join('');
  return `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e3e3e3">
    <strong>Contributions by size</strong>
    <svg width="${w}" height="${h + 32}" viewBox="0 0 ${w} ${h + 32}" style="display:block;margin-top:2px;max-width:100%" role="img" aria-label="Histogram of contribution sizes">
      <line x1="0" x2="${w}" y1="${h}" y2="${h}" stroke="#9aa3ad" stroke-width="1"/>
      ${bars}${edges}
      <text x="${w / 2}" y="${h + 28}" text-anchor="middle" font-size="10.5" fill="${theme.palette.darkGrey}">Contribution size ($)</text>
    </svg>
  </div>`;
};

const PacBubbles = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const noteRef = useRef();

  useEffect(() => {
    let cancelled = false;
    let removeListeners = () => {};
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    d3.csv(DATA_URL, (r) => ({
      id: r.committee_id,
      name: r.name,
      type: r.type,
      contributions: +r.contributions,
      total: +r.total,
      // Histogram counts, one per n_<edge> column, in column order.
      sizes: Object.keys(r).filter((k) => k.startsWith('n_')).map((k) => +r[k]),
    })).then((rows) => {
      if (cancelled) return;
      const bins = rows.columns.filter((k) => k.startsWith('n_')).map((k) => +k.slice(2));
      const other = rows.find((r) => r.id === 'OTHER');
      const pacs = rows.filter((r) => r.id !== 'OTHER');
      const grandTotal = d3.sum(rows, (r) => r.total);

      const ring = d3.scaleLog()
        .domain([1, d3.max(pacs, (p) => p.contributions)])
        .range([RING_INNER, RING_OUTER]);
      // Radius grows with the square root of dollars on top of a small floor, so
      // area tracks dollars while the smallest PACs remain visible circles.
      const radius = d3.scaleSqrt()
        .domain([0, d3.max(pacs, (p) => p.total)])
        .range([MIN_RADIUS, 66]);

      // Each type gets a slice of the ring, with a small gap between slices and the label wedge centered at the
      // bottom. Angle 0 points up, increasing clockwise.
      const gap = 0.08;
      const ringTypes = RING_ORDER.map((id) => TYPES.find((t) => t.id === id));
      // Size slices by the summed diameters of their circles, so a type with a few
      // huge circles gets as much room as one with many small ones.
      const counts = ringTypes.map((t) => d3.sum(pacs.filter((p) => p.type === t.id), (p) => radius(p.total)));
      const span = 2 * Math.PI - LABEL_WEDGE - gap * (ringTypes.length - 1);
      let start = Math.PI + LABEL_WEDGE / 2;
      const sectors = ringTypes.map((t, i) => {
        const width = (span * counts[i]) / d3.sum(counts);
        const sector = { ...t, start, end: start + width };
        start += width + gap;
        return sector;
      });
      const sectorById = new Map(sectors.map((s) => [s.id, s]));
      const point = (angle, r) => [CX + r * Math.sin(angle), CY - r * Math.cos(angle)];

      // Spread each type's PACs evenly across its slice (largest first, so big
      // bubbles don't bunch up), then let a collision simulation settle them
      // near their ring distance.
      const nodes = [];
      sectors.forEach((s) => {
        const members = pacs.filter((p) => p.type === s.id).sort((a, b) => b.total - a.total);
        members.forEach((p, i) => {
          const angle = s.start + ((i * 0.618034) % 1) * (s.end - s.start);
          const [tx, ty] = point(angle, ring(p.contributions));
          nodes.push({
            ...p, r: radius(p.total), tx, ty, x: tx, y: ty,
          });
        });
      });
      // Push any circle that drifts into the middle back out to CENTER_CLEAR.
      const keepCenterClear = () => {
        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          const dx = node.x - CX;
          const dy = node.y - CY;
          const dist = Math.hypot(dx, dy) || 1;
          const min = CENTER_CLEAR + node.r;
          if (dist < min) {
            node.x = CX + (dx / dist) * min;
            node.y = CY + (dy / dist) * min;
          }
        }
      };
      // Keep each circle, edge included, inside its type's slice of the ring, so
      // slices stay distinct and the label wedge at the bottom stays open.
      const keepInSector = () => {
        const tau = 2 * Math.PI;
        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          const { start: lo, end: hi } = sectorById.get(node.type);
          const dx = node.x - CX;
          const dy = node.y - CY;
          const dist = Math.hypot(dx, dy) || 1;
          const margin = Math.min(node.r / dist, (hi - lo) / 2);
          const width = hi - lo - 2 * margin;
          const angle = Math.atan2(dx, -dy);
          const rel = (((angle - lo - margin) % tau) + tau) % tau;
          if (rel > width) {
            // Snap to whichever edge of the slice is nearer.
            const clamped = lo + margin + (rel - width < tau - rel ? width : 0);
            node.x = CX + dist * Math.sin(clamped);
            node.y = CY - dist * Math.cos(clamped);
          }
        }
      };
      // Weak pulls toward each circle's target with a firm, uniformly padded
      // collision, run long and slow so circles settle evenly spaced.
      const simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX((d) => d.tx).strength(0.06))
        .force('y', d3.forceY((d) => d.ty).strength(0.06))
        .force('radial', d3.forceRadial((d) => ring(d.contributions), CX, CY).strength(0.3))
        .force('collide', d3.forceCollide((d) => d.r + PADDING).strength(1).iterations(6))
        .force('center-clear', keepCenterClear)
        .force('sector', keepInSector)
        .alphaDecay(0.01)
        .stop();
      for (let i = 0; i < 600; i += 1) simulation.tick();

      svg.selectAll('*').remove();

      // Ring gridlines, labelled down the bottom like a ruler.
      const ticks = RING_TICKS.filter((t) => t <= ring.domain()[1]);
      const gridRings = svg.append('g')
        .attr('pointer-events', 'none')
        .selectAll('circle')
        .data(ticks)
        .join('circle')
        .attr('cx', CX)
        .attr('cy', CY)
        .attr('r', (t) => ring(t))
        .attr('fill', 'none')
        .attr('stroke', '#dcdcdc');

      const bubbles = svg.append('g')
        .selectAll('circle')
        .data(nodes.sort((a, b) => b.r - a.r))
        .join('circle')
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', (d) => d.r)
        .attr('fill', (d) => COLORS.get(d.type))
        .attr('fill-opacity', 0.85)
        .attr('stroke', (d) => d3.color(COLORS.get(d.type)).darker(0.6))
        .attr('stroke-width', 1)
        .style('cursor', 'pointer');

      const labels = svg.append('g').attr('pointer-events', 'none');
      const halo = (sel) => sel
        .attr('paint-order', 'stroke')
        .attr('stroke', theme.palette.background)
        .attr('stroke-width', 4)
        .attr('stroke-linejoin', 'round');

      const ringLabels = svg.append('g')
        .selectAll('text')
        .data(ticks)
        .join('text')
        .attr('x', CX)
        .attr('y', (t) => CY + ring(t) + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14.5)
        .attr('fill', theme.palette.black)
        .style('cursor', 'pointer')
        .text((t) => (t === 1 ? '1 contribution' : `${d3.format(',')(t)}+ contributions`))
        .call(halo);

      // Ring labels double as filters: hovering one grays out every PAC that
      // doesn't match it ("1 contribution" is exactly one; "10+" is ten or more).
      const matchesTick = (t, d) => (t === 1 ? d.contributions === 1 : d.contributions >= t);
      const baseStroke = (d) => d3.color(COLORS.get(d.type)).darker(0.6);
      const filterByTick = (t) => {
        bubbles
          .attr('fill', (d) => (t === null || matchesTick(t, d) ? COLORS.get(d.type) : MUTED_FILL))
          .attr('stroke', (d) => (t === null || matchesTick(t, d) ? baseStroke(d) : MUTED_STROKE));
        gridRings.attr('stroke', (r) => (r === t ? '#9aa3ad' : '#dcdcdc'));
        ringLabels.attr('font-weight', (r) => (r === t ? 700 : 400));
      };
      ringLabels
        .on('mouseenter', (_event, t) => filterByTick(t))
        .on('mouseleave', () => filterByTick(null));

      // Type names around the outside of the ring.
      sectors.forEach((s) => {
        const mid = (s.start + s.end) / 2;
        const [x, y] = point(mid, RING_OUTER + 66);
        const total = d3.sum(pacs.filter((p) => p.type === s.id), (p) => p.total);
        // Center labels near the top and bottom; anchor side labels away from the ring.
        let anchor = Math.sin(mid) > 0 ? 'start' : 'end';
        if (Math.abs(Math.sin(mid)) < 0.3) anchor = 'middle';
        const text = labels.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
          .attr('font-size', 16)
          .attr('fill', theme.palette.black);
        text.append('tspan').attr('x', x).attr('font-weight', 700).text(s.label);
        text.append('tspan').attr('x', x).attr('dy', '1.2em').attr('fill', theme.palette.darkGrey)
          .text(formatShort(total));
      });

      // Name the few largest recipients directly.
      const nameLabels = labels.append('g')
        .selectAll('text')
        .data(nodes.slice().sort((a, b) => b.total - a.total).slice(0, LABELED_PACS))
        .join('text')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12.5)
        .attr('font-weight', 700)
        .attr('fill', theme.palette.black)
        .text((d) => (d.name.length > 22 ? `${d.name.slice(0, 20)}…` : d.name))
        .call(halo);

      const centerText = labels.append('text')
        .attr('x', CX)
        .attr('y', CY - 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', 23)
        .attr('font-weight', 700)
        .attr('fill', theme.palette.black);
      centerText.append('tspan').attr('x', CX).text('UC employees gave');
      centerText.append('tspan').attr('x', CX).attr('dy', '1.25em')
        .text(`${formatMillions(grandTotal)} to PACs`);

      const showTooltip = (event, d) => {
        const box = svgRef.current.parentNode.getBoundingClientRect();
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.name}</strong><br/>`
            + `<span style="color:${theme.palette.darkGrey}">${sectorById.get(d.type).label.replace(/s$/, '')}</span><br/>`
            + `${formatDollars(d.total)} from ${formatContributions(d.contributions)}`
            + `${histogram(d.sizes, bins, COLORS.get(d.type))}`);
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        tooltip
          .style('left', `${Math.max(0, Math.min(x + 14, box.width - tooltipRef.current.offsetWidth))}px`)
          .style('top', `${y > box.height / 2 ? y - tooltipRef.current.offsetHeight - 14 : y + 14}px`);
      };

      bubbles
        .on('mouseenter mousemove', function handleHover(event, d) {
          d3.select(this).attr('stroke', theme.palette.black).attr('stroke-width', 2).raise();
          showTooltip(event, d);
        })
        .on('mouseleave', function handleLeave(_event, d) {
          d3.select(this).attr('stroke', baseStroke(d)).attr('stroke-width', 1);
          tooltip.style('opacity', 0);
        });

      // Holding Shift scatters circles away from the cursor and turns off their
      // hover, so none of them can be hovered. Releasing Shift (or leaving the
      // chart) lets them glide back.
      let pointer = null;
      let scattering = false;
      const scatteredPosition = (d, [mx, my]) => {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.hypot(dx, dy);
        const near = d.r + SCATTER_CLEARANCE;
        if (dist >= near + SCATTER_REACH) return [d.x, d.y];
        // Ease the push off with distance: right under the cursor a circle is
        // pushed to `near`; at the edge of the reach it doesn't move.
        const angle = dist > 0 ? Math.atan2(dy, dx) : Math.atan2(d.y - CY, d.x - CX);
        const pushed = near + (dist / (near + SCATTER_REACH)) * SCATTER_REACH;
        return [mx + pushed * Math.cos(angle), my + pushed * Math.sin(angle)];
      };
      const moveTo = (positionOf, duration) => {
        const positions = new Map(nodes.map((d) => [d, positionOf(d)]));
        bubbles.transition('scatter').duration(duration).ease(d3.easeCubicOut)
          .attr('cx', (d) => positions.get(d)[0])
          .attr('cy', (d) => positions.get(d)[1]);
        nameLabels.transition('scatter').duration(duration).ease(d3.easeCubicOut)
          .attr('x', (d) => positions.get(d)[0])
          .attr('y', (d) => positions.get(d)[1] + 4);
      };
      const setScattering = (on) => {
        if (on === scattering) return;
        scattering = on;
        bubbles.attr('pointer-events', on ? 'none' : null);
        if (on) {
          tooltip.style('opacity', 0);
          bubbles.attr('stroke-width', 1).attr('stroke', baseStroke);
        } else {
          moveTo((d) => [d.x, d.y], 400);
        }
      };
      // Only wired up when the URL unlocks it.
      if (isUnlocked()) {
        svg
          .on('mousemove.scatter', (event) => {
            pointer = d3.pointer(event, svg.node());
            setScattering(event.shiftKey);
            if (scattering) moveTo((d) => scatteredPosition(d, pointer), 150);
          })
          .on('mouseleave.scatter', () => {
            pointer = null;
            setScattering(false);
          });
        // Pressing or releasing Shift without moving the mouse also counts.
        const onShift = (event) => {
          if (event.key !== 'Shift') return;
          setScattering(event.type === 'keydown' && pointer !== null);
          if (scattering) moveTo((d) => scatteredPosition(d, pointer), 150);
        };
        window.addEventListener('keydown', onShift);
        window.addEventListener('keyup', onShift);
        removeListeners = () => {
          window.removeEventListener('keydown', onShift);
          window.removeEventListener('keyup', onShift);
        };
      }

      if (other) {
        d3.select(noteRef.current).text(
          `Not shown: ${other.name} that received ${formatDollars(other.total)} `
          + `from ${formatContributions(other.contributions)}; each got less than `
          + `${formatDollars(d3.min(pacs, (p) => p.total))}.`,
        );
      }
    });

    return () => {
      cancelled = true;
      removeListeners();
    };
  }, []);

  return (
    <figure style={{ margin: '2rem 0', fontFamily: 'Georgia, serif' }}>
      <h3 style={{ margin: '0 0 0.25rem' }}>Which PACs UC employees fund</h3>
      <p style={{ margin: '0 0 0.75rem', color: theme.palette.darkGrey }}>
        Each circle is a PAC that received money from University of California employees.
        Bigger circles received more dollars; circles farther from the center received more
        individual contributions. Hover over a circle for details.
      </p>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 15, marginBottom: '0.5rem',
      }}
      >
        {TYPES.map((t) => (
          <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%', background: t.color, display: 'inline-block',
            }}
            />
            {t.label}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Bubble chart of PACs funded by UC employees, grouped by PAC type, sized by dollars and placed by number of contributions"
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
            fontSize: 14,
            lineHeight: 1.4,
            width: 280,
            maxWidth: '90%',
            transition: 'opacity 0.1s',
          }}
        />
      </div>
      <figcaption style={{ fontSize: 14, color: theme.palette.darkGrey, marginTop: '0.5rem' }}>
        <span ref={noteRef} />
        {' '}
        {/* Removed explainer: "Circles have a minimum size so the smallest PACs stay visible.
            Hybrid PACs keep both a limited account and an unlimited super PAC account; FEC
            records don't say which one received a contribution. Contributions passed through
            ActBlue or WinRed are counted at the PAC that received them; refunds are
            subtracted." */}
        Source: Brendan Raykoff/The Daily Californian; Federal Election Commission individual
        contributions, 2025–26 cycle
      </figcaption>
    </figure>
  );
};

export default PacBubbles;
