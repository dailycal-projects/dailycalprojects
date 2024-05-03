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

function ExternalAuditBarChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      marginTop: -20,
      marginLeft: 10,
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

  const renderBlackLegendText = (value) => <span style={{ color: '#666666' }}>{value}</span>;

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
          <p>{`${question.name} of source`}</p>
        </strong>
      </div>
      <FormControl className={classes.formControl} style={{ paddingBottom: '-100px' }}>
        <InputLabel>Select question</InputLabel>
        <Select
          value={question.name}
          id="unitSelection"
          name="question"
          onChange={handleUnitChange}
          defaultValue="Primary role"
          autoWidth
        >
          <MenuItem value="Age">Age</MenuItem>
          <MenuItem value="Primary role">Primary role </MenuItem>
          <MenuItem value="Story category">Story category</MenuItem>
          <MenuItem value="Race and ethnicity">Race and ethnicity</MenuItem>
          <MenuItem value="Pronouns">Pronouns</MenuItem>
        </Select>
      </FormControl>

      <ResponsiveContainer height={500}>
        {chartLayout === 'vertical' ? (
          <BarChart
            data={accessData[question.name]}
            margin={{
              top: 0,
              right: 30,
              left: 30,
              bottom: -30,
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
            <Legend formatter={renderBlackLegendText} verticalAlign="top" />
            <Bar
              dataKey="Percent in fall 2022"
              fill={accessData[question.name][0].color}
              activeBar={<Rectangle stroke="black" />}
            />
            <Bar
              dataKey="Percent in spring 2023"
              fill={accessData[question.name][0].colorLight}
              activeBar={<Rectangle stroke="black" />}
            />
          </BarChart>
        ) : (
          <BarChart
            layout="vertical"
            data={accessData[question.name]}
            margin={{
              top: 0,
              right: 30,
              left: 30,
              bottom: 30,
            }}
          >
            <XAxis
              type="number"
              label={{
                value: 'Percent',
                angle: 0,
                position: 'bottom',
                minWidth: 100,
              }}

            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{
                style: {
                  fontSize: accessData[question.name].length > 9 ? '10px' : '16px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                },
              }}
            />
            <Tooltip separator=": " />
            <Legend formatter={renderBlackLegendText} verticalAlign="top" />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar
              dataKey="Percent in fall 2022"
              fill={accessData[question.name][0].color}
              activeBar={<Rectangle stroke="black" />}
            />
            <Bar
              dataKey="Percent in spring 2023"
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
