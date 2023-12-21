import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend,
  Label,
  ResponsiveContainer,
} from 'recharts';

import theftsPerHourData from './theftsPerHourData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
        <p>{`Hour: ${label}`}</p>
        <p>{`Thefts: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const TheftsPerHourLineChart = () => (
  <div style={{ backgroundColor: '#e9edf0', padding: '20px' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        left: '20px',
      }}
    >
      <h4> Thefts per hour of day </h4>
    </div>
    <ResponsiveContainer height={550}>
      <LineChart
        width={750}
        height={550}
        data={theftsPerHourData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour">
          <Label value="Hour of day" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis label={{ value: 'Number of thefts', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        {/* <Legend wrapperStyle={{ bottom: -10 }} /> */}
        <Line type="monotone" dataKey="thefts" stackId="a" fill="#FFFFFF" stroke="#70aada" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default TheftsPerHourLineChart;
