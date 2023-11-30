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
} from 'recharts';

import theftsPerLocationData from './popularTheftLocationsData';

const PopularTheftLocationsBarChart = () => (
  <div>
    <h4> The top 5 most popular theft locations </h4>
    <BarChart
      width={750}
      height={550}
      data={theftsPerLocationData}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="location">
        <Label value="Location" offset={-10} position="insideBottom" />
      </XAxis>
      <YAxis label={{ value: 'Number of Thefts', angle: -90, position: 'insideLeft' }} />
      <Tooltip />
      <Legend wrapperStyle={{ bottom: -10 }} />
      <Bar dataKey="count" fill="#f6975f" />
    </BarChart>
  </div>
);

export default PopularTheftLocationsBarChart;
