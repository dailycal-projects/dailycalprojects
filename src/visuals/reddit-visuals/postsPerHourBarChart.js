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
import data from './postsPerHourData';

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
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="Number of posts" fill="#f38040" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PostsPerHourBarChart;
