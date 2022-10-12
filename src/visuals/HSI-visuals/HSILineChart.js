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
import { allData } from './HSIData';

const HSILineChart = () => (
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
      <h4> Percent composition of Latine and Hispanic students across four groups </h4>
    </div>
    <ResponsiveContainer height={550}>
      <LineChart
        width={750}
        height={550}
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
        <Line type="monotone" dataKey="California public schools" stroke="#489BD1" />
        <Line
          type="monotone"
          dataKey="Undergraduate"
          stroke="#8F679C"
          activeDot={{ r: 4 }}
        />
        <Line type="monotone" dataKey="Undergraduate and graduate" stroke="#E3565F" />
        <Line type="monotone" dataKey="Graduate" stroke="#95C361" />

      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default HSILineChart;
