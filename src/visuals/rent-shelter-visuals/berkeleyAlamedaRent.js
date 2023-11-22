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
        <text x={0} y={0} dy={0} textAnchor="end" fill="#666" transform="rotate(-45)">
          $
          {payload.value}
        </text>
      </g>
    );
  }
}

const RentChart = () => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <h4> Gross median rent in Berkeley by year </h4>
    </div>
    <ResponsiveContainer height={450}>
      <AreaChart
        width={750}
        height={400}
        data={rentShelterData}
        syncId="anyI"
        margin={{
          top: 15,
          bottom: 80,
        }}
      >
        <defs>
          <linearGradient id="colorRentBerkeley" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#487A9B" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#487A9B" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <XAxis dataKey="year" tick={{ fontSize: 16, transform: 'translate(0, 10)' }}>
          <Label value="Year" offset={-24} position="insideBottom" />
        </XAxis
        >
        <YAxis
          tick={<CustomizedAxisTick />}
        />
        <Tooltip separator=": $" />
        <Area
          type="monotone"
          dataKey="Berkeley median rent"
          fill="url(#colorRentBerkeley)"
          stroke="#487A9B"
        />
      </AreaChart>
    </ResponsiveContainer>

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <h4> Gross median rent in Alameda County by year </h4>
    </div>
    <div>
      <ResponsiveContainer height={400}>
        <AreaChart
          width={750}
          height={400}
          data={rentShelterData}
          syncId="anyI"
          margin={{
            top: 15,
            bottom: 30,
          }}
        >
          <defs>
            <linearGradient id="colorRentAlameda" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b399bc" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#b399bc" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="Alameda County median rent"
            stroke="#b399bc"
            fill="url(#colorRentAlameda)"
          />
          <XAxis dataKey="year" tick={{ fontSize: 16, transform: 'translate(0, 10)' }}>
            <Label value="Year" offset={-24} position="insideBottom" />
          </XAxis>
          <YAxis
            tick={<CustomizedAxisTick />}
          />
          <Tooltip separator=": $" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default RentChart;
