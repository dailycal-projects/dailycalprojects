import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from 'recharts';
import STEMEnrollmentData from './STEMLineData';

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

const STEMEnrollmentLine = () => (
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
      <h4> The 10 largest major programs over time </h4>
    </div>
    <ResponsiveContainer height={550}>
      <LineChart
        width={750}
        height={550}
        data={STEMEnrollmentData}
        margin={{
          top: 5,
          right: 30,
          left: 30,
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis
          tick={{ fontSize: 16 }}
          label={(
            <AlignedAxisLabel
              x={30}
              y={250}
              width={0}
              height={0}
              axisType="yAxis"
            >
              Undergraduate students enrolled
            </AlignedAxisLabel>
            )}
        />
        <Tooltip
          itemSorter={(item) => -item.value}
        />
        <Line
          type="monotone"
          dataKey="COMPSCI"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="EECS"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="MECENG"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="CHEMENG"
          stroke="#B5CFEA"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="MCELLBI"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="DATA"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="INTEGBI"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="COGSCI"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="POLSCI"
          stroke="#FED23B"
          fill="#FED23B"
        />
        <Line
          type="monotone"
          dataKey="ECON"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="PSYCH"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="UGBA"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="ENGLISH"
          stroke="#FED23B"
          fill="#FED23B"
        />
        <Line
          type="monotone"
          dataKey="SOCIOL"
          stroke="#FED23B"
          fill="#FED23B"
        />
        <Line
          type="monotone"
          dataKey="ARCH"
          stroke="#FED23B"
          fill="#FED23B"
        />
        <Line
          type="monotone"
          dataKey="MEDIAST"
          stroke="#FED23B"
          fill="#FED23B"
        />
        <Line
          type="monotone"
          dataKey="MATH"
          stroke="#489BD1"
          fill="#489BD1"
        />
        <Line
          type="monotone"
          dataKey="CHMENG"
          stroke="#489BD1"
          fill="#489BD1"
        />

      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default STEMEnrollmentLine;
