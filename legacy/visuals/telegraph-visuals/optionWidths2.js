import React, {
  useState, useRef, useEffect,
} from 'react';
import * as d3 from 'd3';
import optionWidthsData2 from './optionWidthsData2';
import './optionWidths.css';

const isMobile = (typeof window !== 'undefined') ? window.innerWidth < 500 : false;
const config = isMobile
  ? {
    // w: 1000,
    w: window.innerWidth,
    // h: 600,
    h: window.innerWidth,
    // paddingLeft: 100,
    paddingLeft: window.innerWidth * 0.1,
    // paddingRight: 300,
    paddingRight: 75,
    // paddingRight: window.innerWidth * 0.35,
    // paddingTop: 100
    paddingTop: window.innerWidth * 0.075,
    paddingBot: window.innerWidth * 0.4,
    fontSize: 12,
    fontSize2: 10,
    legend_radius: 3,
  } : {
    w: 1000,
    h: 600,
    paddingLeft: 100,
    paddingRight: 300,
    paddingTop: 100,
    paddingBot: 150,
    fontSize: 16,
    fontSize2: 16,
    legend_radius: 6,
  };

const xScale = d3.scaleLinear()
  .domain([0, 60])
  .range([0, config.w - config.paddingRight]);

const yScale = d3.scaleBand()
  .domain(['4d', '4c', '4b', '4a'])
  .range([config.h - config.paddingBot, config.paddingTop])
  .paddingInner(0.15)
  .paddingOuter(0.1);

const splitSectionName = (section) => {
  const split = section.split(/(?=[A-Z])/);
  if (split.length > 1) {
    split[1] = split[1].toLowerCase();
  }
  return split.join(' ').replace(/[0-9]/g, '');
};

const toggleData = (checked) => {
  const originalData = [...optionWidthsData2];
  let dataCopy;
  // if checked return combined + sorted data
  if (checked) {
    dataCopy = originalData.map((o) => {
      const functionO = o;
      // combine sidewalks
      functionO.Sidewalk1 += functionO.Sidewalk2;
      functionO.Sidewalk2 = 0;
      // combine curb extensions
      functionO.CurbExtension1 += functionO.CurbExtension2;
      functionO.CurbExtension2 = 0;
      // sort by values???
      return functionO;
    });
  } else {
    dataCopy = [...originalData.map((o) => {
      // split sidewalks
      const functionOElse = o;
      if (['4d', '4c', '4b', '4a'].includes(o.Option)) {
        functionOElse.Sidewalk1 = 19;
        functionOElse.Sidewalk2 = 19;
      }
      return functionOElse;
    })];
  }
  const keys = Object.keys(optionWidthsData2[0]).slice(1, 9);
  const spreadData = dataCopy.map((d) => {
    const singleObject = keys.map((k) => {
      const object = {};
      object.Option = d.Option;
      object.Section = k;
      object.Width = d[k];
      return object;
    });
    return singleObject;
  }).flat();
  return spreadData;
  // return dataCopy;
};

// road section dict for tooltip and description
const roadSections = {
  Sidewalk: '<b>Sidewalk</b>: This is where pedestrians travel.',
  'Curb extension': '<b>Curb extension</b>: These are extensions of sidewalks into the street. These have many benefits for safety, such as increasing visibility and calming traffic',
  'Bike lane': '<b>Bike lane</b>: A lane designated for bikes only. These currently exist on Bancroft',
  'Shared lane': '<b>Shared lane</b>: A lane accessible by cars, buses, and bikes. In some cities, these represent recommended cycling lanes, or lanes that should preferrably be bikes-only.',
  'Bus lane': '<b>Bus lane</b>: A lane designated for buses only.',
  'Parking bay': '<b>Parking bay</b>: A space large enough to park a vehicle.',
};

