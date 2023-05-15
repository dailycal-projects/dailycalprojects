import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import data from './subscriberCountData';

const SubscriberLineChart = () => (
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
      <h4> Total subscriber count</h4>
    </div>
    <ResponsiveContainer height={550}>
      <LineChart
        width={750}
        height={550}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {/* <Legend /> */}
        <Line type="monotone" dataKey="Subscriber count" stroke="#ec6b4e" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default SubscriberLineChart;
