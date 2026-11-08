import React from 'react';
import {
  BarChart,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts';
import data from './postsPerDayData';

const PostsPerDayBarChart = () => (
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
      <h4> Total number of posts per day </h4>
    </div>
    <ResponsiveContainer height={600}>
      <BarChart width={400} height={600} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="Number of posts" fill="#469cd1" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PostsPerDayBarChart;
