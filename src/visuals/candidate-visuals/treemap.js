import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import { TreemapTooltip, attachTreemapTooltip, hideTreemapTooltip } from './treemap_tooltip';
import { POINTS_CSV_URLS, indexPointsByHash, pointsForHashes } from './timescales';

// URLs of the csv files
const CSV_URLS = {
  state: '/candidate/state_finance_treemap_v5.csv',
  federal: '/candidate/federal_finance_treemap_v5.csv',
};

// Columns in source csv file
const SOURCE_COLUMNS = {
  uc: ['ucberkeley_amount', 'both_amount'],
  city: ['cityofberkeley_amount', 'both_amount'],
  both: ['cityofberkeley_amount', 'ucberkeley_amount', 'both_amount'],
};

// The category the smallest parties are shown under
const OTHER_PARTY = 'Other Parties';

// Defaults, also used when a url param is missing or unrecognized
const DEFAULT_SOURCE_KEY = 'city';
const DEFAULT_DATASET_KEY = 'state';

// Query params that keep the dropdown choices in the url, so a view can be shared as a link
const SOURCE_PARAM = 'treemaps-source';
const ELECTION_PARAM = 'treemap-election';

/**
 * Read one dropdown choice out of the url, falling back when it is missing or not a real option.
 */
function readParam(name, options, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = new URLSearchParams(window.location.search).get(name);
  return options.includes(value) ? value : fallback;
}

/**
 * Put the current dropdown choices in the url without navigating or adding history entries.
 */
function writeParams(sourceKey, datasetKey) {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  params.set(SOURCE_PARAM, sourceKey);
  params.set(ELECTION_PARAM, datasetKey);

  const { pathname, hash } = window.location;
  window.history.replaceState(null, '', `${pathname}?${params.toString()}${hash}`);
}

// Breathing room kept on both sides of the treemap at every screen width
const SIDE_PADDING = 16;

// Treemap dimensions (shared with Datawrapper charts)
// For flats, the dimensions are 1800 x (1160/2)
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
 * The party a node belongs to: the second segment of its path, e.g. "/finance/Democrat/Name".
 */
function partyOf(node) {
  return (node.id && node.id.split('/').at(2)) || '';
}

/**
 * The parties that are shown together as one "Other" category, and the label they share.
 */
const MERGED_PARTIES = ['Peace and Freedom', 'Green', 'Party for Socialism and Liberation'];

/**
 * Combine small parties into a single "Other Party" group.
 */
function mergeSmallParties(rows) {
  const seen = new Set();

  return rows.reduce((kept, row) => {
    const segments = String(row.name).split('/');
    const party = segments[1] || '';

    if (MERGED_PARTIES.includes(party)) {
      segments[1] = OTHER_PARTY;
    }

    const name = segments.join('/');

    // Keep only the first of the renamed party rows; candidate rows below them all stay
    if (segments.length < 3) {
      if (seen.has(name)) {
        return kept;
      }

      seen.add(name);
    }

    kept.push({ ...row, name, party });
    return kept;
  }, []);
}

/**
 * The original party name for the tooltip (so candidates in "Other" party don't say party is "Other")
 */
function originalPartyOf(node) {
  return (node.data && node.data.party) || partyOf(node);
}

/**
 * True for the tiles that bundle the smallest candidates together, e.g. "Other (34)".
 */
function isOtherTile(node) {
  return Boolean(node.id) && node.id.split('/').at(-1).startsWith('Other (');
}

/**
 * The candidate hash of a node, used to look up its contributions in the points csv.
 */
