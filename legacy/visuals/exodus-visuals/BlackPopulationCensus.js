import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  ResponsiveContainer,
} from 'recharts';
import berkACBlackCensus from './berkACBlackCensus';

const AlignedAxisLabel = ({
  axisType,
  x,
  y,
  width,
  height,
  stroke,
  children,
}) => {
  const isVert = axisType === 'yAxis';
  const cx = isVert ? x : x + width / 2;
  const cy = isVert ? height / 2 + y : y + height + 10;
  const rot = isVert ? `270 ${cx} ${cy}` : 0;
  return (
    <text
      x={cx}
      y={cy}
      transform={`rotate(${rot})`}
      textAnchor="middle"
      stroke={stroke}
    >
      {children}
    </text>
  );
};

const BlackPopulationCensus = () => (
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
      <h4> Black population in Berkeley over time </h4>
    </div>
    <ResponsiveContainer height={400}>
      <AreaChart
        width={750}
        height={400}
        data={berkACBlackCensus}
        syncId="anyId"
        margin={{
          top: 15,
          right: 15,
          left: 30,
          bottom: 30,
        }}
      >
        <XAxis
          dataKey="year"
          angle={0}
          tick={{ fontSize: 16, transform: 'translate(0, 7)' }}
        >
          <Label value="Year" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis
          tick={{ fontSize: 16 }}
          label={(
            <AlignedAxisLabel
              x={14}
              y={180}
              width={0}
              height={0}
              axisType="yAxis"
            >
              Count
            </AlignedAxisLabel>
              )}
        />
        <Tooltip />
        <defs>
          <linearGradient id="colorRentAlameda" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7580a0" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#7580a0" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="Berkeley"
          stroke="#7580a0"
          fill="url(#colorRentAlameda)"
        />
      </AreaChart>
    </ResponsiveContainer>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        left: '20px',
      }}
    >
      <h4> Black population in Alameda County over time </h4>
    </div>
    <br />
    <ResponsiveContainer height={400}>
      <AreaChart
        width={750}
        height={400}
        data={berkACBlackCensus}
        syncId="anyId"
        margin={{
          top: 15,
          right: 15,
          left: 30,
          bottom: 30,
        }}
      >
        <XAxis
          dataKey="year"
          angle={0}
          tick={{ fontSize: 16, transform: 'translate(0, 7)' }}
        >
          <Label value="Year" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis
          tick={{ fontSize: 16 }}
          label={(
            <AlignedAxisLabel
              x={14}
              y={170}
              width={0}
              height={0}
              axisType="yAxis"
            >
              Count
            </AlignedAxisLabel>
              )}
        />
        <Tooltip />
        <defs>
          <linearGradient id="colorRentBerkeley" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f5a57e" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#f5a57e" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="Alameda County"
          stroke="#f5a57e"
          fill="url(#colorRentBerkeley)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default BlackPopulationCensus;
