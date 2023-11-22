import React, { PureComponent } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  ResponsiveContainer,

} from 'recharts';
import { berkeleyShelterData } from './rentShelterData';

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text fontFamily={16} x={0} y={0} dy={0} textAnchor="end" fill="#666" transform="rotate(-45)">

          {payload.value}
        </text>
      </g>
    );
  }
}

const BerkeleyShelterChart = () => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <h4> Point-in-Time counts of homeless population in Berkeley </h4>
    </div>

    <ResponsiveContainer height={450}>
      <AreaChart
        width={750}
        height={400}
        data={berkeleyShelterData}
        margin={{
          top: 15,
          bottom: 80,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fba93d" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#fcc988" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="colorUSh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#95c361" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#abcd80" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="colorSh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a07fac" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#b399bc" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <XAxis dataKey="year" tick={{ fontSize: 16, transform: 'translate(0, 10)' }}>
          <Label value="Year" offset={-24} position="insideBottom" />
        </XAxis>
        <YAxis
          width={50}
          tick={<CustomizedAxisTick />}
        />
        <Tooltip />

        <Area
          type="monotone"
          dataKey="Berkeley total count"
          stroke="#fba93d"
          fill="url(#colorUv)"
        />
        <Area
          type="monotone"
          dataKey="Berkeley unsheltered count"
          stroke="#95c361"
          fill="url(#colorUSh)"
        />
        <Area
          type="monotone"
          dataKey="Berkeley sheltered count"
          stroke="#a07fac"
          fill="url(#colorSh)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default BerkeleyShelterChart;
