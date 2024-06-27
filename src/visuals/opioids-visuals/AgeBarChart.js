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

const data = [
  {
    Year: 2012,
    '15 to 19': 0.0,
    '20 to 24': 0.0,
    '25 to 29': 0.0,
    '30 to 39': 0.0,
    '40 to 49': 0.330875,
    '50 to 64': 0.17,
  },
  {
    Year: 2013,
    '15 to 19': 0.0,
    '20 to 24': 0.0,
    '25 to 29': 0.0,
    '30 to 39': 0.106875,
    '40 to 49': 0.0,
    '50 to 64': 0.2205,
  },
  {
    Year: 2014,
    '15 to 19': 0.0,
    '20 to 24': 0.0,
    '25 to 29': 0.0,
    '30 to 39': 0.320625,
    '40 to 49': 0.21,
    '50 to 64': 0.0735,
  },
  {
    Year: 2015,
    '15 to 19': 0.0,
    '20 to 24': 0.0,
    '25 to 29': 0.0,
    '30 to 39': 0.100625,
    '40 to 49': 0.429375,
    '50 to 64': 0.232,
  },
  {
    Year: 2016,
    '15 to 19': 0.0,
    '20 to 24': 1.6975,
    '25 to 29': 1.45525,
    '30 to 39': 0.86625,
    '40 to 49': 0.985375,
    '50 to 64': 0.3010833333,
  },
  {
    Year: 2017,
    '15 to 19': 0.26625,
    '20 to 24': 0.2425,
    '25 to 29': 2.1725,
    '30 to 39': 0.57925,
    '40 to 49': 0.109,
    '50 to 64': 0.3375833333,
  },
  {
    Year: 2018,
    '15 to 19': 2.6665,
    '20 to 24': 0.75375,
    '25 to 29': 1.99575,
    '30 to 39': 1.069,
    '40 to 49': 0.21375,
    '50 to 64': 0.4360833333,
  },
  {
    Year: 2019,
    '15 to 19': 2.1275,
    '20 to 24': 6.25125,
    '25 to 29': 2.174,
    '30 to 39': 4.04825,
    '40 to 49': 0.968375,
    '50 to 64': 1.5554166667,
  },
  {
    Year: 2020,
    '15 to 19': 6.56825,
    '20 to 24': 10.44675,
    '25 to 29': 8.123,
    '30 to 39': 11.110625,
    '40 to 49': 6.655875,
    '50 to 64': 5.65125,
  },
  {
    Year: 2021,
    '15 to 19': 4.424,
    '20 to 24': 7.80575,
    '25 to 29': 22.1625,
    '30 to 39': 15.2405,
    '40 to 49': 12.27025,
    '50 to 64': 10.7803333333,
  },
  {
    Year: 2022,
    '15 to 19': 3.927,
    '20 to 24': 9.91375,
    '25 to 29': 16.01025,
    '30 to 39': 18.228625,
    '40 to 49': 16.85425,
    '50 to 64': 18.0530833333,
  },
  {
    Year: 2023,
    '15 to 19': 6.4835,
    '20 to 24': 11.788,
    '25 to 29': 24.9825,
    '30 to 39': 40.666,
    '40 to 49': 21.67,
    '50 to 64': 16.4073333333,
  },
];

const AgeBarChart = () => (
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
      <h4> Rolling Age-Adjusted Fentanyl Overdose Rates (per 100K residents) in Alameda County </h4>
    </div>
    <ResponsiveContainer height={400}>
      <LineChart
        width={600}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Year" />
        <YAxis type="number" domain={[0, 45]} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="15 to 19" stroke="#b5cfea" />
        <Line type="monotone" dataKey="20 to 24" stroke="#94bbe2" />
        <Line type="monotone" dataKey="25 to 29" stroke="#70aada" />
        <Line type="monotone" dataKey="30 to 39" stroke="#489bd1" />
        <Line type="monotone" dataKey="40 to 49" stroke="#487a9b" />
        <Line type="monotone" dataKey="50 to 64" stroke="#3d5c70" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default AgeBarChart;
