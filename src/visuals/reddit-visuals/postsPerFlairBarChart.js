import React, { Component } from 'react';
import {
  BarChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from 'recharts';
import data from './postsPerFlairData';

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

const PostsPerFlairBarChart = () => (

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
      <h4> Total number of posts per flair </h4>
    </div>
    <ResponsiveContainer height={680}>
      <BarChart width={400} height={680} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="flair" tick={<CustomizedAxisTick />} height={125} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="Number of posts" fill="#fcba64" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PostsPerFlairBarChart;
