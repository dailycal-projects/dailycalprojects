import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { alldata } from './data';

const HateLine = () => (
  <div className="container">
    <ResponsiveContainer height={350}>
      <LineChart
        width={1050}
        height={350}
        data={alldata}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="2 2" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="City"
          stroke="#E2565F"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="Campus"
          stroke="#000080"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default HateLine;
