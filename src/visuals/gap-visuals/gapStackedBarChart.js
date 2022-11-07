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
import { gapDataMath } from './gapDataMath';
import { gapDataELA } from './gapDataELA';

const GapStackedBarChart = () => (

  <div
    className="App"
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
        padding: '30px',
      }}
    >
      <strong>
        <p> CA school districts with the largest gaps between Black and white student performance on 2022 Smarter Balanced math tests </p>
      </strong>
    </div>
    <br />
    <ResponsiveContainer height={600}>
      <BarChart
        width={400}
        height={600}
        data={gapDataMath}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="District" />
        <YAxis
          tickFormatter={(tick) => `${tick}%`}
        />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="Difference between Black and white students"
          fill="#f0876a"
        />
        <Bar
          dataKey="Percent of white students"
          fill="#abcd80"
        />
        <Bar
          dataKey="Percent of Black students"
          fill="#a07fac"
        />
      </BarChart>
    </ResponsiveContainer>

    <br />
    <br />

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '30px',
      }}
    >
      <strong>
        <p> CA school districts with the largest gaps between Black and white student performance on 2022 Smarter Balanced ELA tests </p>
      </strong>
    </div>
    <br />
    <ResponsiveContainer height={600}>
      <BarChart
        width={400}
        height={600}
        data={gapDataELA}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="District" />
        <YAxis
          tickFormatter={(tick) => `${tick}%`}
        />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="Difference between Black and white students"
          fill="#f0876a"
        />
        <Bar
          dataKey="Percent of white students"
          fill="#abcd80"
        />
        <Bar
          dataKey="Percent of Black students"
          fill="#a07fac"
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default GapStackedBarChart;
