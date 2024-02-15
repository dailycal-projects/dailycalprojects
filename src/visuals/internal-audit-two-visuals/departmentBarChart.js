import React from 'react';
import {
  BarChart, Bar, YAxis, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import department from './departmentBarChartData';

const CustomizedAxisTick = (props) => {
  const {
    x, y, payload,
  } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={-10}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(0)"
      >
        {payload.value}
      </text>
    </g>
  );
};

const DepartmentBarChart = () => (
  <div
    style={{
      backgroundColor: '#e9edf0',
      padding: '20px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '10px',
      }}
    >
      <strong>
        <p>
          Departments at the Daily Cal
        </p>
      </strong>
    </div>

    <ResponsiveContainer height={600}>
      <BarChart
        data={department}
        layout="vertical"
        margin={{
          top: 5,
          right: 5,
          left: 75,
          bottom: 50,
        }}
      >
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" tick={<CustomizedAxisTick />} width={100} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip separator=": " />
        <Legend />
        <Bar dataKey="Percent" fill="#8884d8" barSize={20} legendType="none" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default DepartmentBarChart;
