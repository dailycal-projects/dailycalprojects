import React, { Component } from 'react';
import {
  BarChart,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts';
import data from './postsPerHourData';

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

const PostsPerHourBarChart = () => (
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
      <h4> Total number of posts per hour of day </h4>
    </div>
    <ResponsiveContainer height={600}>
      <BarChart width={400} height={600} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={<CustomizedAxisTick />} height={125} minTickGap={-10} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="Number of posts" fill="#f38040" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PostsPerHourBarChart;
