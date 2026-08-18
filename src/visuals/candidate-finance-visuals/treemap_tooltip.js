import React from 'react';
import * as d3 from 'd3';

import { drawTimescale } from './timescales';

// Committees listed before collapsing the rest into a "+N more" line
const MAX_COMMITTEES = 8;

// Gap between the cursor and the tooltip
const CURSOR_OFFSET = 14;

// Some committee names need to be replaced in the UI
const COMMITTEE_REPLACEMENTS = {
  'Yes on 50, The Election Rigging Response Act, Governor Newsom?s Ballot Measure Committee': "Yes on 50, The Election Rigging Response Act, Governor Newsom's Ballot Measure Committee",
};

const formatContributionDate = d3.utcFormat('%B %-d, %Y');

/**
 * The hover tooltip div. Used twice: once for the candidate, and once, stacked on top, for a
 * single contribution hovered inside the candidate's chart.
 */
export function TreemapTooltip({ innerRef, zIndex = 10 }) {
  return (
    <div
      ref={innerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0,
        pointerEvents: 'none',
        maxWidth: '280px',
        padding: '8px 10px',
        background: 'white',
        border: '1px solid #bbb',
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
        font: '12px sans-serif',
        lineHeight: 1.35,
        color: '#222',
        textAlign: 'left',
        transition: 'opacity 0.15s',
        zIndex,
      }}
    />
  );
}

/**
 * A small uppercase section label inside the tooltip. Returns it, so a caller can add a note.
 */
function appendSectionLabel(tooltip, text) {
  return tooltip
    .append('div')
    .style('margin-top', '6px')
    .style('font-size', '11px')
    .style('text-transform', 'uppercase')
    .style('letter-spacing', '0.04em')
    .style('opacity', 0.6)
    .text(text);
}

/**
 * The committee name to show, cleaned up when the raw data spells it badly.
 */
function committeeLabel(name) {
  return COMMITTEE_REPLACEMENTS[name] || name;
}

/**
 * Dollars for a single contribution: whole ones stay whole, cents are kept.
 */
function formatContribution(amount) {
  return Number.isInteger(amount) ? d3.format('$,d')(amount) : d3.format('$,.2f')(amount);
}

/**
 * Render the three lines describing one contribution: amount, date, and who gave it.
 */
function renderPointTooltip(tooltip, point) {
  tooltip.selectAll('*').remove();

  tooltip
    .append('div')
    .style('font-weight', 'bold')
    .text(`${formatContribution(point.amount)} Contribution`);

  tooltip.append('div').text(formatContributionDate(point.date));

  if (point.initials) {
    tooltip
      .append('div')
      .style('font-style', 'italic')
      .text(`Contributed by ${point.initials}`);
  }
}

/**
 * Render tooltip content.
 */
function renderTooltip(tooltip, {
  name, amount, points, color, committees, formatAmount, onPointEnter, onPointLeave,
}) {
  tooltip.selectAll('*').remove();

  tooltip.append('div').style('font-weight', 'bold').text(name);

  tooltip.append('div').text(amount);

  // Contributions over time, between the total and the committee list
  if (points.length) {
    appendSectionLabel(tooltip, 'Contributions over time')
      .append('span')
      .style('text-transform', 'none')
      .style('font-size', '10px')
      .text(' (log scale)');
    drawTimescale(tooltip.append('div').style('margin-top', '2px'), {
      points, color, onPointEnter, onPointLeave,
    });
  }

  if (!committees.length) {
    return;
  }

  appendSectionLabel(tooltip, committees.length === 1 ? 'Committee' : 'Committees');

  const list = tooltip
    .append('ul')
    .style('margin', '2px 0 0')
    .style('padding-left', '16px')
    .style('line-height', '1.15');

  list
    .selectAll('li')
    .data(committees.slice(0, MAX_COMMITTEES))
    .join('li')
    .style('margin', '0')
    .style('padding', '0')
    .style('line-height', '1.15')
    .text((committee) => `${committeeLabel(committee.name)} ($${formatAmount(committee.amount)})`);

  if (committees.length > MAX_COMMITTEES) {
    tooltip
      .append('div')
      .style('margin-top', '2px')
      .style('opacity', 0.6)
      .text(`+${committees.length - MAX_COMMITTEES} more`);
  }
}

