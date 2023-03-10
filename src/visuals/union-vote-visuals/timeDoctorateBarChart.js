import React, { Component } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import doctorateData from './timeDoctorateData';

class CustomizedAxisTick extends Component {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={10}
          dy={0}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

const TimeDoctorateBarChart = () => (

  <div
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
        padding: '10px',
      }}
    >
      <strong>
        <p>
          Average number of years to complete doctoral degree by campus
        </p>
      </strong>
    </div>

    <ResponsiveContainer height={600}>
      <BarChart
        width={400}
        height={600}
        data={doctorateData}
        margin={{
          top: 5,
          right: 5,
          left: 0,
          bottom: 5,
        }}
      >
        <XAxis dataKey="campus" tick={<CustomizedAxisTick />} height={100} minTickGap={-10} />
        <YAxis domain={[0, 7]} />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Legend />
        <Bar dataKey="Average number of years" fill="#a07fac" />
      </BarChart>
    </ResponsiveContainer>
  </div>

);

export default TimeDoctorateBarChart;
