import React from 'react';
import {
  Legend, BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer,
} from 'recharts';

import { data1, data2 } from './data';

const HateBar = () => {
  const yellowOrange = '#F9A84A';
  const orange = '#F28147';
  const blueViolet = '#6F82B5';
  const blue = '#4B9CCF';
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <ResponsiveContainer width={550} height={400}>
        <BarChart
          width={550}
          height={400}
          data={data1}
          margin={{
            top: 20,
            right: 60,
            left: -10,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" tick={{ fontSize: 16, transform: 'translate(0, 7)' }} />
          <YAxis yAxisId="left" orientation="left" stroke={yellowOrange} />
          <YAxis yAxisId="right" orientation="right" stroke="#83a6ed" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="California" fill={yellowOrange} />
          <Bar yAxisId="right" dataKey="National" fill={blueViolet} />
        </BarChart>
      </ResponsiveContainer>
      <ResponsiveContainer width={550} height={400}>
        <BarChart
          width={550}
          height={400}
          data={data2}
          margin={{
            top: 20,
            right: 50,
            left: 5,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" tick={{ fontSize: 16, transform: 'translate(0, 7)' }} />
          <YAxis yAxisId="left" orientation="left" stroke={orange} />
          <YAxis yAxisId="right" orientation="right" stroke={blue} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="California" fill={orange} />
          <Bar yAxisId="right" dataKey="National" fill={blue} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HateBar;
