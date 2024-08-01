import '../App.css';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, CartesianGrid, Tooltip,
} from 'recharts';
import data from '../data/debt_by_sport';

function DebtBarChart() {
  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Overall debt compared to debt incurred by football</h3>
      <div style={{
        display: 'block',
        marginTop: 'auto',
      }}
      >
        <ResponsiveContainer height={500}>
          <BarChart
            width="100%"
            height={500}
            data={data}
            margin={{
              top: 5,
              right: 0,
              left: 35,
              bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Year" type="category" label={{ value: 'Year', position: 'insideBottom', offset: -10 }} />
            <YAxis
              type="number"
              label={{
                value: 'Debt ($M in 2024)', angle: -90, position: 'insideLeft', textAlign: 'center', dy: 80,
              }}
            />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}M`} />
            <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ right: 170, top: 30 }} />
            <Bar dataKey="Total" name="Total" fill="#215675" fillOpacity={0.75} />
            <Bar dataKey="Football" name="Football" fill="#72577a" fillOpacity={0.75} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DebtBarChart;
