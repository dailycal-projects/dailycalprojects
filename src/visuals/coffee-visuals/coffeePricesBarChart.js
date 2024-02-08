import './App.css';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip,
} from 'recharts';
import { coffeeData } from './coffeeData';

const sortedData = coffeeData.info.sort(
  (a, b) => b.averagePrice - a.averagePrice,
);

function CoffeePricesBarChart() {
  return (
    <div style={{
      display: 'block',
      marginTop: 'auto',
      left: '20px',
    }}
    >

      <ResponsiveContainer height={1000}>
        <BarChart
          width={500}
          height={1000}
          data={sortedData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 50,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" label={{ value: 'Average Price ($)', position: 'insideBottom', offset: -10 }} />
          <YAxis
            dataKey="shopName"
            type="category"
            tick={{ fontSize: 8 }}
            label={{
              value: 'Coffee Shop', position: 'insideLeft', angle: -90, offset: -20,
            }}
          />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Bar dataKey="averagePrice" name="Average Price" fill="#a07fac" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CoffeePricesBarChart;
