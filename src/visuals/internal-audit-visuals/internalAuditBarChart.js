import React, { Component } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import accessData from './internalAuditData';

class CustomizedAxisTick extends Component {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={10}
          dy={0}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

function InternalAuditBarChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 150,
    },
  }));

  const classes = useStyles();

  const [question, setUnit] = React.useState({
    name: 'Editor',
  });

  const handleUnitChange = (event) => {
    const { value } = event.target;
    setUnit({
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
          <p>
            {`${question.name}`}
            {' '}
            at the Daily Cal
          </p>
        </strong>
      </div>
      <FormControl className={classes.formControl}>
        <InputLabel>Select question</InputLabel>
        <Select
          value={question.name}
          id="unitSelection"
          name="question"
          onChange={handleUnitChange}
          defaultValue="Academic student employees"
          autoWidth
        >
          <MenuItem value="Editor">Editor rate</MenuItem>
          <MenuItem value="Age">Age</MenuItem>
          <MenuItem value="Year">Year</MenuItem>
          <MenuItem value="Transfer rate">Transfer rate</MenuItem>
          <MenuItem value="International student rate">International student rate</MenuItem>
          <MenuItem value="Gender">Gender</MenuItem>
          <MenuItem value="LQBTQ+ rate">LQBTQ+ rate</MenuItem>
          <MenuItem value="Sexuality">Sexuality</MenuItem>
          <MenuItem value="Race and ethnicity">Race and ethnicity</MenuItem>
          <MenuItem value="Disability rate">Disability rate</MenuItem>
          <MenuItem value="Semesters">Semesters at the Daily Cal</MenuItem>
        </Select>
      </FormControl>

      <ResponsiveContainer height={600}>
        <BarChart
          width={400}
          height={600}
          data={accessData[question.name]}
          margin={{
            top: 5,
            right: 5,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" tick={<CustomizedAxisTick />} height={100} minTickGap={-10} />
          <YAxis unit="%" />
          <Tooltip separator=": " />
          <CartesianGrid strokeDasharray="3 3" />
          <Legend />
          <Bar dataKey="Percent" stackId="a" fill="#95c361" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default InternalAuditBarChart;
