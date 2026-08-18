import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import { TreemapTooltip, attachTreemapTooltip, hideTreemapTooltip } from './treemap_tooltip';

// URLs of the csv files
const CSV_URLS = {
  state: '/candidate-finance/state_finance_treemap_v4.csv',
  federal: '/candidate-finance/federal_finance_treemap_v4.csv',
};

// Treemap dimensions (shared with Datawrapper charts)
export const WIDTH = 1200;
const HEIGHT = 600;

/**
 * Observable's DOM.uid replacement for clipPath / rect ids
 */
function uid(prefix) {
  uid.next = (uid.next || 0) + 1;
  const id = `${prefix}-${uid.next}`;
  return {
    id,
    href: `#${id}`,
    toString() {
      return `url(#${id})`;
    },
  };
}

// Amount columns to merge when deduping leaves with the same id
const AMOUNT_COLUMNS = [
  'cityofberkeley_amount',
  'ucberkeley_amount',
  'both_amount',
];

// Other combines the smallest leaves until they reach this share of total dollars
const OTHER_FRACTION_STATE = 0.01;
const OTHER_FRACTION_FEDERAL = 0.065;

/**
 * Dedup leaves with same id (summing amounts), drop zeros, and group smallest leaves into Other.
 */
function filterChildren(node, sources, datasetKey) {
  dedupChildren(node, sources);
  foldSmallestIntoOther(node, sources, datasetKey);
}

/**
 * Get committee name from a leaf's CSV row, or '' if missing.
 */
function committeeNameOf(node) {
  const name = node.data && node.data.committee_name;
  return (name && String(name).trim()) || '';
}

/**
 * One committee and its dollars for the active source columns.
 */
function committeeEntryOf(node, sources) {
  const name = committeeNameOf(node);
  if (!name) {
    return null;
  }
  return { name, amount: sumSourceAmounts(node.data, sources) };
}

/**
 * Sum amounts when the same committee name appears more than once.
 */
function mergeCommitteeEntries(entries) {
  const byName = new Map();
  for (const { name, amount } of entries) {
    byName.set(name, (byName.get(name) || 0) + amount);
  }
  return [...byName.entries()].map(([name, amount]) => ({ name, amount }));
}

/**
 * Get committees included in this node (can be several if deduped).
 * Each entry is `{ name, amount }`.
 */
function committeesOf(node) {
  return node.committees || [];
}

/**
 * Committees for the tooltip, deduped and sorted largest donation first.
 */
function displayCommitteesOf(node) {
  return mergeCommitteeEntries(committeesOf(node))
    .sort((a, b) => b.amount - a.amount);
}

function dedupChildren(node, sources) {
  if (!node.children) {
    const entry = committeeEntryOf(node, sources);
    node.committees = entry ? [entry] : [];
    return;
  }

  // Recurse into internal nodes first
  for (const child of node.children) {
    if (child.children) {
      dedupChildren(child, sources);
    }
  }

  // Dedupe leaves by id, summing all amount columns
  const seen = {};
  const deduped = [];

  for (const child of node.children) {
    if (child.children) {
      // Not a leaf node, keep it
      deduped.push(child);
      continue;
    }

    const entry = committeeEntryOf(child, sources);

    if (child.id in seen) {
      // Leaf node that is a duplicate key, sum amounts and committees
      const existing = seen[child.id];
      AMOUNT_COLUMNS.forEach((col) => {
        existing.data[col] = Number(existing.data[col] || 0) + Number(child.data[col] || 0);
      });
      if (entry) {
        existing.committees.push(entry);
      }
    } else {
      // Clone data so we don't mutate the cached CSV row
      const merged = {
        ...child,
        data: { ...child.data },
        committees: entry ? [entry] : [],
      };
      AMOUNT_COLUMNS.forEach((col) => {
        merged.data[col] = Number(merged.data[col] || 0);
      });
      seen[child.id] = merged;
      deduped.push(merged);
    }
  }

  // Drop zero/negative leaves; keep internals and positive leaves
  node.children = deduped.filter((child) => (
    child.children || sumSourceAmounts(child.data, sources) > 0
  ));

  node.committees = mergeCommitteeEntries(node.children.flatMap(committeesOf));
}

/**
 * Return every leaf under node.
 */
function collectLeaves(node) {
  if (!node.children) {
    return [node];
  }

  return node.children.flatMap(collectLeaves);
}

