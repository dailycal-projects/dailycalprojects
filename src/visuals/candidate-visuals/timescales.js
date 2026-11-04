import * as d3 from 'd3';

// URLs of the csv files holding one row per individual contribution
export const POINTS_CSV_URLS = {
  state: '/candidate/finance_points_state_v2.csv',
  federal: '/candidate/finance_points_fec_v2.csv',
};

// Treemap amount column
const SOURCE_BUCKETS = {
  cityofberkeley_amount: 'city',
  ucberkeley_amount: 'ucb',
  both_amount: 'both',
};

// Fixed x axis window: August 1, 2025 through August 1, 2026
export const TIMESCALE_START = new Date(Date.UTC(2025, 7, 1));
export const TIMESCALE_END = new Date(Date.UTC(2026, 7, 1));

// Chart dimensions (sized to sit inside the tooltip)
const WIDTH = 240;
const HEIGHT = 92;
const MARGIN = {
  top: 6,
  right: 18, // room for the last month label
  bottom: 16,
  left: 40, // room for the dollar labels
};

const POINT_RADIUS = 2;

// How close the cursor has to get before a contribution counts as hovered
const HOVER_RADIUS = 12;

// Minimum vertical gap between dollar labels, so a short chart never stacks them
const TICK_GAP = 16;

const parseDate = d3.utcParse('%Y-%m-%d');

/**
 * d3.pointer reads clientX/clientY straight off the event, and a touch event carries those on its
 * Touch objects instead, so hand it the touch when there is one.
 */
export function pointerSource(event) {
  return (event.changedTouches && event.changedTouches[0]) || event;
}

/**
 * Group contributions by the candidate hash they belong to, parsing each row once.
 * Rows outside the x axis window or without a date or dollar amount are dropped.
 */
export function indexPointsByHash(rows) {
  const index = new Map();

  rows.forEach((row) => {
    const date = parseDate(row.date);
    const amount = Number(row.amount);

    if (!date || !Number.isFinite(amount) || amount === 0) {
      return;
    }

    if (date < TIMESCALE_START || date > TIMESCALE_END) {
      return;
    }

    const points = index.get(row.hash);
    const point = {
      date,
      amount,
      bucket: row.bucket,
      // Blank until the initials column lands in the points csv files
      initials: (row.initials || '').trim(),
    };

    if (points) {
      points.push(point);
    } else {
      index.set(row.hash, [point]);
    }
  });

  return index;
}

/**
 * Every contribution to the given candidate hashes that counts towards the active source,
 * oldest first.
 */
export function pointsForHashes(index, hashes, sources) {
  if (!index) {
    return [];
  }

  const buckets = new Set(sources.map((column) => SOURCE_BUCKETS[column]));

  return hashes
    .flatMap((hash) => index.get(hash) || [])
    .filter((point) => buckets.has(point.bucket))
    .sort((a, b) => a.date - b.date);
}

/**
 * Dollar gridlines for a symlog axis
 */
function dollarTicks(y) {
  const [lowest, highest] = y.domain();
  const values = lowest <= 0 ? [0] : [];

  for (let power = 0; 10 ** power <= highest; power += 1) {
    if (10 ** power >= lowest) {
      values.push(10 ** power);
    }
  }

  return values.reduce((kept, value) => {
    const previous = kept[kept.length - 1];

    if (previous === undefined || Math.abs(y(value) - y(previous)) >= TICK_GAP) {
      kept.push(value);
    }

    return kept;
  }, []);
}

/**
 * Cover the plot with a transparent rect that reports the contribution nearest the cursor, and
 * ring that contribution while it is hovered.
 */
