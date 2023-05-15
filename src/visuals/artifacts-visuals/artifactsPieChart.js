import React from 'react';
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Cell,
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

const colors = ['#e87876', '#f6975f', '#abcd80', '#6bb4ba', '#4d7da3', '#a07fac'];

const ArtifactsPieChart = () => (
  <div
    style={{
      backgroundColor: '#e9edf0',
      padding: '15px',
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
        <p> Minimum number of individuals (MNI) and associated funerary objects (AFO) held by UC Davis and UC Berkeley </p>
      </strong>
    </div>
    <ResponsiveContainer height={650}>
      <PieChart height={650} width={650}>
        <Pie
          data={innerData}
          dataKey="value"
          outerRadius={150}
        //   fill="#feda6a"
        >
          {
      innerData.map((entry, index) => (
        <Cell key={`cell-${entry.name}`} fill={colors[index]} />
      ))
    }
        </Pie>
        <Pie
          data={outerData}
          dataKey="value"
          innerRadius={175}
          outerRadius={275}
          fill="#489bd1"
          label
        >
          {
      outerData.map((entry, index) => (
        <Cell key={`cell-${entry.name}`} fill={colors[index + 2]} />
      ))
    }
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default ArtifactsPieChart;
