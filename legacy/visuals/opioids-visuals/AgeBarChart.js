import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  InputLabel, FormControl, Select, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import accessData from './lineData';

function OpioidsLineChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      marginTop: -20,
      marginLeft: 10,
      minWidth: 150,
    },
  }));

  const classes = useStyles();

  const [question, setQuestion] = useState('CalvAlameda');

  useEffect(() => {
    // Any additional logic based on question change can be placed here
  }, [question]);

  const handleUnitChange = (event) => {
    const { value } = event.target;
    setQuestion(value);
  };

  const renderBlackLegendText = (value) => (
    <span style={{ color: '#666666' }}>{value}</span>
  );

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
        <h4>
          Post-pandemic, fentanyl death rates in Alameda County are rising
          faster than the California average
        </h4>
      </div>
      <FormControl className={classes.formControl}>
        <InputLabel>Select View</InputLabel>
        <Select
          value={question}
          id="unitSelection"
          name="question"
          onChange={handleUnitChange}
          autoWidth
        >
          <MenuItem value="CalvAlameda">California vs. Alameda</MenuItem>
          <MenuItem value="agerates">Age group rates</MenuItem>
        </Select>
      </FormControl>
      <ResponsiveContainer height={400}>
        <LineChart
          data={accessData[question]}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Year" />
          <YAxis />
          <Tooltip separator=": " />
          <Legend formatter={renderBlackLegendText} verticalAlign="top" />

          {/* Conditionally render lines based on the selected 'question' */}
          {question === 'CalvAlameda' && (
            <>
              <Line type="monotone" dataKey="California" stroke="#fba93d" />
              <Line type="monotone" dataKey="Alameda" stroke="#3d5c70" />
            </>
          )}
          {question === 'agerates' && (
            <>
              <Line type="monotone" dataKey="15 to 19" stroke="#fed039" />
              <Line type="monotone" dataKey="20 to 24" stroke="#9ec949" />
              <Line type="monotone" dataKey="25 to 29" stroke="#4ab66e" />
              <Line type="monotone" dataKey="30 to 39" stroke="#009a87" />
              <Line type="monotone" dataKey="40 to 49" stroke="#487a9b" />
              <Line type="monotone" dataKey="50 to 64" stroke="#3d5c70" />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OpioidsLineChart;
