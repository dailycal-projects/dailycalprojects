import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { optionWidthsData } from './optionWidthsData';
import './optionWidths.css';

const config = {
  w: 1000,
  h: 600,
  paddingLeft: 100,
  paddingRight: 300,
  paddingTop: 100,
};

const xScale = d3.scaleLinear()
  .domain([0, 60])
  .range([0, config.w - config.paddingRight]);

const yScale = d3.scaleBand()
  .domain([5, 4, 3, 2, 1])
  .range([config.h - config.paddingTop, config.paddingTop])
  .paddingInner(0.2)
  .paddingOuter(0.05);

const splitSectionName = (section) => {
  const split = section.split(/(?=[A-Z])/);
  if (split.length > 1) {
    split[1] = split[1].toLowerCase();
  }
  return split.join(' ').replace(/[0-9]/g, '');
};

const toggleData = (checked) => {
  const original_data = [...optionWidthsData];
  //   console.log('toggling data', original_data);
  let data_copy;
  // if checked return combined + sorted data
  if (checked) {
    data_copy = original_data.map((o) => {
      // combine sidewalks
      o.Sidewalk1 += o.Sidewalk2;
      o.Sidewalk2 = 0;
      // combine curb extensions
      o.CurbExtension1 += o.CurbExtension2;
      o.CurbExtension2 = 0;
      // sort by values???
      return o;
    });
    // console.log('data after mapping', data_copy);
    // console.log("updated data", checked, data_copy);
  } else {
    data_copy = [...original_data.map((o) => {
      // split sidewalks
      if ([1, 2, 3, 4].includes(o.Option)) {
        o.Sidewalk1 = 10;
        if (o.Option === 4) {
          o.Sidewalk2 = 12;
        } else {
          o.Sidewalk2 = 10;
        }
      }
      // }
      // split curb extensions
      if (o.Option === 2 || o.Option === 3) {
        o.CurbExtension1 = 6;
        o.CurbExtension2 = 6;
      }
      // sort by values???
      return o;
    })];
    // console.log('original data', data_copy);
    // console.log("original data", checked, data_copy);
    // console.log("original OG data", checked, optionWidthsData);
  }
  const keys = Object.keys(optionWidthsData[0]).slice(1, 9);
  const spread_data = data_copy.map((d) => {
    const single_object = keys.map((k) => {
      const object = {};
      object.Option = d.Option;
      object.Section = k;
      object.Width = d[k];
      return object;
    });
    return single_object;
  }).flat();
  return spread_data;
  // return data_copy;
};

// road section dict for tooltip and description
const road_sections = {
  Sidewalk: 'Sidewalk: This is where pedestrians travel.',
  'Curb extension': 'Curb extension: These are extensions of sidewalks into the street. These have many benefits for safety, such as increasing visibility and calming traffic',
  'Bike lane': 'BIke lane: A lane designated for bikes only. These currently exist on Bancroft',
  'Shared lane': 'Shared lane: A lane accessible by cars, buses, and bikes. In some cities, these represent recommended cycling lanes, or lanes that should preferrably be bikes-only.',
  'Bus lane': 'Bus lane: A lane designated for buses only.',
  'Parking bay': 'Parking bay: A space large enough to park a vehicle.',
};

