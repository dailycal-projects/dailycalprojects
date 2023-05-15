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
import { floorData } from './gymData';

const GymFloor = () => (
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
      <h4> Floor scores by week and team </h4>
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
          tickCount={7}
          dataKey="y"
          name="Floor score: "
          domain={[47.5, 50]}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} separator="" />
        <Legend />
        <Scatter
          name="UTAH"
          data={floorData.UTAH}
          fill="#df4c57"
          line
        />
        <Scatter
          name="CAL"
          data={floorData.CAL}
          fill="#186892"
          line
        />
        <Scatter
          name="OREGON STATE"
          data={floorData['OREGON STATE']}
          fill="#f17a32"
          line
        />
        <Scatter
          name="WASHINGTON"
          data={floorData.WASHINGTON}
          fill="#5f6a9a"
          line
        />
        <Scatter
          name="ARIZONA"
          data={floorData.ARIZONA}
          fill="#274659"
          line
        />
        <Scatter
          name="ARIZONA STATE"
          data={floorData['ARIZONA STATE']}
          fill="#fdd23c"
          line
        />
        <Scatter name="UCLA" data={floorData.UCLA} fill="#71aad9" line />
        <Scatter
          name="STANFORD"
          data={floorData.STANFORD}
          fill="#ab4a51"
          line
        />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

export default GymFloor;
