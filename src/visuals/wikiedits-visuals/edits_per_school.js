import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@material-ui/core';
import humanNames from './human_names';
import { per_school as perSchoolTotals } from './data';

const VOLUME_DIVISOR = 1_000_000;

const chartData = Object.entries(perSchoolTotals).map(([campus, metrics]) => ({
  campus,
  label: humanNames[campus] ?? campus,
  totalEdits: metrics.count,
  volumeMillions: metrics.size / VOLUME_DIVISOR,
  rawVolume: metrics.size,
}));

const formatNumber = (value) => value.toLocaleString();

function EditsPerSchool() {
  const metricOptions = [
    {
      value: 'totalEdits',
      label: 'Total edits',
      axisLabel: 'Total edits',
      formatter: (val) => formatNumber(val),
    },
    {
      value: 'volumeMillions',
      label: 'Edit volume (Millions of Characters)',
      axisLabel: 'Volume (Millions of Characters)',
      formatter: (val, payload) => `${formatNumber(payload.rawVolume)} characters`,
    },
  ];

  const [selectedMetric, setSelectedMetric] = React.useState(metricOptions[0].value);

  const selectedConfig = metricOptions.find((opt) => opt.value === selectedMetric) ?? metricOptions[0];

  const orderedData = React.useMemo(
    () => [...chartData].sort((a, b) => b[selectedMetric] - a[selectedMetric]),
    [selectedMetric],
  );

  return (
    <div style={{ width: '100%', height: 520 }}>
      {/* <h3 style={{ textAlign: 'center', marginBottom: 12 }}>Wikipedia edits by UC campus</h3> */}
      <FormControl
        variant="outlined"
        style={{
          minWidth: 200,
          marginBottom: 20,
        }}
      >
        <InputLabel id="metric-select-label">Select Metric</InputLabel>
        <Select
          labelId="metric-select-label"
          id="metric-select"
          value={selectedMetric}
          onChange={(event) => setSelectedMetric(event.target.value)}
          label="Select Metric"
        >
          {metricOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={orderedData}
          margin={{
            top: 10,
            right: 50,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="24 4" />
          <XAxis
            type="number"
            label={{
              value: selectedConfig.axisLabel,
              position: 'insideBottom',
              offset: 0,
            }}
          />
          <YAxis type="category" dataKey="label" width={110} />
          <Tooltip
            formatter={(value, name, { payload }) => selectedConfig.formatter(value, payload)}
          />
          <Bar
            dataKey={selectedMetric}
            name={selectedConfig.label}
            fill="#8694c3"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EditsPerSchool;
