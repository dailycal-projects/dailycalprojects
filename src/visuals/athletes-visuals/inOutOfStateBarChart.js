import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  {
    name: 'In-state',
    Public: 0.688,
    Private: 0.3,
    Other: 0.012,
  },
  {
    name: 'Out-of-state',
    Public: 0.529,
    Private: 0.428,
    Other: 0.043,
  },
  // {
  //   name: "In-state",
  //   Public: 337,
  //   Private: 147,
  //   Other: 6,
  // },
  // {
  //   name: "Out-of-state",
  //   Public: 209,
  //   Private: 169,
  //   Other: 17,
  // },
];
export default function inOutOfStateBarChart() {
  return (
    <div
      className="background"
      style={{
        backgroundColor: '#e9edf0',
        padding: '30px',
      }}
    >
      <h4 style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 20,
      }}
      >
        {' '}
        Percent of in-state and out-of-state athletes by school type
      </h4>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          left: '20px',
        }}
      />
      <ResponsiveContainer height={400}>
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20,
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
          <Bar dataKey="Private" stackId="a" fill="#E77876" />
          <Bar dataKey="Public" stackId="a" fill="#70AADA" />
          <Bar dataKey="Other" stackId="a" fill="#c9c9c9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
