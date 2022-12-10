import React from 'react';
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
        <XAxis dataKey="flair" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="Number of posts" fill="#fcba64" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PostsPerFlairBarChart;