/**
 * Put a tooltip next to the cursor, flipping sides when it would run off the container.
 */
function placeTooltip(node, event, containerNode) {
  const [x, y] = d3.pointer(event, containerNode);
  const { width, height } = node.getBoundingClientRect();

  const left = x + CURSOR_OFFSET + width > containerNode.clientWidth
    ? Math.max(0, x - CURSOR_OFFSET - width)
    : x + CURSOR_OFFSET;
  const top = Math.max(0, y + CURSOR_OFFSET + height > containerNode.clientHeight
    ? y - CURSOR_OFFSET - height
    : y + CURSOR_OFFSET);

  d3.select(node).style('transform', `translate(${left}px, ${top}px)`);
}

/**
 * Hovering a cell shows the candidate tooltip, which follows the cursor. Clicking a cell locks
 * that tooltip in place and makes it interactive, so its chart can be hovered: each contribution
 * then gets its own tooltip on top. A locked tooltip stays put until another cell is entered or
 * clicked, or the page scrolls.
 *
 * Returns a function that detaches the listeners and hides both tooltips.
 */
export function attachTreemapTooltip(selection, {
  tooltip: tooltipNode,
  pointTooltip: pointTooltipNode,
  container: containerNode,
  name,
  amount,
  points,
  color,
  committees,
  formatAmount = d3.format(',d'),
}) {
  if (!tooltipNode || !containerNode) {
    return () => {};
  }

  const tooltip = d3.select(tooltipNode);
  const pointTooltip = pointTooltipNode && d3.select(pointTooltipNode);

  // The cell the tooltip is locked to, or null while it is following the cursor
  let lockedCell = null;

  const hidePoint = () => {
    if (pointTooltip) {
      pointTooltip.style('opacity', 0);
    }
  };

  const onPointEnter = pointTooltip && ((event, point) => {
    renderPointTooltip(pointTooltip, point);
    pointTooltip.style('opacity', 1);
    placeTooltip(pointTooltipNode, event, containerNode);
  });

  // Let the cursor reach the chart once the tooltip stops moving
  const setLockedCell = (cell) => {
    lockedCell = cell;
    tooltip.style('pointer-events', cell ? 'auto' : 'none');

    if (!cell) {
      hidePoint();
    }
  };

  const show = (event, d) => {
    renderTooltip(tooltip, {
      name: name(d),
      amount: amount(d),
      points: points ? points(d) : [],
      color: color ? color(d) : 'currentColor',
      committees: committees(d),
      formatAmount,
      onPointEnter,
      onPointLeave: hidePoint,
    });
    tooltip.style('opacity', 1);
    placeTooltip(tooltipNode, event, containerNode);
  };

  const hide = () => {
    setLockedCell(null);
    tooltip.style('opacity', 0);
  };

  selection
    .on('mouseenter', (event, d) => {
      if (lockedCell === event.currentTarget) {
        return;
      }

      // Entering any other cell releases the lock and goes back to following the cursor
      setLockedCell(null);
      show(event, d);
    })
    .on('mousemove', (event) => {
      if (!lockedCell) {
        placeTooltip(tooltipNode, event, containerNode);
      }
    })
    .on('mouseleave', () => {
      if (!lockedCell) {
        tooltip.style('opacity', 0);
      }
    })
    .on('click', (event, d) => {
      if (lockedCell !== event.currentTarget) {
        show(event, d);
      }

      setLockedCell(event.currentTarget);
    });

  // Scrolling moves the treemap out from under a locked tooltip, so let it go
  const handleScroll = () => {
    if (lockedCell) {
      hide();
    }
  };

  // Capture, because the scroll may happen on an ancestor element rather than the window
  document.addEventListener('scroll', handleScroll, true);

  return () => {
    document.removeEventListener('scroll', handleScroll, true);
    hide();
  };
}

/**
 * Hide the tooltip (used when the treemap is torn down or redrawn).
 */
export function hideTreemapTooltip(tooltipNode) {
  if (tooltipNode) {
    d3.select(tooltipNode).style('opacity', 0);
  }
}
