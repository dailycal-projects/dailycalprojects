import React, { Component } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { gapDataMath } from './gapDataMath';
import { gapDataELA } from './gapDataELA';

class CustomizedAxisTick extends Component {
  render() {
    const {
      x, y, stroke, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={10} dy={0} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  }
}

const GapStackedBarChart = () => (

  <div
    className="App"
    style={{
      backgroundColor: '#e9edf0',
      padding: '20px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '30px',
      }}
    >
      <strong>
        <p> CA school districts with the largest gaps in Black and white student performance on 2022 Smarter Balanced math tests </p>
      </strong>
    </div>
    <br />
    <ResponsiveContainer height={710}>
      <BarChart
        width={400}
        height={710}
        data={gapDataMath}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="District"
          tick={<CustomizedAxisTick />}
          height={110}
        />
        <YAxis
          tickFormatter={(tick) => `${tick}%`}
        />
        <Tooltip />
        <Bar
          dataKey="Difference in Black and white student performance"
          fill="#f0876a"
        />
        <Bar
          dataKey="Percent of white students"
          fill="#abcd80"
        />
        <Bar
          dataKey="Percent of Black students"
          fill="#a07fac"
        />
      </BarChart>
    </ResponsiveContainer>

    <br />
    <br />

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '30px',
      }}
    >
      <strong>
        <p> CA school districts with the largest gaps in Black and white student performance on 2022 Smarter Balanced ELA tests </p>
      </strong>
    </div>
    <br />
    <ResponsiveContainer height={740}>
      <BarChart
        width={400}
        height={740}
        data={gapDataELA}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="District"
          tick={<CustomizedAxisTick />}
          height={140}
        />
        {' '}
        <YAxis
          tickFormatter={(tick) => `${tick}%`}
        />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="Difference in Black and white student performance"
          fill="#f0876a"
        />
        <Bar
          dataKey="Percent of white students"
          fill="#abcd80"
        />
        <Bar
          dataKey="Percent of Black students"
          fill="#a07fac"
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default GapStackedBarChart;
