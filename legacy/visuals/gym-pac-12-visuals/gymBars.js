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
} from 'recharts';
import { barsData } from './gymData';

const GymBars = () => (
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
      <h4> Bar scores by week and team </h4>
    </div>
    <ResponsiveContainer height={600} width="100%">
      <ScatterChart
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
        <ZAxis type="number" dataKey="team" name=" " range={[25]} />
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
          name="Bar score: "
          domain={[46.75, 50]}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} separator="" />
        <Legend />
        <Scatter
          name="UTAH"
          data={barsData.UTAH}
          fill="#df4c57"
          line
        />
        <Scatter
          name="CAL"
          data={barsData.CAL}
          fill="#186892"
          line
        />
        <Scatter
          name="OREGON STATE"
          data={barsData['OREGON STATE']}
          fill="#f17a32"
          line
        />
        <Scatter
          name="WASHINGTON"
          data={barsData.WASHINGTON}
          fill="#5f6a9a"
          line
        />
        <Scatter
          name="ARIZONA"
          data={barsData.ARIZONA}
          fill="#274659"
          line
        />
        <Scatter
          name="ARIZONA STATE"
          data={barsData['ARIZONA STATE']}
          fill="#fdd23c"
          line
        />
        <Scatter name="UCLA" data={barsData.UCLA} fill="#71aad9" line />
        <Scatter
          name="STANFORD"
          data={barsData.STANFORD}
          fill="#ab4a51"
          line
        />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

export default GymBars;