/**
 * Fold smallest leaves (by dollars) into per-group Other tiles until Other is as close to
 * possible to the election's cutoff of the total.
 */
function foldSmallestIntoOther(root, sources, datasetKey) {
  const leaves = collectLeaves(root);
  const total = leaves.reduce((sum, leaf) => sum + sumSourceAmounts(leaf.data, sources), 0);
  const fraction = datasetKey === 'federal' ? OTHER_FRACTION_FEDERAL : OTHER_FRACTION_STATE;
  const budget = total * fraction;

  // Sort leaves by amount
  const ranked = [...leaves].sort(
    (a, b) => sumSourceAmounts(a.data, sources) - sumSourceAmounts(b.data, sources),
  );

  const smallSet = new Set();
  let otherSum = 0;

  // Add to smallSet until they are just about to go over the budget
  for (const leaf of ranked) {
    const amount = sumSourceAmounts(leaf.data, sources);
    if (otherSum + amount > budget) {
      break;
    }
    smallSet.add(leaf);
    otherSum += amount;
  }

  foldOtherAtNode(root, sources, smallSet);
}

/**
 * Replace this node's small leaves with a single Other child.
 */
function foldOtherAtNode(node, sources, smallSet) {
  if (!node.children) {
    return;
  }

  for (const child of node.children) {
    if (child.children) {
      foldOtherAtNode(child, sources, smallSet);
    }
  }

  const remainingChildren = [];
  const smallLeaves = [];
  let otherSum = 0;

  for (const child of node.children) {
    if (child.children) {
      remainingChildren.push(child);
      continue;
    }

    if (smallSet.has(child)) {
      otherSum += sumSourceAmounts(child.data, sources);
      smallLeaves.push(child);
    } else {
      remainingChildren.push(child);
    }
  }

  if (smallLeaves.length > 1) {
    const otherData = {};
    if (sources.length) {
      otherData[sources[0]] = otherSum;
      sources.slice(1).forEach((col) => {
        otherData[col] = 0;
      });
    }

    remainingChildren.push({
      id: `${node.id}/Other (${smallLeaves.length})`,
      parentId: node.id,
      data: otherData,
      committees: mergeCommitteeEntries(smallLeaves.flatMap(committeesOf)),
    });
  } else if (smallLeaves.length === 1) {
    // Don't drop a lone small leaf when Other isn't created
    remainingChildren.push(smallLeaves[0]);
  }

  node.children = remainingChildren;
  node.committees = mergeCommitteeEntries(remainingChildren.flatMap(committeesOf));
}

/**
 * Given a row from the data, sum the given columns.
 */
function sumSourceAmounts(row, sources) {
  let sum = 0;

  for (const col of sources) {
    const value = Number(row[col]);

    if (!Number.isNaN(value)) {
      sum += value;
    }
  }

  return sum;
}

/**
 * Determine a font size for a treemap element based on its cell's width and height.
 */
function treemapElementFontSize(d) {
  const cellWidth = d.x1 - d.x0;
  const cellHeight = d.y1 - d.y0;

  return Math.max(8, Math.min(24, Math.min(cellWidth, cellHeight) / 8));
}

/**
 * A message (such as a warning) that takes the same dimensions as the treemap.
 */
function Message({ children, background = 'lightgrey' }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          font: '9px sans-serif',
          maxWidth: '100%',
          width: `${WIDTH}px`,
          height: 'auto',
          aspectRatio: WIDTH / (HEIGHT + 18.5), // including legend
          background,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          userSelect: 'none',
        }}
      >
        <div>{children}</div>
      </div>
    </div>
  );
}

/**
 * The finance treemap React element, with a legend and dropdowns for election and source.
 */
