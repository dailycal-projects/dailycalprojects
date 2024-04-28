import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from 'recharts';
import {
  InputLabel, FormControl, Select, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import accessData from './externalAuditData';

const CustomizedAxisTick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={16}
      fill="#666"
      transform="rotate(0)"
      width={75}
      textAnchor="middle"
    >
      {payload.value}
    </text>
  </g>
);

function ExternalAuditBarChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 150,
    },
  }));

  const classes = useStyles();

  const [question, setQuestion] = React.useState({
    name: 'Age',
  });

  const handleUnitChange = (event) => {
    const { value } = event.target;
    setQuestion({
      name: value,
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#e9edf0',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '10px',
        }}
      >
        <strong>
          <p>{`${question.name}`}</p>
        </strong>
      </div>
      <FormControl className={classes.formControl}>
        <InputLabel>Select question</InputLabel>
        <Select
          value={question.name}
          id="unitSelection"
          name="question"
          onChange={handleUnitChange}
          defaultValue="Age"
          autoWidth
        >
          <MenuItem value="Age">Age</MenuItem>
          <MenuItem value="Primary role">Primary role </MenuItem>
          <MenuItem value="Story category">Story category</MenuItem>
          <MenuItem value="Race and ethnicity">Race and ethnicity</MenuItem>
          <MenuItem value="Pronouns">Pronouns</MenuItem>
        </Select>
      </FormControl>

      <ResponsiveContainer height={600}>
        <BarChart
          width={400}
          height={600}
          data={accessData[question.name]}
          margin={{
            top: -10,
            right: 5,
            left: 10,
            bottom: -10,
          }}
        >
          <XAxis
            dataKey="name"
            tick={<CustomizedAxisTick />}
            height={100}
            minTickGap={-10}
          />
          <YAxis
            label={{
              value: 'Percent',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip separator=": " />
          <Legend />
          <Bar
            dataKey="PercentFa"
            fill={accessData[question.name][0].color}
            activeBar={<Rectangle stroke="black" />}
          />
          <Bar
            dataKey="PercentSp"
            fill={accessData[question.name][0].colorLight}
            activeBar={<Rectangle stroke="black" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExternalAuditBarChart;
