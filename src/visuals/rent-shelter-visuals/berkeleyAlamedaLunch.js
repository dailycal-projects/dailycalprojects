import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from 'recharts';
import { lunchData } from './rentShelterData';

const LunchChart = () => (
  <div>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      left: '20px',
    }}
    >
      <h4> Percent of students in free and reduced-price meals program </h4>
    </div>
    <ResponsiveContainer height={550}>
      <LineChart
        width={750}
        height={550}
        data={lunchData}
        margin={{
          top: 5,
          right: 30,
          left: 30,
          bottom: 15,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="School year" angle={0} tick={{ fontSize: 16 }}>
          <Label value="School year" offset={-50} position="insideBottom" />
        </XAxis>
        <YAxis tick={{ fontSize: 16 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="County-wide percent of students"
          stroke="#487A9B"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="BUSD percent of students"
          stroke="#F28147"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default LunchChart;