function attachPointHover(svg, {
  points, x, y, color, onPointEnter, onPointLeave,
}) {
  const nearest = d3.Delaunay.from(points, (point) => x(point.date), (point) => y(point.amount));

  const highlight = svg
    .append('circle')
    .attr('r', POINT_RADIUS + 2)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 1.5)
    .attr('opacity', 0);

  let hovered = null;

  const leave = () => {
    if (hovered !== null) {
      hovered = null;
      highlight.attr('opacity', 0);

      if (onPointLeave) {
        onPointLeave();
      }
    }
  };

  // Pick out the contribution nearest the pointer, if one is close enough
  const probe = (event) => {
    const [pointerX, pointerY] = d3.pointer(pointerSource(event), event.currentTarget);
    const index = nearest.find(pointerX, pointerY);
    const point = points[index];
    const distance = Math.hypot(x(point.date) - pointerX, y(point.amount) - pointerY);

    if (distance > HOVER_RADIUS) {
      leave();
      return;
    }

    hovered = index;
    highlight
      .attr('cx', x(point.date))
      .attr('cy', y(point.amount))
      .attr('opacity', 1);
    onPointEnter(event, point);
  };

  // A finger on the plot is reading it, not panning the treemap underneath
  const touchProbe = (event) => {
    event.preventDefault();
    probe(event);
  };

  svg
    .append('rect')
    .attr('x', MARGIN.left)
    .attr('y', MARGIN.top)
    .attr('width', WIDTH - MARGIN.left - MARGIN.right)
    .attr('height', HEIGHT - MARGIN.top - MARGIN.bottom)
    .attr('fill', 'transparent')
    .on('mousemove', probe)
    .on('mouseleave', leave)
    .on('touchstart', touchProbe)
    .on('touchmove', touchProbe);
}

/**
 * Draw the contributions-over-time scatter into a d3 selection.
 *
 * `onPointEnter(event, point)` and `onPointLeave()` are optional to make the dots hoverable.
 */
export function drawTimescale(parent, {
  points, color, onPointEnter, onPointLeave,
}) {
  if (!points || !points.length) {
    return null;
  }

  // The dates are parsed as UTC, so the axis reads them as UTC too
  const x = d3
    .scaleUtc()
    .domain([TIMESCALE_START, TIMESCALE_END])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  // Contributions run from a few dollars to six figures, so a symlog axis keeps the small ones
  // readable; unlike a log axis it also handles the $0 baseline and negative refunds.
  const [smallest, largest] = d3.extent(points, (point) => point.amount);

  const y = d3
    .scaleSymlog()
    .domain([Math.min(0, smallest), largest])
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  const svg = parent
    .append('svg')
    .attr('viewBox', [0, 0, WIDTH, HEIGHT])
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .style('display', 'block')
    .style('font', '9px sans-serif');

  // Horizontal gridlines, doubling as the y axis ticks
  const yAxis = svg
    .append('g')
    .attr('transform', `translate(${MARGIN.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickValues(dollarTicks(y))
        .tickFormat((value) => `$${d3.format('~s')(value)}`),
    );

  yAxis.select('.domain').remove();
  yAxis.selectAll('.tick text').attr('fill', '#555');
  yAxis
    .selectAll('.tick line')
    .attr('x2', WIDTH - MARGIN.left - MARGIN.right)
    .attr('stroke', '#e4e4e4');

  // Months along the bottom
  const xAxis = svg
    .append('g')
    .attr('transform', `translate(0,${HEIGHT - MARGIN.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(d3.utcMonth.every(3))
        .tickFormat(d3.utcFormat("%b '%y"))
        .tickSizeOuter(0),
    );

  xAxis.select('.domain').attr('stroke', '#bbb');
  xAxis.selectAll('.tick line').attr('stroke', '#bbb');
  xAxis.selectAll('.tick text').attr('fill', '#555');

  // One dot per contribution
  svg
    .append('g')
    .selectAll('circle')
    .data(points)
    .join('circle')
    .attr('cx', (point) => x(point.date))
    .attr('cy', (point) => y(point.amount))
    .attr('r', POINT_RADIUS)
    .attr('fill', color)
    .attr('fill-opacity', 0.55);

  if (onPointEnter) {
    attachPointHover(svg, {
      points, x, y, color, onPointEnter, onPointLeave,
    });
  }

  return svg;
}
