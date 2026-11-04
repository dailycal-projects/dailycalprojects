import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import enrollmentData from '../data/classEnrollment';

const DATASETS = [
  { key: 'DATA8', label: 'Data 8' },
  { key: 'CS61A', label: 'CS 61A' },
  { key: 'ENGLISH45A', label: 'English 45A' },
];

function ClassEnrollmentLineChart() {
  const [selected, setSelected] = useState('DATA8');
  const data = enrollmentData[selected] || [];

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>
        Class enrollment and capacity for
        {' '}
        {DATASETS.find((d) => d.key === selected).label}
      </h3>
      <label htmlFor="classSelect" style={{ marginRight: 8 }}>
        {' '}
        Select Class:
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          {DATASETS.map(({ key, label }) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 10, right: 30, left: 20, bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Term" label={{ value: 'Term', position: 'insideBottom', offset: -10 }} />
          <YAxis label={{
            value: 'Enrolled',
            angle: -90, // ← rotate 90° counter-clockwise
            position: 'insideLeft',
            dy: 10, // ← fine-tune vertical position
            dx: 0, // ← fine-tune horizontal position
            style: { textAnchor: 'middle' },
          }}
          />
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend verticalAlign="top" align="right" height={36} />

          <Line
            type="linear"
            dataKey="Enrolled"
            name="Enrolled"
            stroke="#5A82CC"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="linear"
            dataKey="Capacity"
            name="Capacity"
            stroke="#FFBB47"
            strokeDasharray="5 5"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ClassEnrollmentLineChart;
