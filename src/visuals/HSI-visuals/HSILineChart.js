import React, { Component } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import allData from './HSIData';

class CustomizedAxisTick extends Component {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={10} dy={0} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  }
}

const HSILineChart = () => (
  <div>
    <div
      className="App"
      style={{
        backgroundColor: '#e9edf0',
        padding: '20px',
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
          <p> Percent composition of Latine and Hispanic students across UC Berkeley and California K-12 public schools </p>
        </strong>
      </div>
      <ResponsiveContainer height={550}>
        <LineChart
          width={750}
          height={550}
          data={allData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={<CustomizedAxisTick />}
            height={45}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="California K-12 public schools" stroke="#489BD1" />
          <Line
            type="monotone"
            dataKey="Undergraduate"
            stroke="#8F679C"
          />
          <Line type="monotone" dataKey="Undergraduate and graduate" stroke="#E3565F" />
          <Line type="monotone" dataKey="Graduate" stroke="#95C361" />

        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default HSILineChart;
