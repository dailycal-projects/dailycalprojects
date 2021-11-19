import React from 'react';
import {
  Legend, BarChart, XAxis, YAxis, Tooltip, Bar,
} from 'recharts';

import { data1, data2 } from './Data.js';

const HateBar = () => {
  const yellowOrange = '#F9A84A';
  const orange = '#F28147';
  const blueViolet = '#6F82B5';
  const blue = '#4B9CCF';
  return (
    <div className="container">
      <h1> (Aggregate) Types of Crimes, National and State-Wide </h1>
      <BarChart
        width={500}
        height={300}
        data={data1}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke={yellowOrange} />
        <YAxis yAxisId="right" orientation="right" stroke="#83a6ed" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="california" fill={yellowOrange} />
        <Bar yAxisId="right" dataKey="national" fill={blueViolet} />
      </BarChart>
      <BarChart
        width={500}
        height={300}
        data={data2}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke={orange} />
        <YAxis yAxisId="right" orientation="right" stroke={blue} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="california" fill={orange} />
        <Bar yAxisId="right" dataKey="national" fill={blue} />
      </BarChart>
    </div>
  );
};

export default HateBar;
