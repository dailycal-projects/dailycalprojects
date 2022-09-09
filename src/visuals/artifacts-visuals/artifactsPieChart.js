import React from 'react';
import {
  PieChart, Pie, Tooltip, ResponsiveContainer,
} from 'recharts';

const innerData = [
  { name: 'UC Berkeley', value: 123041 },
  { name: 'UC Davis', value: 3715 },
];
const outerData = [
  { name: 'UC Berkeley MNI', value: 9063 },
  { name: 'UC Berkeley AFO', value: 113978 },
  { name: 'UC Davis MNI', value: 266 },
  { name: 'UC Davis AFO', value: 3449 },
];

const ArtifactsPieChart = () => (
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
      <h4> The 10 largest major programs over time </h4>
    </div>
    <PieChart height={1000} width={1000}>
      <Pie
        data={innerData}
        dataKey="value"
        cx={200}
        cy={200}
        outerRadius={60}
        fill="#fee28e"
      />
      <Pie
        data={outerData}
        dataKey="value"
        cx={200}
        cy={200}
        innerRadius={70}
        outerRadius={90}
        fill="#489bd1"
        label
      />
      <Tooltip />
    </PieChart>
  </div>
);

export default ArtifactsPieChart;
