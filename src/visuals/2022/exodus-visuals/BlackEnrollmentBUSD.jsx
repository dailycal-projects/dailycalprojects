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
import berkACData from './berkACData';

const AlignedAxisLabel = ({
  axisType, x, y, width, height, stroke, children,
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

const BUSDBlackEnrollment = () => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        left: '0px',
      }}
    >
      <h4>

        Enrollment of Black students in Berkeley Unified School District

      </h4>
    </div>
    <ResponsiveContainer height={400}>
      <AreaChart
        width={750}
        height={400}
        data={berkACData}
        syncId="BUSDArea"
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <defs>
          <linearGradient
            id="colorEnrollBerkeley"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor="#9d3134" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#9d3134" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="year"
          angle={0}
          tick={{ fontSize: 16, transform: 'translate(0, 7)' }}
        >
          <Label value="Academic year" offset={-20} position="insideBottom" />
        </XAxis>
        <YAxis
          tick={{ fontSize: 16 }}
          label={(
            <AlignedAxisLabel
              x={13}
              y={180}
              width={0}
              height={0}
              axisType="yAxis"
            >
              Enrollment
            </AlignedAxisLabel>
              )}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="Berkeley"
          stroke="#9d3134"
          fill="url(#colorEnrollBerkeley)"
        />
      </AreaChart>
    </ResponsiveContainer>
    <br />
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        left: '0px',
      }}
    >
      <h4>
        {' '}
        Enrollment of Black students in Alameda County public schools
        {' '}
      </h4>
    </div>
    <br />
    <ResponsiveContainer height={400}>
      <AreaChart
        width={750}
        height={400}
        syncId="BUSDArea"
        data={berkACData}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <XAxis
          dataKey="year"
          angle={0}
          tick={{ fontSize: 16, transform: 'translate(0, 7)' }}
        >
          <Label value="Academic year" offset={-20} position="insideBottom" />
        </XAxis>
        <YAxis
          tick={{ fontSize: 16 }}
          label={(
            <AlignedAxisLabel
              x={13}
              y={180}
              width={0}
              height={0}
              axisType="yAxis"
            >
              Enrollment
            </AlignedAxisLabel>
              )}
        />
        <Tooltip />
        <defs>
          <linearGradient id="colorRentAlameda" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#565c7f" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#565c7f" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="Alameda County"
          stroke="#565c7f"
          fill="url(#colorRentAlameda)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default BUSDBlackEnrollment;
