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
import { vaultData } from './gymData';

const GymVault = () => (
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
      <h4> Vault scores by week and team </h4>
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
          name="Vault score: "
          domain={[48.25, 50]}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} separator="" />
        <Legend />
        <Scatter
          name="UTAH"
          data={vaultData.UTAH}
          fill="#df4c57"
          line
        />
        <Scatter
          name="CAL"
          data={vaultData.CAL}
          fill="#186892"
          line
        />
        <Scatter
          name="OREGON STATE"
          data={vaultData['OREGON STATE']}
          fill="#f17a32"
          line
        />
        <Scatter
          name="WASHINGTON"
          data={vaultData.WASHINGTON}
          fill="#5f6a9a"
          line
        />
        <Scatter
          name="ARIZONA"
          data={vaultData.ARIZONA}
          fill="#274659"
          line
        />
        <Scatter
          name="ARIZONA STATE"
          data={vaultData['ARIZONA STATE']}
          fill="#fdd23c"
          line
        />
        <Scatter name="UCLA" data={vaultData.UCLA} fill="#71aad9" line />
        <Scatter
          name="STANFORD"
          data={vaultData.STANFORD}
          fill="#ab4a51"
          line
        />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

export default GymVault;
