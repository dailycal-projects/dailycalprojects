import React from 'react';
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

const AxisLabel = ({
  axisType, x, y, width, height, stroke, children,
}) => {
  const isVert = axisType === 'yAxis';
  const cx = isVert ? x : x + (width / 2);
  const cy = isVert ? (height / 2) + y : y + height + 10;
  const rot = isVert ? `270 ${cx} ${cy}` : 0;
  return (
    <text x={cx} y={cy} transform={`rotate(${rot})`} textAnchor="middle" stroke={stroke}>
      {children}
    </text>
  );
};

const AlamedaShelterChart = () => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        left: '20px',
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
          right: 15,
          left: 30,
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
        <XAxis dataKey="year" tick={{ fontSize: 16, transform: 'translate(0, 7)' }}>
          <Label value="Year" offset={-24} position="insideBottom" />
        </XAxis>
        <YAxis tick={{ fontSize: 16 }} label={<AxisLabel x={20} y={160} width={0} height={0} axisType="yAxis">Point-in-Time count</AxisLabel>} />
        <Tooltip />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default AlamedaShelterChart;
