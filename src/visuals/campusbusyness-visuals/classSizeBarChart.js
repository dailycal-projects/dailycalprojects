import React from 'react';
import {
  XAxis, YAxis, ResponsiveContainer, Legend, CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts';
import class_sizes from './class_sizes';

// console.log('class_sizes:', class_sizes);

function classSizeBarChart() {
  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Mean Class Size by Department</h3>
      <div style={{ display: 'block', marginTop: 'auto' }}>
        <ResponsiveContainer height={400} width="100%">
          <BarChart
            data={class_sizes}
            layout="vertical"
            margin={{
              top: 5, right: 100, left: -50, bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{ value: 'Mean Class Size', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              dataKey="Department"
              type="category"
              width={250} // more room on the left
              interval={0} // force every single tick to appear
              tick={{ fontSize: 10 }} // shrink the type
              tickLine={false} // hide the little tick marks if you want
            />
            <Tooltip formatter={(value) => `${value.toFixed(1)}`} />
            <Bar dataKey="Enrolled" name="Enrolled" fill="#5A82CC" fillOpacity={0.75} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default classSizeBarChart;
