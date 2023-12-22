import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Text,
} from 'recharts';
import RHNA from './data/RHNA_data.json';

import './RHNABarChart.css';

const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

const getPercent = (value, total) => {
  const ratio = total > 0 ? value / total : 0;

  return toPercent(ratio, 2);
};

const reverseTooltipContent = (o) => {
  const { payload, label } = o;

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

const renderTooltipContent = (o) => {
  const { payload, label } = o;
  const total = payload.reduce((result, entry) => result + entry.value, 0); // calculate total

  return (
    <div className="customized-tooltip-content">

      <ul className="list">
        {payload.reverse().map((entry, index) => (
          <li key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value} (${getPercent(entry.value, total)})`}
          </li>
        ))}
        <li className="total">{`${label} (Total: ${total})`}</li>
      </ul>

    </div>
  );
};

export default function RHNABarChart() {
  const [windowWidth, setWindowWidth] = useState(1025);

  // updates window width on page load/resize
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    // Initial update
    updateWindowWidth();

    // Event listener for window resize
    window.addEventListener('resize', updateWindowWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  // const isMobile = window.innerWidth < 1024;
  const isMobile = (typeof window !== 'undefined') ? windowWidth < 1024 : false;

  const config = {
    width: isMobile ? window.innerWidth : window.innerHeight * 5 / 8,
    height: isMobile ? window.innerWidth : window.innerHeight * 5 / 8,
    margin: {
      top: 20,
      right: 20,
      left: 20,
      bottom: 50,
    },
  };

  // y-label
  const CustomizedLabelY = () => (
    <Text
      x={config.margin.left}
      y={config.height / 2}
      textAnchor="middle"
      angle={-90}
    >
      # of Projects Funded by Source
    </Text>
  );

  return (
    <div>
      <div className="rhna-title-div">
        <h4>
          Berkeley Regional Housing Needs Allocation (RHNA) by Income Level
        </h4>
        <p>Affordable housing quotas for the 2015-2023 and 2023-2031 periods</p>
      </div>
      <BarChart
        label={<p>"Regional Housing Needs Allocation (RHNA) Units"</p>}
        width={config.width}
        height={config.height}
        data={RHNA}
        margin={config.margin}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time period" />
        <YAxis label={CustomizedLabelY} />
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
