import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/** URLs of the csv files */
const CSV_URLS = {
  state: '/candidate-finance/state_finance_treemap_v2.csv',
  federal: '/candidate-finance/federal_finance_treemap_v2.csv',
};

/** Observable's DOM.uid replacement for clipPath / rect ids */
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

/**
 * Filter out nodes smaller than "min".
 */
function filterSmallChildren(node, sources, min = 1000) {
  if (!node.children) {
    return;
  }

  let otherSum = 0;
  let otherCount = 0;
  const remainingChildren = [];

  for (const child of node.children) {
    if (!child.children) {
      // Leaf node — stratify nodes keep the CSV row on `.data`
      const amount = sumSourceAmounts(child.data, sources);

      if (amount < min && amount > 0) {
        // Too small, add to "Other"
        otherSum += amount;
        otherCount += 1;
      } else {
        // Large enough, keep
        remainingChildren.push(child);
      }
    } else {
      // Internal node, process children
      filterSmallChildren(child, sources, min);
      remainingChildren.push(child);
    }
  }

  // Add an "Other" node if necessary
  if (otherCount > 1) {
    const otherData = {};
    if (sources.length) {
      otherData[sources[0]] = otherSum;
      sources.slice(1).forEach((col) => {
        otherData[col] = 0;
      });
    }

    remainingChildren.push({
      id: `${node.id}/OTHER (${otherCount})`,
      parentId: node.id,
      data: otherData,
    });

    node.children = remainingChildren;
  }
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
 * The finanace treemap React element, with a legend and dropdowns for election and source.
 */
export function FinanceTreemap() {
  // Constants
  const width = 1200;
  const height = 600;

  const SOURCE_COLUMNS = {
    uc: ['ucberkeley_amount', 'both_amount'],
    city: ['cityofberkeley_amount', 'both_amount'],
    both: ['cityofberkeley_amount', 'ucberkeley_amount', 'both_amount'],
  };

  // States
  const [datasets, setDatasets] = useState(null); // cached CSV rows
  const [error, setError] = useState(null); // error while loading csv

  const [datasetKey, setDatasetKey] = useState('state'); // which csv to use
  const [source, setSource] = useState(SOURCE_COLUMNS['city']); // which columns to sum
  const [sourceKey, setSourceKey] = useState('city'); // which columns to sum id: uc | city | both

  const treemapRef = useRef(null); // ref to treemap div

  // Color scale
  const color = d3.scaleOrdinal(
    ['Democrat', 'Republican', 'Green', 'Peace and Freedom', 'Non-Partisan'], // explicit order
    ['#4B9CCF', '#E2565F', '#96C066', '#F28147', '#8E689B'], // matching colors
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
    if (!datasets || !treemapRef.current) {
      return undefined;
    }

    const rows = datasets[datasetKey];
    if (!rows) {
      return undefined;
    }

    // Stratify a fresh tree each time so filtering doesn't mutate the cache
    const data = d3.stratify().path((d) => d.name)(rows);
    filterSmallChildren(data, source);

    // Compute the layout.
    const root = d3
      .treemap()
      .tile(d3.treemapBinary)
      .size([width, height])
      .padding(1)
      .round(true)(
        d3
          .hierarchy(data)
          // IMPORTANT: The scaling is proportional to the SQUARE ROOT of the value!
          .sum((d) => Math.sqrt(sumSourceAmounts(d.data, source)))
          .sort((a, b) => {
            // Sort largest to smallest, forcing "Other" category to be last
            const aOther = a.data.id?.includes('/OTHER');
            const bOther = b.data.id?.includes('/OTHER');

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
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'max-width: 100%; height: auto; font: 9px sans-serif;');

    // Add a cell for each leaf of the hierarchy, with a click action.
    const leaf = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // eslint-disable-next-line no-console
        console.log(d.data.id.split('/').at(-1));
        // TODO popup
      });

    // Append a tooltip.
    const format = d3.format(',d');
    leaf
      .append('title')
      .text(
        (d) => `${d.data.id.split('/').at(-1)}\n$${format(sumSourceAmounts(d.data.data, source))}`,
      );

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
      container.selectAll('*').remove();
    };
  }, [datasets, datasetKey, source, width, height]);

  // Error handler
  if (error) {
    return <div>Failed to load finance data.</div>;
  }

  // Loading indicator
  if (!datasets) {
    return <div>loading</div>;
  }

  // Build layout
  return (
    <>
      {/* Party Swatches and Dropdowns */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 16px',
          font: '12px sans-serif',
          justifyContent: 'center',
          margin: '10px 0',
        }}
      >
        {/* Party Swatches */}
        {color.domain().map((party) => (
          <div key={party} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 14,
                height: 14,
                background: color(party),
                opacity: 0.6,
                display: 'inline-block',
              }}
            />
            {party}
          </div>
        ))}

        {/* Source Dropdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderLeft: '1px solid #bbb',
            paddingLeft: '16px',
          }}
        >
          <label htmlFor="treemap-source">Source:&nbsp;</label>
          <select
            id="treemap-source"
            name="treemap-source"
            value={sourceKey}
            onChange={handleSourceChange}
          >
            <option value="uc">UC Berkeley</option>
            <option value="city">City of Berkeley</option>
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

      {/* Treemap */}
      <div
        ref={treemapRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      />
    </>
  );
}
