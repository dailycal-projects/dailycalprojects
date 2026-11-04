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
import gapDataMath from './gapDataMath';
import gapDataELA from './gapDataELA';

class CustomizedAxisTick extends Component {
  render() {
    const {
      x, y, payload,
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

  <div className="App">

    <br />
    <div
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
          <p> California school districts with the largest gaps in Black and white students meeting state standards on the 2022 Smarter Balanced Assessments in math </p>
        </strong>
      </div>
      <ResponsiveContainer height={745}>
        <BarChart
          width={400}
          height={745}
          data={gapDataMath}
          margin={{
            top: 5,
            right: 10,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="District"
            tick={<CustomizedAxisTick />}
            height={145}
          />
          <YAxis
            tickFormatter={(tick) => `${tick}%`}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
          />
          <Legend />
          <Bar
            dataKey="Difference in performance"
            fill="#f0876a"
          />
          <Bar
            dataKey="White students"
            fill="#abcd80"
          />
          <Bar
            dataKey="Black students"
            fill="#a07fac"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <br />
    <br />

    <br />
    <div
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
          <p> California school districts with the largest gaps in Black and white students meeting state standards on the 2022 Smarter Balanced Assessments in English language arts </p>
        </strong>
      </div>
      <ResponsiveContainer height={740}>
        <BarChart
          width={400}
          height={740}
          data={gapDataELA}
          margin={{
            top: 5,
            right: 10,
            left: 5,
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
          <Tooltip
            formatter={(value) => `${value}%`}
          />
          <Legend />
          <Bar
            dataKey="Difference in performance"
            fill="#f0876a"
          />
          <Bar
            dataKey="White students"
            fill="#abcd80"
          />
          <Bar
            dataKey="Black students"
            fill="#a07fac"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default GapStackedBarChart;
