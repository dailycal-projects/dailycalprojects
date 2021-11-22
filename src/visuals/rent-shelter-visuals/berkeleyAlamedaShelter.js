import React, { Component } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Label,
  Tooltip,

} from 'recharts';
import { rentShelterData, berkeleyShelterData } from './rentShelterData';

class ShelterChart extends Component {
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
          <h4>
            {' '}
            Point-in-Time counts of houseless population in Alameda County
            {' '}
          </h4>
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
              <stop offset="5%" stopColor="#95C361" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#95C361" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="Alameda Homeless Population"
            stroke="#95C361"
            fill="url(#colorPv)"
          />
          <XAxis dataKey="year" tick={{ fontSize: 17 }}>
            <Label value="Year" offset={-15} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label
              value="Point-in-Time count"
              offset={15}
              position="left"
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
          <h4> Point-in-Time counts of houseless population in Berkeley </h4>
        </div>

        <AreaChart
          width={750}
          height={400}
          data={berkeleyShelterData}
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

          <XAxis dataKey="year" tick={{ fontSize: 17 }}>
            <Label value="Year" offset={-15} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label
              value="Point-in-Time count"
              offset={15}
              position="left"
              angle={-90}
            />
          </YAxis>
          <Tooltip />

          <Area
            type="monotone"
            dataKey="Berkeley Total Count"
            stroke="#fba93d"
            fill="url(#colorUv)"
          />
          <Area
            type="monotone"
            dataKey="Berkeley Unsheltered Count"
            stroke="#95c361"
            fill="url(#colorUSh)"
          />
          <Area
            type="monotone"
            dataKey="Berkeley Sheltered Count"
            stroke="#a07fac"
            fill="url(#colorSh)"
          />
        </AreaChart>
      </div>
    );
  }
}

export default ShelterChart;
