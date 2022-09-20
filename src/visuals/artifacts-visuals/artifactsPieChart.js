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
      <h4> Minimum number of individuals, MNI, and associated funerary objects, AFO, held by UC Davis and UC Berkeley </h4>
    </div>
    <ResponsiveContainer height={650}>
      <PieChart height={650} width={650}>
        <Pie
          data={innerData}
          dataKey="value"
          outerRadius={150}
          fill="#fee28e"
        />
        <Pie
          data={outerData}
          dataKey="value"
          innerRadius={175}
          outerRadius={275}
          fill="#489bd1"
          label
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default ArtifactsPieChart;
