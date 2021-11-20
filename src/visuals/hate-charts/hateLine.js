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

import { alldata } from './data.js';

const HateLine = () => {
    return(
        <div className="container">
    <h1> Crimes in City of Berkeley and UC Berkeley, 1995-2020 </h1>
    <LineChart
      width={600}
      height={300}
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
        dataKey="city_num"
        stroke="#E2565F"
        activeDot={{ r: 8 }}
      />
      <Line
        type="monotone"
        dataKey="campus_num"
        stroke="#000080"
        activeDot={{ r: 8 }}
      />
    </LineChart>
  </div>
);
};
  

export default HateLine;
