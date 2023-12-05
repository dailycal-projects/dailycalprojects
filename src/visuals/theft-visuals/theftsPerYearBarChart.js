import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from 'recharts';

import theftsPerYearData from './theftsPerYearData';

const TheftsPerYearBarChart = () => (
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
      <h4> Thefts Per Year </h4>
    </div>
    <ResponsiveContainer height={550}>
      <BarChart
        width={750}
        height={550}
        data={theftsPerYearData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year">
          <Label value="Year" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis label={{
          value: 'Number of Thefts', angle: -90, position: 'insideLeft', offset: 10,
        }}
        />
        <Tooltip />
        <Legend wrapperStyle={{ bottom: -10, left: 25 }} />
        <Bar dataKey="Bike" stackId="a" fill="#70aada" />
        <Bar dataKey="E-Scooter" stackId="a" fill="#abcd80" />
        <Bar dataKey="E-Bike" stackId="a" fill="#feda6a" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default TheftsPerYearBarChart;