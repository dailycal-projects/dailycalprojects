import React, { Component } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Label,
  Tooltip,

} from 'recharts';
import { rentShelterData } from './rentShelterData';

class RentChart extends Component {
  render() {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h4> Gross median rent in Alameda County by year </h4>
        </div>
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
              <stop offset="5%" stopColor="#b399bc" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#b399bc" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="Alameda County Median Rent"
            stroke="#b399bc"
            fill="url(#colorPv)"
          />
          <XAxis dataKey="year">
            <Label value="Year" offset={-15} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label
              value="Gross Median Rent ($)"
              offset={-15}
              position="insideLeft"
              angle={-90}
            />
          </YAxis>
          <Tooltip />
        </AreaChart>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h4> Gross median rent in Berkeley by year </h4>
        </div>

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
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#487A9B" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#489BD1" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <XAxis dataKey="year">
            <Label value="Year" offset={-15} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label
              value="Gross Median Rent ($)"
              offset={-15}
              position="insideLeft"
              angle={-90}
            />
          </YAxis>
          <Tooltip />

          <Area
            type="monotone"
            dataKey="Berkeley Median Rent"
            stroke="#489BD1"
            fill="url(#colorUv)"
          />
        </AreaChart>
      </div>
    );
  }
}

export default RentChart;