import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
}
  from 'recharts';
import { totalsData } from './gymData';

const GymTotals = () => (
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
      <h4> Total scores by week and team </h4>
    </div>
    <ResponsiveContainer height={600} width="100%">
      <ScatterChart
        data={totalsData}
        width={900}
        height={600}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid />
        <ZAxis type="number" dataKey="team" name=" " range={[100]} />
        <XAxis
          type="category"
          dataKey="x"
          name=" "
          allowDuplicatedCategory={false}
        />
        <YAxis
          type="number"
          tickCount={8}
          dataKey="y"
          name="Total score: "
          domain={[193, 200]}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} separator="" />
        <Legend />
        <Scatter
          name="UTAH"
          data={totalsData.UTAH}
          fill="#df4c57"
          line
        />
        <Scatter
          name="CAL"
          data={totalsData.CAL}
          fill="#186892"
          line
        />
        <Scatter
          name="OREGON STATE"
          data={totalsData['OREGON STATE']}
          fill="#f17a32"
          line
        />
        <Scatter
          name="WASHINGTON"
          data={totalsData.WASHINGTON}
          fill="#5f6a9a"
          line
        />
        <Scatter
          name="ARIZONA"
          data={totalsData.ARIZONA}
          fill="#274659"
          line
        />
        <Scatter
          name="ARIZONA STATE"
          data={totalsData['ARIZONA STATE']}
          fill="#fdd23c"
          line
        />
        <Scatter name="UCLA" data={totalsData.UCLA} fill="#71aad9" line />
        <Scatter
          name="STANFORD"
          data={totalsData.STANFORD}
          fill="#ab4a51"
          line
        />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

export default GymTotals;
