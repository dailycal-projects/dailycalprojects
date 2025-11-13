import React from 'react';
import {
  BarChart,
  Bar,
  Brush,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  // Legend,
  Area,
  Label,
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
} from 'recharts';

import {
  InputLabel, FormControl, Select, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { time_data } from './data';

import human_names from './human_names';

function EditsOverTime() {
  const [metric, setMetric] = React.useState('edit_volume');

  // List of campuses to show; get from human_names order
  const campusKeys = Object.keys(human_names);

  // Colors for each school (just a preset list, loop if not enough keys)
  const COLORS = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AB', '#5C5CA3',
  ];

  return (
    <div>
      <FormControl variant="outlined" style={{ minWidth: 200, marginBottom: 20 }}>
        <InputLabel id="metric-select-label">Metric</InputLabel>
        <Select
          labelId="metric-select-label"
          id="metric-select"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          label="Metric"
        >
          <MenuItem value="edit_volume">Edit Count</MenuItem>
          <MenuItem value="edit_count">Edit Volume (Millions of characters)</MenuItem>
          <MenuItem value="edit_volume_strict">Edit Volume (Strict) (Millions of characters)</MenuItem>
        </Select>
      </FormControl>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={time_data}
          margin={{ top: 30, right: 50, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="24 4" />
          <XAxis dataKey="year">
            <Label value="Year" position="insideBottom" offset={-5} />
          </XAxis>
          <YAxis
            tickFormatter={(val) =>
              metric === "edit_volume" ?
                // ? (val / 1_000_000 >= 1
                // : val.toLocaleString())
                val.toLocaleString()
                 : `${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}`
            }
          >
            {/* <Label
              value={metric === "edit_volume" ? "Edit Count" : "Edit Volume (Characters)"}
              angle={-90}
              position="insideLeft"
              offset={-5}
              style={{ textAnchor: 'middle' }}
            /> */}
          </YAxis>
          <Tooltip
            formatter={(value) => (metric === "edit_count" ? value.toLocaleString() + " characters" : value.toLocaleString() + " edits")}
            labelFormatter={label => `Year: ${label}`}
            opacity={0.5}
            itemSorter={(item) => -item.value}
          />
          {/* Area import and usage */}
          {campusKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={d => d[key]?.[metric] ?? 0}
              name={human_names[key]}
              stroke={COLORS[idx % COLORS.length]}
              fill={COLORS[idx % COLORS.length]}
              fillOpacity={0}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
        
      </ResponsiveContainer>
    </div>
  );
}

export default EditsOverTime;
