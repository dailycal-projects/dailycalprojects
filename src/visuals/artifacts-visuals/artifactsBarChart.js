import React from 'react';
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import allData from './artifactsData';

function ArtifactsBarChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 120,
    },
  }));

  const classes = useStyles();

  const [UC, setUC] = React.useState({
    campus: 'UC Berkeley',
  });

  const handleChange = (event) => {
    const { value } = event.target;
    setUC({
      campus: value,
    });
  };

  return (
    <div
      className="App"
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
          padding: '30px',
        }}
      >
        <strong>
          <p> Number of cultural objects and human remains held by five UC campuses separated by origin </p>
        </strong>
      </div>
      <FormControl className={classes.formControl}>
        <InputLabel>Select campus</InputLabel>
        <Select
          value={UC.campus}
          id="regionSelector"
          name="region"
          onChange={handleChange}
          defaultValue="UC Berkeley"
        >
          <MenuItem value="UC Berkeley">UC Berkeley</MenuItem>
          <MenuItem value="UCLA">Fowler Museum at UCLA</MenuItem>
          <MenuItem value="UC Davis">UC Davis Department of Anthropology Museum</MenuItem>
          <MenuItem value="UC Santa Barbara">UC Santa Barbara department of anthropology</MenuItem>
          <MenuItem value="UC Riverside">UC Riverside</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <ResponsiveContainer height={600}>
        <BarChart
          width={400}
          height={600}
          data={allData.filter((x) => x.campus === UC.campus)}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="origin" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="Number of human remains and cultural objects"
            fill="#f0876a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ArtifactsBarChart;
