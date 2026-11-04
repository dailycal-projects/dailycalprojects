import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import asucData from './data';
import cursorIcon from './cursor.png';
import './styles.css';

const ASUCFunding = ({ data = asucData }) => {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const [rScale, setRScale] = useState(null);

  useEffect(() => {
    if (!data || !data.length) return;

    const width = 720;
    const height = 650;
    const centerX = width / 2;
    const centerY = height / 2;
    const centerCircleRadius = 100;
    let rotationSpeed = 0.002;
    const minDistanceFromCenter = centerCircleRadius + 70;
    let currentRotation = 0;

    const ringLabels = ['40+ years', '30+ years', '20+ years', '10+ years', '0+ years'];
    const ringSpacing = 30;

    const colorScheme = {
      Academic: { fill: '#e3565f', stroke: '#ab4b4f' },
      'Art and performance': { fill: '#f3803f', stroke: '#b5663b' },
      'Business and tech': { fill: '#fed23b', stroke: '#b89a40' },
      'Community and culture': { fill: '#95c361', stroke: '#749254' },
      Hobby: { fill: '#25b288', stroke: '#348a6d' },
      'Medical and service': { fill: '#489bd1', stroke: '#487a9b' },
      'Professional frat': { fill: '#176893', stroke: '#215675' },
      'Public speaking and debate': { fill: '#61699a', stroke: '#525777' },
      Publication: { fill: '#8f679c', stroke: '#72577a' },
      'Sports, spirit and rotc': { fill: '#ba5f7e', stroke: '#8f5166' },
    };

    // Clear any existing SVG
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('max-width', '100%')
      .style('height', 'auto')
      .style('background', 'transparent');

    const rotatingGroup = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    const ringsGroup = rotatingGroup.append('g').attr('class', 'rings-layer');
    const clubsGroup = rotatingGroup.append('g').attr('class', 'clubs-layer');
    const centerGroup = svg.append('g').attr('class', 'center-layer');

    const tooltip = d3.select(tooltipRef.current);

    function parseFunding(fundingStr) {
      if (typeof fundingStr === 'number') return fundingStr;
      return parseFloat(String(fundingStr).replace(/,/g, ''));
    }

    function getCategoryColors(category) {
      return colorScheme[category] || { fill: '#D3D3D3', stroke: '#A9A9A9' };
    }

    const validData = data.filter((d) => d.name && d.category && d.funding != null && d.years_of_sponsorship != null)
      .map((d) => ({
        ...d,
        funding: parseFunding(d.funding),
        years_of_sponsorship: +d.years_of_sponsorship,
      }))
      .filter((d) => !isNaN(d.funding) && !isNaN(d.years_of_sponsorship) && d.funding > 0);

    const categories = Array.from(new Set(validData.map((d) => d.category)));
    // const categories = Array.from(new Set(validData.map((d) => d.category))).sort();

    const maxFunding = d3.max(validData, (d) => d.funding);
    const minFunding = d3.min(validData, (d) => d.funding);

    const radiusScale = d3.scaleSqrt()
      .domain([minFunding, maxFunding])
      .range([4, 45]);

    // Store the scale function in state
    setRScale(() => radiusScale);

    // Draw rings with light stroke
    for (let i = 0; i < 5; i++) {
      const distance = minDistanceFromCenter + i * ringSpacing;
      ringsGroup.append('circle')
        .attr('class', 'global-ring')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', distance)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);

      centerGroup.append('text')
        .attr('class', 'ring-label outline')
        .attr('x', centerX)
        .attr('y', centerY + distance + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('fill', 'white')
        .attr('stroke', 'white')
        .attr('stroke-width', 4) // thickness of the outline
        .attr('stroke-linejoin', 'round')
        .text(ringLabels[i]);

      // Black foreground text
      centerGroup.append('text')
        .attr('class', 'ring-label')
        .attr('x', centerX)
        .attr('y', centerY + distance + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('fill', '#000000')
        .text(ringLabels[i]);
    }

    function getRingIndex(years) {
      if (years >= 40) return 0;
      if (years >= 30) return 1;
      if (years >= 20) return 2;
      if (years >= 10) return 3;
      return 4;
    }

    const categoryAngles = {};
    categories.forEach((cat, i) => {
      categoryAngles[cat] = (i / categories.length) * 2 * Math.PI;
    });

    const nodes = validData.map((d, i) => {
      const ringIndex = getRingIndex(d.years_of_sponsorship);
      const targetRadius = minDistanceFromCenter + ringIndex * ringSpacing;
      const angle = categoryAngles[d.category] + (Math.random() - 0.5) * 0.3;
      return {
        ...d,
        x: Math.cos(angle) * targetRadius,
        y: Math.sin(angle) * targetRadius,
        radius: radiusScale(d.funding),
        targetRadius,
        ringIndex,
        id: i,
      };
    });

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-5).distanceMax(200))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 2).strength(0.9).iterations(3))
      .force('radial', forceRadial())
      .velocityDecay(0.5)
      .alphaDecay(0.01)
      .on('tick', ticked);

    function forceRadial() {
      const strength = 0.4;
      return function (alpha) {
        nodes.forEach((node) => {
          const dx = node.x;
          const dy = node.y;
          const currentRadius = Math.sqrt(dx * dx + dy * dy);
          if (currentRadius > 0) {
            const k = (node.targetRadius - currentRadius) / currentRadius * strength * alpha;
            node.vx += dx * k;
            node.vy += dy * k;
          }
        });
      };
    }

    const circles = clubsGroup.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'club-circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => getCategoryColors(d.category).fill)
      .attr('stroke', (d) => getCategoryColors(d.category).stroke)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85)
      .on('mouseover', (event, d) => {
        rotationSpeed = 0;
        tooltip.style('opacity', 1)
          .html(`
            <strong>${d.name}</strong><br>
            Category: ${d.category}<br>
            Funding: $${d.funding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>
            Years Sponsored: ${d.years_of_sponsorship}<br>
            ASUC Category: ${d.asuc_category || 'N/A'}
          `);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 15}px`);
      })
      .on('mouseout', () => {
        rotationSpeed = 0.002;
        tooltip.style('opacity', 0);
      });

    const labeledClubs = ['Queer Alliance & Resource Center', 'Community Projects', 'UC Rally Committee'];

    function ticked() {
      circles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    }

    function rotate() {
      currentRotation += rotationSpeed;
      rotatingGroup.attr('transform', `translate(${centerX}, ${centerY}) rotate(${currentRotation * 180 / Math.PI})`);
      requestAnimationFrame(rotate);
    }

    rotate();

    centerGroup.append('text')
      .attr('class', 'center-text center-title')
      .attr('x', centerX)
      .attr('y', centerY - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('ASUC provides');

    centerGroup.append('text')
      .attr('class', 'center-text center-subtitle')
      .attr('x', centerX)
      .attr('y', centerY + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('$1.2 million to RSOs');
  }, [data]);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      margin: 0,
      padding: 0,
      background: 'transparent',
    }}
    >
      <div className="container">
        {/* <img alt="" loading="lazy" width="16" height="22.9" decoding="async" data-nimg="1" src="cursor.png" />
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
          Hover over circles to see details
        </p> */}

        <div style={{
          display: 'flex',
          // alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        >
          <img
            alt=""
            width="16"
            height="22.9"
            src={cursorIcon}
          />

          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '14px',
            textAlign: 'center',
          }}
          >
            Hover over circles to see details
          </p>
        </div>

        <div style={{
          display: 'flex', gap: 30, alignItems: 'flex-start', justifyContent: 'center',
        }}
        >
          <div style={{ flex: 1, minWidth: 0, maxWidth: '800px' }}>
            <div ref={chartRef} id="chart" style={{ background: 'transparent' }} />
          </div>
        </div>

        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            position: 'absolute',
            padding: 12,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #333',
            color: 'black',
            borderRadius: 6,
            pointerEvents: 'none',
            fontSize: 13,
            lineHeight: 1.5,
            opacity: 0,
            transition: 'opacity 0.2s',
            zIndex: 1000,
            maxWidth: 250,
          }}
        />
      </div>

      <div style={{
        marginTop: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px',
      }}
      >

        <div className="legend-container">
          <div className="legend-item">
            <div className="circle academic" />
            <span className="label">Academic</span>
          </div>

          <div className="legend-item">
            <div className="circle medical" />
            <span className="label">Medical and service</span>
          </div>

          <div className="legend-item">
            <div className="circle art" />
            <span className="label">Art and performance</span>
          </div>

          <div className="legend-item">
            <div className="circle frat" />
            <span className="label">Professional frat</span>
          </div>

          <div className="legend-item">
            <div className="circle business" />
            <span className="label">Business and tech</span>
          </div>

          <div className="legend-item">
            <div className="circle speaking" />
            <span className="label">Public speaking and debate</span>
          </div>

          <div className="legend-item">
            <div className="circle community" />
            <span className="label">Community and culture</span>
          </div>

          <div className="legend-item">
            <div className="circle publication" />
            <span className="label">Publication</span>
          </div>

          <div className="legend-item">
            <div className="circle hobby" />
            <span className="label">Hobby</span>
          </div>

          <div className="legend-item">
            <div className="circle sports" />
            <span className="label">Sports, spirit and ROTC</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            fontSize: '14px', fontWeight: '600', marginBottom: '0px', color: '#333',
          }}
          >
            Funding Amount
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}
            >
              <div style={{
                width: rScale ? `${rScale(1000) * 2}px` : '8px',
                height: rScale ? `${rScale(1000) * 2}px` : '8px',
                borderRadius: '50%',
                border: '1px solid #666',
                background: 'transparent',
              }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>$1,000</span>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}
            >
              <div style={{
                width: rScale ? `${rScale(50000) * 2}px` : '24px',
                height: rScale ? `${rScale(50000) * 2}px` : '24px',
                borderRadius: '50%',
                border: '1px solid #666',
                background: 'transparent',
              }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>$50,000</span>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}
            >
              <div style={{
                width: rScale ? `${rScale(150000) * 2}px` : '48px',
                height: rScale ? `${rScale(150000) * 2}px` : '48px',
                borderRadius: '50%',
                border: '1px solid #666',
                background: 'transparent',
              }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>$150,000</span>
            </div>
          </div>
        </div>
      </div>
      <p style={{
        margin: 0,
        color: '#666',
        fontSize: '12px',
        paddingTop: '15px',
      }}
      >
        Rings represent years of continuous ASUC sponsorship.
      </p>
      <p style={{
        margin: 0,
        color: '#000000ff',
        fontSize: '12px',
        paddingTop: '1px',
        textAlign: 'left',

      }}
      >
        Smrithi Senthilnathan/The Daily Californian
      </p>
    </div>
  );
};

export default ASUCFunding;
