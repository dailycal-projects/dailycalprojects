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
import { rentShelterData } from './rentShelterData';

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text fontSize={16} x={0} y={0} dy={0} textAnchor="end" fill="#666" transform="rotate(-45)">

          {payload.value}
        </text>
      </g>
    );
  }
}

const AlamedaShelterChart = () => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >

      <h4>
        {' '}
        Point-in-Time counts of homeless population in Alameda County
        {' '}
      </h4>
    </div>
    <ResponsiveContainer height={400}>
      <AreaChart
        width={750}
        height={400}
        data={rentShelterData}
        syncId="anyId"
        margin={{
          top: 15,
          bottom: 30,
        }}
      >
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#95C361" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#95C361" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="Alameda County homeless population"
          stroke="#95C361"
          fill="url(#colorPv)"
        />
        <XAxis dataKey="year" tick={{ fontSize: 16, transform: 'translate(0, 10)' }}>
          <Label value="Year" offset={-24} position="insideBottom" />
        </XAxis>
        <YAxis
          width={50}
          tick={<CustomizedAxisTick />}
        />
        <Tooltip />
        <Tooltip />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default AlamedaShelterChart;