export function FinanceTreemap() {
  // Columns in source csv file
  const SOURCE_COLUMNS = {
    uc: ['ucberkeley_amount', 'both_amount'],
    city: ['cityofberkeley_amount', 'both_amount'],
    both: ['cityofberkeley_amount', 'ucberkeley_amount', 'both_amount'],
  };

  // States
  const [datasets, setDatasets] = useState(null); // cached CSV rows
  const [error, setError] = useState(null); // error while loading csv

  const [datasetKey, setDatasetKey] = useState('state'); // which csv to use
  const [source, setSource] = useState(SOURCE_COLUMNS.city); // which columns to sum
  const [sourceKey, setSourceKey] = useState('city'); // which columns to sum id: uc | city | both

  const [isScreenTooSmall, setScreenToSmall] = useState(false); // if screen is too small to show

  const wrapperRef = useRef(null); // ref to positioning wrapper (tooltip coordinate space)
  const treemapRef = useRef(null); // ref to treemap div
  const tooltipRef = useRef(null); // ref to hover tooltip div

  // Color scale
  const color = d3.scaleOrdinal(
    ['Democrat', 'Republican', 'Non-Partisan', 'Independent', 'Peace and Freedom', 'Green', 'Party for Socialism and Liberation'], // explicit order
    ['#4B9CCF', '#E2565F', '#8E689B', '#FDD04C', '#F28147', '#96C066', '#3FA6AB'], // matching colors
  );

  // Handle dropdown changes
  const handleSourceChange = (event) => {
    const nextKey = event.target.value;
    setSourceKey(nextKey);
    setSource(SOURCE_COLUMNS[nextKey]);
  };

  const handleElectionChange = (event) => {
    const nextKey = event.target.value;
    setDatasetKey(nextKey);
  };

  // Handle screen size change
  useEffect(() => {
    const handleResize = () => setScreenToSmall(window.innerWidth <= 685);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch CSV files (once)
  useEffect(() => {
    let cancelled = false;

    Promise.all(
      Object.entries(CSV_URLS).map(async ([key, path]) => {
        const origin = typeof window !== 'undefined'
          ? window.location.origin
          : 'https://data.dailycal.org';
        const rows = await d3.csv(`${origin}${path}`);
        return [key, rows];
      }),
    )
      .then((entries) => {
        if (!cancelled) {
          setDatasets(Object.fromEntries(entries));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Generate treemap
  useEffect(() => {
    // Get data
    if (isScreenTooSmall || !datasets || !treemapRef.current) {
      return undefined;
    }

    const rows = datasets[datasetKey];
    if (!rows) {
      return undefined;
    }

    // Stratify a fresh tree each time so filtering doesn't mutate the cache
    const data = d3.stratify().path((d) => d.name)(rows);
    filterChildren(data, source, datasetKey);

    // Compute the layout.
    const root = d3
      .treemap()
      .tile(d3.treemapBinary)
      .size([WIDTH, HEIGHT])
      .padding(1)
      .round(true)(
        d3
          .hierarchy(data)
          // IMPORTANT: The scaling is proportional to the SQUARE ROOT of the value!
          .sum((d) => Math.sqrt(sumSourceAmounts(d.data, source)))
          .sort((a, b) => {
            // Sort largest to smallest, forcing "Other" category to be last
            const aOther = a.data.id?.includes('/Other');
            const bOther = b.data.id?.includes('/Other');

            if (aOther && !bOther) return 1;
            if (!aOther && bOther) return -1;

            return b.value - a.value;
          }),
      );

    // Clear any existing SVG
    const container = d3.select(treemapRef.current);
    container.selectAll('*').remove();

    // Create the SVG container.
    const svg = container
      .append('svg')
      .attr('viewBox', [0, 0, WIDTH, HEIGHT])
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .attr('style', 'max-width: 100%; height: auto; font: 9px sans-serif;');

    // Add a cell for each leaf of the hierarchy.
    const leaf = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // Open the candidate in Google
        const name = d.data.id.split('/').at(-1);
        if (!name.startsWith('Other (')) {
          window.open(`https://google.com/search?q=${d.data.id.split('/').at(-1)}`);
        }
      });

    // Attach the hover tooltip.
    const format = d3.format(',d');
    attachTreemapTooltip(leaf, {
      tooltip: tooltipRef.current,
      container: wrapperRef.current,
      name: (d) => d.data.id.split('/').at(-1),
      amount: (d) => `$${format(sumSourceAmounts(d.data.data, source))}`,
      committees: (d) => displayCommitteesOf(d.data),
    });

    // Append a color rectangle.
    leaf
      .append('rect')
      .attr('id', (d) => {
        d.leafUid = uid('leaf');
        return d.leafUid.id;
      })
      .attr('fill', (d) => color(d.data.id.split('/').at(2)))
      .attr('fill-opacity', 0.6)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0);

    // Append a clipPath to ensure text does not overflow.
    leaf
      .append('clipPath')
      .attr('id', (d) => {
        d.clipUid = uid('clip');
        return d.clipUid.id;
      })
      .append('use')
      .attr('href', (d) => d.leafUid.href);

    // Append text label with name and dollar amount
    leaf
      .append('text')
      .attr('clip-path', (d) => d.clipUid)
      .attr('text-anchor', 'middle')
      .each(function drawLabel(d) {
        const cellWidth = d.x1 - d.x0;
        const cellHeight = d.y1 - d.y0;

        const text = d3.select(this);
        const size = treemapElementFontSize(d);
        const maxWidth = cellWidth - 8;

        const name = d.data.id.split('/').at(-1);
        const amount = `$${format(sumSourceAmounts(d.data.data, source))}`;

        // Split name into words
        const words = name.split(/(?=[A-Z][a-z])|\s+/g);
        const avgCharWidth = size * 0.6; // approximate width of a character

        // Wrap text
        const lines = [];
        let current = '';

        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          const fits = test.length * avgCharWidth <= maxWidth;

          if (fits) {
            current = test;
          } else {
            if (current) lines.push(current);
            current = word;
          }
        }

        if (current) lines.push(current);

        // Center text
        const lineHeight = size * 1.1;
        const amountHeight = size * 0.8;
        const totalHeight = lines.length * lineHeight + amountHeight;
        const startY = cellHeight / 2 - totalHeight / 2;

        // Candidate name lines
        lines.forEach((line, i) => {
          text
            .append('tspan')
            .attr('x', cellWidth / 2)
            .attr('y', startY + i * lineHeight)
            .attr('dy', '0.35em')
            .attr('font-weight', 600)
            .attr('font-size', `${size}px`)
            .text(line);
        });

        // Dollar amount line
        text
          .append('tspan')
          .attr('x', cellWidth / 2)
          .attr('y', startY + lines.length * lineHeight)
          .attr('dy', '0.35em')
          .attr('font-weight', 'normal')
          .attr('font-size', `${size * 0.8}px`)
          .attr('fill-opacity', 0.7)
          .text(amount);
      });

    // Teardown
    return () => {
      hideTreemapTooltip(tooltipRef.current);
      container.selectAll('*').remove();
    };
  }, [datasets, datasetKey, source, isScreenTooSmall]);

  // Error handler
  if (error) {
    return (
      <Message background="salmon">
        Failed to load finance datasets:
        <br />
        <code>{error.message || String(error)}</code>
      </Message>
    );
  }

  // Screen too small
  if (isScreenTooSmall) {
    return <Message>This visualization is better viewed on larger screens.</Message>;
  }

  // Loading indicator
  if (!datasets) {
    return <Message>Loading Data...</Message>;
  }

  // Build layout
  return (
    <>
      {/* Party Swatches and Dropdowns: two columns that never wrap onto each other */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '12px 16px',
          font: '12px sans-serif',
          justifyContent: 'center',
          margin: '10px 0',
        }}
      >
        {/* Party Swatches: wrap among themselves, never mixing with the dropdowns */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px 16px',
            flex: '0 1 auto',
            minWidth: 0,
          }}
        >
          {color.domain().map((party) => (
            <div key={party} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  background: color(party),
                  opacity: 0.6,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {party}
            </div>
          ))}
        </div>

        {/* Dropdowns: wrap among themselves on the other side of the divider */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px 16px',
            flex: '0 1 auto',
            minWidth: 0,
            borderLeft: '1px solid #bbb',
            paddingLeft: '16px',
          }}
        >
          {/* Source Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label htmlFor="treemap-source">Source:&nbsp;</label>
            <select
              id="treemap-source"
              name="treemap-source"
              value={sourceKey}
              onChange={handleSourceChange}
            >
              <option value="uc">UC Berkeley Employees Only</option>
              <option value="city">City of Berkeley Residents Only</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Election Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label htmlFor="treemap-election">Election:&nbsp;</label>
            <select
              id="treemap-election"
              name="treemap-election"
              value={datasetKey}
              onChange={handleElectionChange}
            >
              <option value="state">State</option>
              <option value="federal">Federal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Treemap (wrapper positions the tooltip, which d3 must not clear with the SVG) */}
      <div ref={wrapperRef} style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
        <div
          ref={treemapRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            userSelect: 'none',
          }}
        />
        <TreemapTooltip innerRef={tooltipRef} />
      </div>
    </>
  );
}
