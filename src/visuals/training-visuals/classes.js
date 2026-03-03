// import * as d3 from 'd3';

// const toNumber = (v) => {
//   if (v == null) return 0;
//   if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
//   return +String(v).replace(/,/g, '').trim() || 0;
// };

// class ClassesVisualization {
//   constructor({
//     el,
//     data = [],
//     width = 960,
//     height = 460,
//     margin = { top: 32, right: 32, bottom: 56, left: 56}
//   }) {
//     this.el = typeof el === 'string' ? document.querySelector(el) : el;
//     if (!this.el) throw new Error('ClassesVisualization: target element not found.');

//     this.width = width;
//     this.height = height;
//     this.margin = margin;

//     this.svg = d3
//       .select(this.el)
//       .append('svg')
//       .attr('viewBox', `0 0 ${width} ${height}`)
//       .attr('width', '100%')
//       .attr('height', 'auto');

//     this.axisG = this.svg.append('g').attr('class', 'x-axis');
//     this.plotG = this.svg.append('g').attr('class', 'plot');

//     this.update(data);
//   }

//   update(data = []) {
//     const source = Array.isArray(data) ? data : [];

//     this.data = source
//       .map((d, i) => {
//         const major = d.Major ?? d.major ?? d.MAJORS ?? 'Unknown';
//         return {
//           id: `${major}-${i}`,
//           major,
//           graduated: toNumber(d.Graduated ?? d.graduated),
//           enrolled: toNumber(d.Enrolled ?? d.enrolled)
//         };
//       })
//       .filter((d) => Number.isFinite(d.graduated) && Number.isFinite(d.enrolled));

//     const { width, height, margin } = this;
//     const innerLeft = margin.left;
//     const innerRight = width - margin.right;
//     const axisY = height - margin.bottom;
//     const centerY = margin.top + (axisY - margin.top) * 0.45;

//     let [minGraduated, maxGraduated] = d3.extent(this.data, (d) => d.graduated);
//     if (!Number.isFinite(minGraduated) || !Number.isFinite(maxGraduated)) {
//       minGraduated = 0;
//       maxGraduated = 1;
//     }
//     if (minGraduated === maxGraduated) {
//       minGraduated -= 1;
//       maxGraduated += 1;
//     }

//     const x = d3
//       .scaleLinear()
//       .domain([minGraduated, maxGraduated])
//       .nice()
//       .range([innerLeft, innerRight]);

//     const maxEnrolled = d3.max(this.data, (d) => d.enrolled) || 1;
//     const r = d3
//       .scaleSqrt()
//       .domain([0, maxEnrolled])
//       .range([6, 36]);

//     this.axisG
//       .attr('transform', `translate(0,${axisY})`)
//       .call(
//         d3
//           .axisBottom(x)
//           .ticks(8)
//           .tickFormat(d3.format(',')),
//       )
//       .call((g) => g.select('.domain').attr('stroke', '#9ca3af'))
//       .call((g) => g.selectAll('.tick line').attr('stroke', '#d1d5db'));

//     this.svg
//       .selectAll('.x-label')
//       .data([null])
//       .join('text')
//       .attr('class', 'x-label')
//       .attr('x', (innerLeft + innerRight) / 2)
//       .attr('y', height - 12)
//       .attr('text-anchor', 'middle')
//       .attr('fill', '#374151')
//       .style('font-size', '12px')
//       .text('Graduated');

//     const nodes = this.data.map((d) => ({
//       ...d,
//       x: x(d.graduated),
//       y: centerY,
//     }));

//     if (nodes.length > 0) {
//       const sim = d3
//         .forceSimulation(nodes)
//         .force('x', d3.forceX((d) => x(d.graduated)).strength(1))
//         .force('y', d3.forceY(centerY).strength(0.08))
//         .force('collide', d3.forceCollide((d) => r(d.enrolled) + 1.5))
//         .stop();

//       for (let i = 0; i < 260; i += 1) sim.tick();
//     }

//     const bubbles = this.plotG
//       .selectAll('g.major-node')
//       .data(nodes, (d) => d.id);

//     const bubblesEnter = bubbles
//       .enter()
//       .append('g')
//       .attr('class', 'major-node');

//     bubblesEnter.append('circle');
//     bubblesEnter.append('text');

//     const bubblesMerged = bubbles.merge(bubblesEnter);

//     bubblesMerged.attr('transform', (d) => `translate(${d.x},${d.y})`);

//     bubblesMerged
//       .select('circle')
//       .attr('r', (d) => r(d.enrolled))
//       .attr('fill', '#3b82f6')
//       .attr('fill-opacity', 0.75)
//       .attr('stroke', '#1d4ed8')
//       .attr('stroke-width', 1);

//     bubblesMerged
//       .select('text')
//       .attr('text-anchor', 'middle')
//       .attr('dy', '0.35em')
//       .style('font-size', '10px')
//       .style('fill', '#111827')
//       .style('pointer-events', 'none')
//       .text((d) => d.major);

//     bubblesMerged
//       .selectAll('title')
//       .data((d) => [d])
//       .join('title')
//       .text(
//         (d) => `${d.major}\nGraduated: ${d3.format(',')(d.graduated)}\nEnrolled: ${d3.format(',')(d.enrolled)}`,
//       );

//     bubbles.exit().remove();
//   }

//   destroy() {
//     this.svg.remove();
//   }
// }

// export { ClassesVisualization };
// export default ClassesVisualization;

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv", function(data) {

// X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(function(d) { return d.Country; }))
  .padding(0.2);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, 13000])
  .range([ height, 0]);
svg.append("g")
  .call(d3.axisLeft(y));

// Bars
svg.selectAll("mybar")
  .data(data)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.Country); })
    .attr("y", function(d) { return y(d.Value); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.Value); })
    .attr("fill", "#69b3a2")

})