function hashesOf(node) {
  const hash = node.data && node.data.hash;
  return hash ? [hash] : [];
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
  // States
  const [datasets, setDatasets] = useState(null); // cached CSV rows
  const [points, setPoints] = useState(null); // individual contributions, grouped by candidate hash
  const [error, setError] = useState(null); // error while loading csv

  // These start at the defaults and are replaced by the url params on mount, so that the server
  // rendered markup and the first client render agree
  const [datasetKey, setDatasetKey] = useState(DEFAULT_DATASET_KEY); // which csv to use
  const [source, setSource] = useState(SOURCE_COLUMNS[DEFAULT_SOURCE_KEY]); // which columns to sum
  const [sourceKey, setSourceKey] = useState(DEFAULT_SOURCE_KEY); // uc | city | both

  // Below this width the treemap is drawn at full size inside a scroll box the reader can pan
  const [isNarrowScreen, setNarrowScreen] = useState(false);

  // The nudge telling a phone reader the map can be panned, until they pan it
  const [showDragHint, setShowDragHint] = useState(true);

  const wrapperRef = useRef(null); // ref to positioning wrapper (tooltip coordinate space)
  const treemapRef = useRef(null); // ref to treemap div
  const tooltipRef = useRef(null); // ref to hover tooltip div
  const pointTooltipRef = useRef(null); // ref to the single contribution tooltip

  // Color scale
  const color = d3.scaleOrdinal(
    ['Democrat', 'Republican', 'Non-Partisan', 'Independent', OTHER_PARTY], // explicit order
    ['#4B9CCF', '#E2565F', '#8E689B', '#FDD04C', '#96C066'], // matching colors
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

  // Apply the dropdown choices from a shared link (once, on mount)
  useEffect(() => {
    const nextSourceKey = readParam(SOURCE_PARAM, Object.keys(SOURCE_COLUMNS), DEFAULT_SOURCE_KEY);
    const nextDatasetKey = readParam(ELECTION_PARAM, Object.keys(CSV_URLS), DEFAULT_DATASET_KEY);

    setSourceKey(nextSourceKey);
    setSource(SOURCE_COLUMNS[nextSourceKey]);
    setDatasetKey(nextDatasetKey);
  }, []);

  // Keep the url in step with the dropdowns
  useEffect(() => {
    writeParams(sourceKey, datasetKey);
  }, [sourceKey, datasetKey]);

  // Handle screen size change
  useEffect(() => {
    const handleResize = () => setNarrowScreen(window.innerWidth <= 685);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide hint once map moves
  useEffect(() => {
    const pane = treemapRef.current;

    if (!isNarrowScreen || !pane || !showDragHint) {
      return undefined;
    }

    const dismiss = () => setShowDragHint(false);

    pane.addEventListener('scroll', dismiss, { passive: true });
    pane.addEventListener('touchmove', dismiss, { passive: true });

    return () => {
      pane.removeEventListener('scroll', dismiss);
      pane.removeEventListener('touchmove', dismiss);
    };
  }, [isNarrowScreen, showDragHint, datasets]);

  // Fetch CSV files (once)
  useEffect(() => {
    let cancelled = false;

    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://data.dailycal.org';

    const load = (urls) => Promise.all(
      Object.entries(urls).map(async ([key, path]) => {
        const rows = await d3.csv(`${origin}${path}`);
        return [key, rows];
      }),
    ).then(Object.fromEntries);

    Promise.all([load(CSV_URLS), load(POINTS_CSV_URLS)])
      .then(([treemapRows, pointRows]) => {
        if (!cancelled) {
          setDatasets(treemapRows);
          setPoints(
            Object.fromEntries(
              Object.entries(pointRows).map(([key, rows]) => [key, indexPointsByHash(rows)]),
            ),
          );
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
    if (!datasets || !treemapRef.current) {
      return undefined;
    }

    const rows = datasets[datasetKey];
    if (!rows) {
      return undefined;
    }

    // Stratify a fresh tree each time so filtering doesn't mutate the cache
    const data = d3.stratify().path((d) => d.name)(mergeSmallParties(rows));
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
            // Sort largest to smallest, forcing "Other" tiles to be last
            const aOther = isOtherTile(a.data);
            const bOther = isOtherTile(b.data);

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
      .attr('style', isNarrowScreen
        ? `display: block; width: ${WIDTH}px; height: ${HEIGHT}px; font: 9px sans-serif;`
        : 'max-width: 100%; height: auto; font: 9px sans-serif;');

    // Add a cell for each leaf of the hierarchy.
    const leaf = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer');

    // Attach the hover tooltip, which also handles clicking a cell to lock it in place.
    const format = d3.format(',d');
    const pointIndex = points && points[datasetKey];
    const detachTooltip = attachTreemapTooltip(leaf, {
      tooltip: tooltipRef.current,
      pointTooltip: pointTooltipRef.current,
      container: wrapperRef.current,
      // Candidates are named with their party; an "Other" tile already says what it is
      name: (d) => {
        const label = d.data.id.split('/').at(-1);
        return isOtherTile(d.data) ? label : `${label} (${originalPartyOf(d.data)})`;
      },
      amount: (d) => `$${format(sumSourceAmounts(d.data.data, source))}`,
      // An "Other" tile is many candidates at once, so it gets no contributions chart
      points: (d) => (
        isOtherTile(d.data) ? [] : pointsForHashes(pointIndex, hashesOf(d.data), source)
      ),
      color: (d) => color(partyOf(d.data)),
      committees: (d) => displayCommitteesOf(d.data),
    });

    // Append a color rectangle.
    leaf
      .append('rect')
      .attr('id', (d) => {
        d.leafUid = uid('leaf');
        return d.leafUid.id;
      })
      .attr('fill', (d) => color(partyOf(d.data)))
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
      detachTooltip();
      hideTreemapTooltip(pointTooltipRef.current);
      container.selectAll('*').remove();
    };
  }, [datasets, points, datasetKey, source, isNarrowScreen]);

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

  // Loading indicator
  if (!datasets) {
    return <Message>Loading Data...</Message>;
  }

  // Build layout
  return (
    <>
      {/* Party Swatches and Dropdowns */}
      <div
        style={{
          display: 'flex',
          flexWrap: isNarrowScreen ? 'wrap' : 'nowrap',
          gap: '12px 16px',
          font: '12px sans-serif',
          justifyContent: 'center',
          margin: '10px 0',
        }}
      >
        {/* Party Swatches */}
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

        {/* Dropdowns */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px 16px',
            flex: '0 1 auto',
            minWidth: 0,
            borderLeft: isNarrowScreen ? 'none' : '1px solid #bbb',
            paddingLeft: isNarrowScreen ? 0 : '16px',
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
      <div
        ref={wrapperRef}
        style={{
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          padding: `0 ${SIDE_PADDING}px`,
          marginBottom: '20px',
        }}
      >
        <div style={{ position: 'relative' }}>
          <div
            ref={treemapRef}
            style={{
              display: isNarrowScreen ? 'block' : 'flex',
              justifyContent: 'center',
              width: '100%',
              userSelect: 'none',
              // Pan the full-size treemap in both directions instead of shrinking it away
              overflow: isNarrowScreen ? 'auto' : 'visible',
              maxHeight: isNarrowScreen ? '70vh' : 'none',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}
          />

          {/* Nothing on the phone says the map is bigger than the window, so say it */}
          {isNarrowScreen && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.45)',
                color: 'white',
                fontFamily: 'sans-serif',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '0 20px',
                // Never in the way of the drag it is asking for
                pointerEvents: 'none',
                opacity: showDragHint ? 1 : 0,
                transition: 'opacity 0.4s',
              }}
            >
              Drag to explore the map
            </div>
          )}
        </div>
        <TreemapTooltip innerRef={tooltipRef} />
        <TreemapTooltip innerRef={pointTooltipRef} zIndex={20} />

        {/* Credit line */}
        <div
          style={{
            width: '100%',
            maxWidth: `${WIDTH}px`,
            margin: '5px auto 0',
            fontFamily: 'sans-serif',
            fontSize: '11px',
            color: '#888',
          }}
        >
          <span>Source: Brendan Raykoff/The Daily Californian</span>
          <span style={{ margin: '0 0.249em' }}>•</span>
          <span>Note: Each cell's area is proportional to the square root of the amount contributed. Candidates making up the smallest shares of contributions are grouped as "Other".</span>
        </div>
      </div>
    </>
  );
}
