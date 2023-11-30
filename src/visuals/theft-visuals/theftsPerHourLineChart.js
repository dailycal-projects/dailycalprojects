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
} from 'recharts';

import theftsPerHourData from './theftsPerHourData';

const TheftsPerHourLineChart = () => (
  <div>
    <h4>
      Thefts Per Hour of Day
    </h4>
    <LineChart
      width={750}
      height={550}
      data={theftsPerHourData}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="hour">
        <Label value="Hour of Day" offset={-10} position="insideBottom" />
      </XAxis>
      <YAxis label={{ value: 'Number of Thefts', angle: -90, position: 'insideLeft' }} />
      <Tooltip />
      <Legend wrapperStyle={{ bottom: -10 }} />
      <Line type="monotone" dataKey="thefts" stackId="a" fill="#65bf9c" />
    </LineChart>
  </div>
);

export default TheftsPerHourLineChart;
