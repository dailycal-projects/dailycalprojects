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
      <label htmlFor="sport">Select Category: </label>
      <select id="sport" value={selectedSport} onChange={handleChange}>
        {sports.map((sport) => (
          <option key={sport} value={sport}>{sport}</option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={filteredData}
          margin={{
            top: 5,
            right: 30,
            left: 50,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Year" label={{ value: 'Year', position: 'insideBottom', offset: -20 }} />
          <YAxis label={{
            value: 'Net Budget ($M in 2024)', angle: -90, position: 'insideLeft', textAlign: 'center', dy: 80,
          }}
          />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}M`} />
          <Bar dataKey="Net ($M in 2024)" fill="#72577a" fillOpacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DropdownBudgetOverTime;