const OptionWidthBarChart = () => {
  // add checkbox to change viewing modes and track view checkbox is using State
  const [checked, setChecked] = useState(false);
  const ToggleCheckbox = ({ checked }) => (
    <span className="toggle-checkbox">
      <label htmlFor="combine-widths-cb">Combine Widths</label>
      <input type="checkbox" id="combine-widths-cb" value="Sort Widths" checked={checked} onChange={() => { setChecked(!checked); }} />
    </span>
  );

  // update data so each section of each option is seperate object, like {Option: 1, Section: Sidwalk, Width: 12}
  const data = optionWidthsData;
  const keys = Object.keys(data[0]).slice(1, 9);
  const spread_data = data.map((d) => {
    const single_object = keys.map((k) => {
      const object = {};
      object.Option = d.Option;
      object.Section = k;
      object.Width = d[k];
      return object;
    });
    return single_object;
  }).flat();
    // console.log('spread data', spread_data);

  // set inital data using useState
  const [widthData, setWidthData] = useState(spread_data);

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
      .attr('transform', `translate(${config.paddingLeft},${config.h - config.paddingTop})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale).tickPadding([10]);
    svg.select('g').attr('class', 'y-axis');
    svg.select('g.y-axis')
      .attr('transform', `translate(${config.paddingLeft},0)`)
      .call(yAxis);

    // move fn
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
    // add tooltip
    const tooltip_a = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const tooltip_b = d3.select('body')
      .append('div')
      .attr('class', 'tooltip2')
      .style('opacity', 0);

    // add Option Bars
    const optionBars = svg.selectAll('rect')
      .data(widthData, (d) => String(d.Option) + d.Section)
      .join(
        (enter) => {
          enter
            .append('rect')
            .attr('id', (d) => `option${String(d.Option)}${d.Section}`)
          // offset by previous widths
            .attr('x', (d, i) => {
              // sum of all previous widths
              const prev_widths = widthData.slice(0, i).map((s) => s.Width);
              const offset = prev_widths.reduce((sum, width) => sum + width, 0) % 60;
              return xScale(offset);
            })
            .attr('y', (d) => yScale(d.Option))
            .attr('width', (d, i) => xScale(d.Width))
            .attr('height', yScale.bandwidth)
            .attr('transform', `translate(${config.paddingLeft},0)`)
            .style('fill', (d) => colorScale(d.Section))
            .style('stroke', 'black')
            .on('mouseover', function (event, d) {
              tooltip_a.transition()
                .duration(200)
                .style('opacity', 0.9);
              const tooltip_content = `${splitSectionName(d.Section)}: ${d.Width} feet`;
              d3.select(this).moveToFront();
              tooltip_a.html(tooltip_content)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY}px`);
              tooltip_b.transition()
                .duration(400)
                .style('opacity', 0.9);
              const tooltip_b_content = road_sections[splitSectionName(d.Section)];
              d3.select(this).moveToFront();
              tooltip_b.html(tooltip_b_content);
              // .style("left", (event.pageX + 10) + "px")
              // .style("top", (event.pageY) + "px");
            })
            .on('mouseout', (d) => {
              tooltip_a.transition()
                .duration(500)
                .style('opacity', 0);
              tooltip_b.transition()
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
              const prev_widths = widthData.slice(0, i).map((s) => s.Width);
              const offset = prev_widths.reduce((sum, width) => sum + width, 0) % 60;
              return xScale(offset);
            })
            .attr('y', (d) => yScale(d.Option))
            .attr('width', (d, i) => xScale(d.Width));
        },
      );

    // add axes labels and title
    svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', (config.w - config.paddingRight / 2) / 2)
      .attr('y', config.h - config.paddingTop / 2)
      .text('Width in feet');
    svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('x', config.paddingLeft / 3)
      .attr('y', config.h / 2)
      .text('Option');

    // .attr("transform","rotate(-90)");
    svg.append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'middle')
      .attr('x', (config.w - config.paddingRight / 2) / 2)
      .attr('y', config.paddingTop / 2)
      .text('Road Distribution for each Telegraph Redesign');

    // add legend
    // console.log('legend', customScheme.slice(0, 6));
    const legend_radius = 6;
    svg.selectAll('circle')
      .data(customScheme.slice(0, 6))
      .enter()
      .append('circle')
      .attr('r', legend_radius)
      .attr('cx', config.w - (config.paddingRight * 0.5))
      .attr('cy', (d, i) => config.paddingTop + (i + 1) * 20)
      .attr('fill', (d) => d)
      .attr('stroke', 'black');

    svg.selectAll('legend-text')
      .data(Object.keys(road_sections))
      .enter()
      .append('text')
      .attr('x', config.w - (config.paddingRight * 0.5) + legend_radius * 2)
      .attr('y', (d, i) => config.paddingTop + (i + 1) * 20 + legend_radius)
      .attr('fill', 'black')
      .text((d) => d);
  }, [widthData]);

  // update data when checkbox changed
  useEffect(() => {
    // console.log('checkbox changed');
    setWidthData(toggleData(checked));
  }, [checked]);

  return (
    <>
      <div className="svg-div">
        <svg ref={svgRef} />
        <br />
        <ToggleCheckbox checked={checked} />
      </div>
    </>
  );
};

export default OptionWidthBarChart;
