import React, { PureComponent } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from 'recharts';
import { lunchData } from './rentShelterData';

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      x, y, payload, beginUnit, endUnit, y1 = 0,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={y1} dy={0} textAnchor="end" fill="#666" transform="rotate(-45)">
          {beginUnit}
          {payload.value}
          {endUnit}
        </text>
      </g>
    );
  }
}

const LunchChart = () => (
  <div>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      // left: '20px',
      // right: '20px',
      top: '20px',
    }}
    >
      <h4> Percent of students in free and reduced-price meals program </h4>
    </div>
    <ResponsiveContainer height={620}>
      <LineChart
        width={750}
        height={620}
        data={lunchData}
        margin={{
          top: 20,
          bottom: 70,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="School year" tick={<CustomizedAxisTick y1={10} />}>
          <Label value="School year" offset={-60} position="insideBottom" />
        </XAxis>
        <YAxis width={45} tick={<CustomizedAxisTick endUnit="%" />} />
        <Tooltip />
        <Legend
          align="center"
          verticalAlign="bottom"
          layout="horizontal"
          wrapperStyle={{ position: 'relative', marginTop: '30px' }}
        />
        <Line
          type="monotone"
          dataKey="County-wide percent of students"
          stroke="#487A9B"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="BUSD percent of students"
          stroke="#F28147"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default LunchChart;
