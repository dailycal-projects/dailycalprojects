import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const data = [
  {
    zip: 94707,
    house_burd: 2.34,
    lead_pctl: 57.91,
  },
  {
    zip: 94709,
    house_burd: 5.11,
    lead_pctl: 74.69,
  },
  {
    zip: 94707,
    house_burd: 7.39,
    lead_pctl: 67.69,
  },
  {
    zip: 94707,
    house_burd: 7.73,
    lead_pctl: 60.92,
  },
  {
    zip: 94708,
    house_burd: 8.30,
    lead_pctl: 65.42,
  },
  {
    zip: 94708,
    house_burd: 12.91,
    lead_pctl: 60.76,
  },
  {
    zip: 94705,
    house_burd: 12.91,
    lead_pctl: 7.49,
  },
  {
    zip: 94708,
    house_burd: 15.72,
    lead_pctl: 65.36,
  },
  {
    zip: 94705,
    house_burd: 17.04,
    lead_pctl: 65.41,
  },
  {
    zip: 94704,
    house_burd: 19.19,
    lead_pctl: 62.49,
  },
  {
    zip: 94703,
    house_burd: 33.24,
    lead_pctl: 78.91,
  },
  {
    zip: 94702,
    house_burd: 39.20,
    lead_pctl: 75.36,
  },
  {
    zip: 94702,
    house_burd: 41.03,
    lead_pctl: 63.05,
  },
  {
    zip: 94703,
    house_burd: 42.68,
    lead_pctl: 68.97,
  },
  {
    zip: 94702,
    house_burd: 44.76,
    lead_pctl: 68.82,
  },
  {
    zip: 94710,
    house_burd: 50.05,
    lead_pctl: 62.60,
  },
  {
    zip: 94705,
    house_burd: 57.15,
    lead_pctl: 72.77,
  },
  {
    zip: 94704,
    house_burd: 63.33,
    lead_pctl: 64.59,
  },
  {
    zip: 94709,
    house_burd: 64.67,
    lead_pctl: 73.91,
  },
  {
    zip: 94702,
    house_burd: 67.52,
    lead_pctl: 61.43,
  },
  {
    zip: 94702,
    house_burd: 70.33,
    lead_pctl: 66.78,
  },
  {
    zip: 94704,
    house_burd: 73.27,
    lead_pctl: 59.29,
  },
  {
    zip: 94710,
    house_burd: 73.93,
    lead_pctl: 76.99,
  },
  {
    zip: 94703,
    house_burd: 75.42,
    lead_pctl: 66.94,
  },
  {
    zip: 94705,
    house_burd: 78.13,
    lead_pctl: 78.13,
  },
  {
    zip: 94710,
    house_burd: 84.18,
    lead_pctl: 81.02,
  },
  {
    zip: 94703,
    house_burd: 85.62,
    lead_pctl: 64.39,
  },
  {
    zip: 94710,
    house_burd: 89.70,
    lead_pctl: 71.07,
  },
  {
    zip: 94709,
    house_burd: 91.31,
    lead_pctl: 40.26,
  },
  {
    zip: 94703,
    house_burd: 98.72,
    lead_pctl: 44.34,
  },
  {
    zip: 94703,
    house_burd: 98.79,
    lead_pctl: 52.26,
  },
  {
    zip: 94704,
    house_burd: 99.39,
    lead_pctl: 48.82,
  },
  {
    zip: 94703,
    house_burd: 99.53,
    lead_pctl: 22.77,
  },
  {
    zip: 94704,
    house_burd: 99.67,
    lead_pctl: 55.58,
  },
];
export default () => (
  <div>
    <LineChart
      width={1000}
      height={600}
      data={data}
      margin={{
        top: 30, right: 30, left: 20, bottom: 30,
      }}
    >
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      <XAxis
        type="number"
        label={{ value: 'Housing Burden', position: 'bottom' }}
        dataKey="house_burd"
        ticks={[5, 10, 20, 50, 70, 80, 90, 95]}
      />
      <YAxis />
      <Tooltip />
      <Legend verticalAlign="top" height={36} />
      <Line
        type="monotone"
        dataKey="lead_pctl"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      />
      {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" activeDot={{ r: 8 }} /> */}
    </LineChart>
  </div>
);