const OptionWidthViz2 = () => {
  // add checkbox to change viewing modes and track view checkbox is using State
  const [checked2, setChecked2] = useState(false);
  const ToggleCheckbox = ({ checked2 }) => (
    <span className="toggle-checkbox">
      <label htmlFor="combine-widths-cb2">Combine Widths</label>
      <input type="checkbox" id="combine-widths-cb2" value="Sort Widths" checked={checked2} onChange={() => { setChecked2(!checked2); }} />
    </span>
  );

  // update data so each section of each option is seperate object, like {Option: 1, Section: Sidwalk, Width: 12}
  const data = optionWidthsData2;
  const keys = Object.keys(data[0]).slice(1, 9);
  const spreadData = data.map((d) => {
    const singleObject = keys.map((k) => {
      const object = {};
      object.Option = d.Option;
      object.Section = k;
      object.Width = d[k];
      return object;
    });
    return singleObject;
  }).flat();

  // set inital data using useState
  const [widthData, setWidthData] = useState(spreadData);

  // color scale for viz
  // sidewalk - yellow, curb extension - orange, bike lane - green, shared - purple, bus - blue, parking bay - red
  // const scheme = d3.schemePastel1.slice(0, 8)
  // const customScheme = [5, 4, 2, 3, 1, 0, 4, 5].map(i => scheme[i]);
  const scheme = ['#FFECB3', '#FBC9A6', '#D2E2BB', '#C8B9D2', '#B5CEEA', '#F3B9B1'];
  const customScheme = [0, 1, 2, 3, 4, 5, 1, 0].map((i) => scheme[i]);
  // console.log('custoclor', customScheme);
  const colorScale = d3.scaleOrdinal(customScheme)
    .domain(keys);

  // usRef for svg
  const svgRef = useRef(null); // reference

  // initialize svg on page load, and change when data changes
  useEffect(() => {
    // console.log('useffectcalled');

    const svg = d3.select(svgRef.current)
      .attr('width', config.w)
      .attr('height', config.h)
      .attr('class', 'options-bars-svg');

    // add axes
    const xAxis = d3.axisBottom().scale(xScale);
    svg.append('g').attr('class', 'x-axis');
    svg.select('g.x-axis')
      .attr('transform', `translate(${config.paddingLeft},${config.h - config.paddingBot})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale).tickPadding([10]);
    svg.select('g').attr('class', 'y-axis');
    svg.select('g.y-axis')
      .attr('transform', `translate(${config.paddingLeft},0)`)
      .call(yAxis);

    // move fn
    d3.selection.prototype.moveToFront = function moveToFront1() {
      return this.each(function moveToFront2() {
        this.parentNode.appendChild(this);
      });
    };
    // add tooltip
    const tooltipA = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const tooltipB = d3.select('body')
      .append('div')
      .attr('class', 'tooltip2')
      .style('opacity', 0);

    // add Option Bars
    svg.append('g').attr('class', 'rects').selectAll('rect')
      .data(widthData, (d) => String(d.Option) + d.Section)
      .join(
        (enter) => {
          enter
            .append('rect')
            .attr('id', (d) => `option${String(d.Option)}${d.Section}`)
          // offset by previous widths
            .attr('x', (d, i) => {
              // sum of all previous widths
              const prevWidths = widthData.slice(0, i).map((s) => s.Width);
              const offset = prevWidths.reduce((sum, width) => sum + width, 0) % 60;
              return xScale(offset);
            })
            .attr('y', (d) => yScale(d.Option))
            .attr('width', (d) => xScale(d.Width))
            .attr('height', yScale.bandwidth)
            .attr('transform', `translate(${config.paddingLeft},0)`)
            .style('fill', (d) => colorScale(d.Section))
            .style('stroke', 'black')
            .on('mouseover', function mouseAction(event, d) {
              tooltipA.transition()
                .duration(200)
                .style('opacity', 0.9);
              const tooltipContent = `${splitSectionName(d.Section)}: ${d.Width} feet`;
              d3.select(this).moveToFront();
              tooltipA.html(tooltipContent)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY}px`);
              tooltipB.transition()
                .duration(400)
                .style('opacity', 0.9);
              const tooltipBContent = roadSections[splitSectionName(d.Section)];
              d3.select(this).moveToFront();
              tooltipB.html(tooltipBContent);
              // .style("left", (event.pageX + 10) + "px")
              // .style("top", (event.pageY) + "px");
            })
            .on('mouseout', () => {
              tooltipA.transition()
                .duration(500)
                .style('opacity', 0);
              tooltipB.transition()
                .duration(500)
                .style('opacity', 0);
            });
        },
        (update) => {
          update
            .transition()
            .duration(200)
          // .delay((d,i)=>i*50)
            .attr('x', (d, i) => {
              // sum of all previous widths
              const prevWidths = widthData.slice(0, i).map((s) => s.Width);
              const offset = prevWidths.reduce((sum, width) => sum + width, 0) % 60;
              return xScale(offset);
            })
            .attr('y', (d) => yScale(d.Option))
            .attr('width', (d) => xScale(d.Width));
        },
      );

    // add axes labels and title
    svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', (config.w - (isMobile ? 0 : config.paddingLeft)) / 2)
      .attr('y', config.h - config.paddingBot * (isMobile ? 0.8 : 0.6))
      .attr('font-size', config.fontSize)
      .text('Width in feet');

    svg.append('text')
      .attr('class', 'caption-text')
      .attr('text-anchor', 'left')
      .attr('fill', 'grey')
    // .attr("x", (config.w - (isMobile ? 0 : config.paddingLeft)) / 2)
      .attr('x', config.paddingLeft)
      .attr('y', config.h - config.paddingBot * (isMobile ? 0.1 : 0.4))
      .attr('font-size', config.fontSize)
      .text('Note: the updated options have loading zones on the sidewalk');

    svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', isMobile ? 'end' : 'middle')
      .attr('x', isMobile ? config.paddingLeft : config.paddingLeft / 3)
      .attr('y', isMobile ? config.paddingTop * 0.8 : config.h / 2)
      .attr('font-size', config.fontSize)
    // .attr("transform", () => {return (isMobile ? "translate(0" + "," + config.h/2 + ")rotate(-90)": "rotate(0)")})
    // .attr("transform", () => {return (isMobile ? "translate(-" + config.w/2 +"," + config.h/2 + ")rotate(-90)": "rotate(0)")})
      .text('Option');

    // .attr("transform","rotate(-90)");
    svg.append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? 'small' : 'large')
      .style('font-weight', 700)
      .attr('x', (config.w - config.paddingRight / 2) / 2)
      .attr('y', config.paddingTop / 2)
      .attr('font-size', config.fontSize)
      .text('Road Distribution for Feb 2022 Telegraph Redesign');

    // add legend
    svg.selectAll('circle')
      .data(customScheme.slice(0, 5))
      .enter()
      .append('circle')
      .attr('r', config.legend_radius)
      .attr('cx', isMobile ? config.paddingLeft : config.w - (config.paddingRight * 0.5))
      .attr('cy', (d, i) => (isMobile ? config.h - 0.85 * config.paddingBot + (i + 1) * 5 * config.legend_radius
        : config.paddingTop + (i + 1) * 3.5 * config.legend_radius
      ))
      .attr('fill', (d) => d)
      .attr('stroke', 'black');

    svg.selectAll('legend-text')
      .data(Object.keys(roadSections).slice(0, 5))
      .enter()
      .append('text')
      .attr('x', isMobile ? config.paddingLeft + config.legend_radius * 1.5 : config.w - (config.paddingRight * 0.5) + config.legend_radius * 2)
      .attr('y', (d, i) => (isMobile ? config.h - 0.85 * config.paddingBot + (i + 1) * 5 * config.legend_radius + config.legend_radius
        : config.paddingTop + (i + 1) * 3.5 * config.legend_radius + config.legend_radius))
      .attr('fill', 'black')
      .attr('font-size', config.fontSize)
      .text((d) => d);
  }, [widthData]);

  // update data when checkbox changed
  useEffect(() => {
    // console.log('checkbox changed');
    setWidthData(toggleData(checked2));
  }, [checked2]);

  return (
    <>
      <div className="svg-div">
        <svg ref={svgRef} viewBox={`0 0 ${config.w} ${config.h}`} />
        <br />
        <ToggleCheckbox checked2={checked2} />
      </div>
    </>
  );
};

export default OptionWidthViz2;
