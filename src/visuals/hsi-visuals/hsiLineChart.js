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
import allData from './HSIData';

const HSILineChart = () => (
  <ResponsiveContainer height={650}>
    <LineChart
      width={700}
      height={400}
      data={allData}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="Undergraduate"
        stroke="#8884d8"
        activeDot={{ r: 4 }}
      />
      <Line type="monotone" dataKey="Graduate" stroke="#82ca9d" />
      <Line type="monotone" dataKey="Undergraduate and graduate" stroke="#FF5733" />
      <Line type="monotone" dataKey="California public schools" stroke="#3371FF" />

    </LineChart>
  </ResponsiveContainer>
);

export default HSILineChart;
