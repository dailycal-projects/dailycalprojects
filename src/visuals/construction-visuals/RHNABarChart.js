import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import RHNA from './data/RHNA_data.json';

import './RHNABarChart.css';

const isMobile = window.innerWidth < 1024;

const config = {
  width: isMobile ? window.innerWidth : (window.innerHeight * 5) / 8,
  height: isMobile ? window.innerWidth : (window.innerHeight * 5) / 8,
  margin: {
    top: 20,
    right: 20,
    left: 20,
    bottom: 50,
  },
};

const reverseTooltipContent = (o) => {
  const { payload } = o;

  return (
    <div className="customized-tooltip-content">
      <ul className="list">
        {payload.reverse().map((entry, index) => (
          <li key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function RHNABarChart() {
  return (
    <div>
      <div className="rhna-title-div">
        <h4>
          Berkeley Regional Housing Needs Allocation (RHNA) by Income Level
        </h4>
        <p>Affordable housing quotas for the 2015-2023 and 2023-2031 periods</p>
      </div>
      <BarChart
        label={<p>Regional Housing Needs Allocation (RHNA) Units</p>}
        width={config.width}
        height={config.height}
        data={RHNA}
        margin={config.margin}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time period" />
        <YAxis />
        <Tooltip content={reverseTooltipContent} />
        <Legend />
        <Bar dataKey="very low" stackId="a" fill="#DC5B3F" />
        <Bar dataKey="low" stackId="a" fill="#DC8D40" />
        <Bar dataKey="moderate" stackId="a" fill="#DCA640" />
        <Bar dataKey="above moderate" stackId="a" fill="#DBBF40" />
      </BarChart>
    </div>
  );
}
