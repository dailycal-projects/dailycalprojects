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
import { InputLabel, FormControl, Select, MenuItem } from '@mui/material';
import humanNames from './human_names';
import { perSchool as perSchoolTotals } from './data';

const VOLUME_DIVISOR = 1_000_000;

// const COLORS = [
//   '#4E79A7',
//   '#F28E2B',
//   '#E15759',
//   '#76B7B2',
//   '#59A14F',
//   '#EDC948',
//   '#B07AA1',
//   '#FF9DA7',
//   '#9C755F',
//   '#BAB0AB',
//   '#5C5CA3',
// ];

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
      dropDownLabel: 'Total changes (edits)',
      label: 'Total changes',
      title: 'Edits made by campus',
      axisLabel: 'Number of changes (edits)',
      formatter: (val) => formatNumber(val),
    },
    /*
    {
      value: 'totalDeletion',
      dropDownLabel: 'Total deletions (millions of characters)',
      label: 'Total deletions',
      title: 'Number of characters deleted by campus',
      axisLabel: 'Total deletions (millions of characters)',
      formatter: (val, payload) => `${formatNumber(payload.rawDeletion)} characters`,
    },
    {
      value: 'totalAddition',
      dropDownLabel: 'Total growth (millions of characters)',
      label: 'Total growth',
      title: 'Number of characters added by campus',
      axisLabel: 'Total growth (millions of characters)',
      formatter: (val, payload) => `${formatNumber(payload.rawAddition)} characters`,
    },
    */
    {
      value: 'net',
      dropDownLabel: 'Net change (millions of characters)',
      label: 'Net change',
      title: 'Net change made by campus',
      axisLabel: 'Net change (millions of characters)',
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
      <FormControl
        variant="outlined"
        style={{
          minWidth: 200,
          marginBottom: 30,
          fontFamily: 'Georgia',
          fontSize: '17px',
        }}
      >
        <InputLabel id="metric-select-label">Select metric</InputLabel>
        <Select
          labelId="metric-select-label"
          id="metric-select"
          value={selectedMetric}
          onChange={(event) => setSelectedMetric(event.target.value)}
          label="Select metric"
        >
          {metricOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.dropDownLabel}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <h3 style={{
        textAlign: 'center', marginBottom: '10px', fontFamily: 'Georgia', fontSize: '17px',
      }}
      >
        {selectedMetric === 'net'
          ? 'Net change made to Wikipedia articles by campus'
          : 'Total number of edits made to Wikipedia articles by campus'}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={orderedData}
          margin={{
            top: 10,
            right: 50,
            left: 10,
            bottom: 50,
          }}
        >

          <CartesianGrid strokeDasharray="24 4" />
          <XAxis
            tickFormatter={(val) => (val.toLocaleString())}
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
                // eslint-disable-next-line react/no-array-index-key
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
