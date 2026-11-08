import React, { Component } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import data from './dailyCommentCountData';

class CustomizedAxisTick extends Component {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={10}
          dy={0}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

const DailyCommentLineChart = () => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        left: '20px',
      }}
    >
      <h4> Total number of daily comments </h4>
    </div>
    <ResponsiveContainer height={550}>
      <LineChart
        width={750}
        height={550}
        data={data}
        margin={{
          top: 5,
          right: 40,
          left: 20,
          bottom: 50,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={<CustomizedAxisTick />} />
        <YAxis />
        <Tooltip />
        {/* <Legend /> */}
        <Line
          type="monotone"
          dataKey="Number of comments"
          stroke="#6bb4ba"
          activeDot={{ r: 8 }}
        />
        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default DailyCommentLineChart;
