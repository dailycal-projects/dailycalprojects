import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
  CartesianGrid,
} from 'recharts';
import {
  InputLabel, FormControl, Select, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import accessData from './externalAuditData';

const CustomizedAxisTick = ({ x, y, payload }) => {
  const textLines = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y})`}>
      {textLines.map((line, index) => (
        <text
          x={0}
          y={0}
          dy={16}
          fill="#666"
          transform="rotate(0)"
          width={75}
          textAnchor="middle"
        >
          <tspan x={0} dy={index ? '1.2em' : 0}>{line}</tspan>
        </text>
      ))}
    </g>
  );
};

function ExternalAuditBarChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 150,
    },
  }));

  const classes = useStyles();

  const [question, setQuestion] = useState({
    name: 'Age',
  });

  const [chartLayout, setChartLayout] = useState('vertical');

  useEffect(() => {
    const selectedQuestionData = accessData[question.name];
    if (selectedQuestionData.length > 7) {
      setChartLayout('horizontal');
    } else {
      setChartLayout('vertical');
    }
  }, [question]);

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
        {chartLayout === 'vertical' ? (
          <BarChart
            width={400}
            height={600}
            data={accessData[question.name]}
            margin={{
              top: -10,
              right: 5,
              left: 50,
              bottom: -10,
            }}
          >
            <XAxis
              dataKey="name"
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
            <CartesianGrid strokeDasharray="3 3" />
            <Legend />
            <Bar
              dataKey="Percent in Fall 2022"
              fill={accessData[question.name][0].color}
              activeBar={<Rectangle stroke="black" />}
            />
            <Bar
              dataKey="Percent in Spring 2023"
              fill={accessData[question.name][0].colorLight}
              activeBar={<Rectangle stroke="black" />}
            />
          </BarChart>
        ) : (
          <BarChart
            layout="vertical"
            width={600}
            height={400}
            data={accessData[question.name]}
            margin={{
              top: 5,
              right: 30,
              left: 100,
              bottom: 5,
            }}
          >
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip separator=": " />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar
              dataKey="Percent in Fall 2022"
              fill={accessData[question.name][0].color}
              activeBar={<Rectangle stroke="black" />}
            />
            <Bar
              dataKey="Percent in Spring 2023"
              fill={accessData[question.name][0].colorLight}
              activeBar={<Rectangle stroke="black" />}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default ExternalAuditBarChart;
