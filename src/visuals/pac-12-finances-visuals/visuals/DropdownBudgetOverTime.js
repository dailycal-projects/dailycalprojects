import '../App.css';
import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { data } from '../data/net_budget';

const sports = ['Football', "Men's Basketball", "Women's Basketball", "Other Men's Sports", "Other Women's Sports", 'Non-Program Specific', 'Total'];

function DropdownBudgetOverTime() {
  const [selectedSport, setSelectedSport] = useState('Football');

  const handleChange = (event) => {
    setSelectedSport(event.target.value);
  };

  const filteredData = data.filter((item) => item.Sport === selectedSport);

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Net revenue by sport over time</h3>
      <div>
        <label htmlFor="sport">
          Select a sport:&nbsp;
          <select id="sport" value={selectedSport} onChange={handleChange}>
            {sports.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={filteredData}
            margin={{
              top: 20,
              right: 0,
              left: 0,
              bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Year" label={{ value: 'Year', position: 'insideBottom', offset: -20 }} />
            <YAxis label={{
              value: 'Net revenue ($M in 2024)', angle: -90, position: 'insideLeft', textAlign: 'center', dy: 80,
            }}
            />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}M`} />
            <Bar dataKey="Net ($M in 2024)" fill="#72577a" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DropdownBudgetOverTime;
