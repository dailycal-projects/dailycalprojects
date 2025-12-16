import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
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
  count: metrics.count,
  totalDeletion: Math.abs(metrics.total_deletion) / VOLUME_DIVISOR,
  totalAddition: metrics.total_addition / VOLUME_DIVISOR,
  net: metrics.net / VOLUME_DIVISOR,
  rawDeletion: metrics.total_deletion,
  rawAddition: metrics.total_addition,
  rawNet: metrics.net,
}));

const formatNumber = (value) => value.toLocaleString();

function EditsPerSchool() {
  const metricOptions = [
    {
      value: 'count',
      label: 'Total changes (Edits)',
      axisLabel: 'Total changes (Edits)',
      formatter: (val) => formatNumber(val),
    },
    {
      value: 'totalDeletion',
      label: 'Total deletions (Millions of Characters)',
      axisLabel: 'Deletions (Millions of Characters)',
      formatter: (val, payload) => `${formatNumber(payload.rawDeletion)} characters`,
    },
    {
      value: 'totalAddition',
      label: 'Total growth (Millions of Characters)',
      axisLabel: 'Growth (Millions of Characters)',
      formatter: (val, payload) => `${formatNumber(payload.rawAddition)} characters`,
    },
    {
      value: 'net',
      label: 'Net change (Millions of Characters)',
      axisLabel: 'Net change (Millions of Characters)',
      formatter: (val, payload) => `${formatNumber(payload.rawNet)} characters`,
    },
  ];

  const [selectedMetric, setSelectedMetric] = React.useState(metricOptions[0].value);

  const selectedConfig = metricOptions.find((opt) => opt.value === selectedMetric) ?? metricOptions[0];

  const orderedData = React.useMemo(
    () => {
      const sorted = [...chartData].sort((a, b) => {
        // For net, sort by absolute value to show largest changes first
        if (selectedMetric === 'net') {
          return Math.abs(b.net) - Math.abs(a.net);
        }
        // For other metrics, sort descending
        return b[selectedMetric] - a[selectedMetric];
      });
      return sorted;
    },
    [selectedMetric],
  );

  return (
    <div style={{ width: '100%', height: 520, marginBottom: '5rem' }}>
      {/* <h3 style={{ textAlign: 'center', marginBottom: 12 }}>Wikipedia edits by UC campus</h3> */}
      <FormControl
        variant="outlined"
        style={{
          minWidth: 200,
          marginBottom: 30,
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
              offset: -15,
            }}
          />
          <YAxis type="category" dataKey="label" width={110} />
          {selectedMetric === 'net' && <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3" />}
          <Tooltip
            formatter={(value, name, { payload }) => selectedConfig.formatter(value, payload)}
          />
          <Bar
            dataKey={selectedMetric}
            name={selectedConfig.label}
            fill="#8694c3"
          >
            {orderedData.map((entry, index) => {
              // Check if the displayed value is negative
              const value = entry[selectedMetric];
              const isNegative = value < 0;
              return (
                <Cell key={`cell-${index}`} fill={isNegative ? '#f4b400' : '#8694c3'} />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EditsPerSchool;
