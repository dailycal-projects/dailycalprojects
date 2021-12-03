import React from 'react';
import {
  Legend, BarChart, XAxis, YAxis, Tooltip, Bar,
} from 'recharts';

import { data1, data2 } from './data';

const HateBar = () => {
  const yellowOrange = '#F9A84A';
  const orange = '#F28147';
  const blueViolet = '#6F82B5';
  const blue = '#4B9CCF';
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <BarChart
        width={500}
        height={400}
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
        <Bar yAxisId="left" dataKey="California" fill={yellowOrange} />
        <Bar yAxisId="right" dataKey="National" fill={blueViolet} />
      </BarChart>
      <BarChart
        width={510}
        height={400}
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
        <Bar yAxisId="left" dataKey="California" fill={orange} />
        <Bar yAxisId="right" dataKey="National" fill={blue} />
      </BarChart>
    </div>
  );
};

export default HateBar;
