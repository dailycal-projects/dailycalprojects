import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { alldata } from './data';

const HateLine = () => (
  <div className="container">
    <LineChart
      width={1200}
      height={400}
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
        dataKey="city"
        stroke="#E2565F"
        activeDot={{ r: 8 }}
      />
      <Line
        type="monotone"
        dataKey="campus"
        stroke="#000080"
        activeDot={{ r: 8 }}
      />
    </LineChart>
  </div>
);

export default HateLine;
