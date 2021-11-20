import React, { Component } from 'react';
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
import { lunchData } from './rentShelterData';

class LunchChart extends Component {
  render() {
    return (
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
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="County-wide percent of students"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="BUSD percent of students"
          stroke="#82ca9d"
        />
      </LineChart>
    );
  }
}

export default LunchChart;
