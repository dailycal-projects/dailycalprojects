import '../App.css';
import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip,
} from 'recharts';
import { data } from '../data/conferences';

const options = ['Media Rights', 'NCAA/Conference Distributions'];

function ConferenceBarChart() {
  const [selectedOption, setSelectedOption] = useState('Media Rights');

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const filteredData = data.filter((item) => item.Category === selectedOption);

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Reported revenue for Cal Athletics from the Pac-12 and NCAA over time</h3>
      <div>
        <label htmlFor="category">
          Select a category:&nbsp;
          <select id="category" value={selectedOption} onChange={handleChange}>
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={filteredData}
            margin={{
              top: 20,
              right: 5,
              left: 5,
              bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Year" label={{ value: 'Year', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{
              value: 'Amount ($M in 2024)', angle: -90, position: 'insideLeft', textAlign: 'center', dy: 80,
            }}
            />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}M`} />
            <Bar dataKey="Amount ($M in 2024)" fill="#72577a" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ConferenceBarChart;
