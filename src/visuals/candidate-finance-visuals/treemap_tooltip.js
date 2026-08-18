import React from 'react';
import * as d3 from 'd3';

// Committees listed before collapsing the rest into a "+N more" line
const MAX_COMMITTEES = 8;

// Gap between the cursor and the tooltip
const CURSOR_OFFSET = 14;

/**
 * The hover tooltip div.
 */
export function TreemapTooltip({ innerRef }) {
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
        zIndex: 10,
      }}
    />
  );
}

/**
 * Render tooltip content.
 */
function renderTooltip(tooltip, name, amount, committees, formatAmount) {
  tooltip.selectAll('*').remove();

  tooltip.append('div').style('font-weight', 'bold').text(name);

  tooltip.append('div').text(amount);

  if (!committees.length) {
    return;
  }

  tooltip
    .append('div')
    .style('margin-top', '6px')
    .style('font-size', '11px')
    .style('text-transform', 'uppercase')
    .style('letter-spacing', '0.04em')
    .style('opacity', 0.6)
    .text(committees.length === 1 ? 'Committee' : 'Committees');

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
    .text((committee) => `${committee.name} ($${formatAmount(committee.amount)})`);

  if (committees.length > MAX_COMMITTEES) {
    tooltip
      .append('div')
      .style('margin-top', '2px')
      .style('opacity', 0.6)
      .text(`+${committees.length - MAX_COMMITTEES} more`);
  }
}

/**
 * Mouseover, mousemove, mouseleave handlers for tooltips.
 */
export function attachTreemapTooltip(selection, {
  tooltip: tooltipNode,
  container: containerNode,
  name,
  amount,
  committees,
  formatAmount = d3.format(',d'),
}) {
  if (!tooltipNode || !containerNode) {
    return;
  }

  const tooltip = d3.select(tooltipNode);

  const move = (event) => {
    const [x, y] = d3.pointer(event, containerNode);
    const { width: tooltipWidth, height: tooltipHeight } = tooltipNode.getBoundingClientRect();
    const containerWidth = containerNode.clientWidth;

    // Flip to the other side of the cursor when the tooltip would run off the container
    const left = x + CURSOR_OFFSET + tooltipWidth > containerWidth
      ? Math.max(0, x - CURSOR_OFFSET - tooltipWidth)
      : x + CURSOR_OFFSET;
    const top = Math.max(0, y + CURSOR_OFFSET + tooltipHeight > containerNode.clientHeight
      ? y - CURSOR_OFFSET - tooltipHeight
      : y + CURSOR_OFFSET);

    tooltip.style('transform', `translate(${left}px, ${top}px)`);
  };

  selection
    .on('mouseover', (event, d) => {
      renderTooltip(tooltip, name(d), amount(d), committees(d), formatAmount);
      tooltip.style('opacity', 1);
      move(event);
    })
    .on('mousemove', move)
    .on('mouseleave', () => {
      tooltip.style('opacity', 0);
    });
}

/**
 * Hide the tooltip (used when the treemap is torn down or redrawn).
 */
export function hideTreemapTooltip(tooltipNode) {
  if (tooltipNode) {
    d3.select(tooltipNode).style('opacity', 0);
  }
}
