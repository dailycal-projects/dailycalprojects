import React from 'react';
import {
  InputLabel, FormControl, Select, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  BarChart,
  Bar,
  Brush,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  // Legend,
  Label,
  ResponsiveContainer,
} from 'recharts';
import data from './data';

function WarnmeHistogram() {
  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 120,
    },
  }));

  const classes = useStyles();

  const [Sem, setSem] = React.useState({
    semester: 'All semesters', // Changed the key to lowercase "semester"
  });

  const handleChange = (event) => {
    const { value } = event.target;
    setSem({
      semester: value,
    });
  };

  return (
    <div
      className="App"
      style={{
        backgroundColor: '#e9edf0',
        padding: '30px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          left: '20px',
        }}
      >
        <h4> Discrepancy between time of incident report and time of WarnMe email </h4>
      </div>
      <FormControl className={classes.formControl}>
        <InputLabel>Select semester</InputLabel>
        <Select
          value={Sem.semester}
          id="regionSelector"
          name="region"
          onChange={handleChange}
          defaultValue="All semesters"
          autowidth
        >
          <MenuItem value="All semesters">All semesters</MenuItem>
          <MenuItem value="Fall 2021">Fall 2021</MenuItem>
          <MenuItem value="Spring 2022">Spring 2022</MenuItem>
          <MenuItem value="Fall 2022">Fall 2022</MenuItem>
          <MenuItem value="Spring 2023">Spring 2023</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <ResponsiveContainer height={600}>
        <BarChart
          width={400}
          height={600}
          data={data.filter((x) => x.semester === Sem.semester)}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 40,
          }}
        >
          <YAxis
            label={{
              value: 'Number of emails sent',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip
            content={({ payload }) => {
              if (payload && payload.length) {
                const {
                  bin,
                  'Number of emails sent': count,
                } = payload[0].payload;
                let semesterCount = '98';
                if (Sem.semester !== 'All semesters') {
                  if (Sem.semester === 'Fall 2021') {
                    semesterCount = '32';
                  }
                  if (Sem.semester === 'Spring 2022') {
                    semesterCount = '18';
                  }
                  if (Sem.semester === 'Fall 2022') {
                    semesterCount = '24';
                  }
                  if (Sem.semester === 'Spring 2023') {
                    semesterCount = '24';
                  }
                }

                return (
                  <div className="custom-tooltip">
                    <p>
                      Within
                      {' '}
                      {bin - 25}
                      {' '}
                      and
                      {' '}
                      {bin}
                      {' '}
                      minutes,
                      {' '}
                      {count}
                      /
                      {semesterCount}
                      {' '}
                      emails were sent.
                    </p>
                  </div>
                );
              }
              return null;
            }}
            wrapperStyle={{
              border: '1px solid white',
              background: 'white',
              padding: '8px',
              width: 'fit-content',
            }}
          />
          <Brush dataKey="bin" height={30} stroke="#8593c3" />

          <Bar dataKey="Number of emails sent" fill="#8593c3" />
          <XAxis dataKey="bin">
            <Label
              value="Minutes since incident reported"
              offset={-60}
              position="insideBottom"
            />
          </XAxis>
          <ReferenceLine
            x="50"
            stroke="grey"
            label={(
              <Label
                value="Around 1 hour"
                angle={-90}
                position="insideTop"
                offset={70}
                style={{ fill: 'grey' }}
                dx={-15}
              />
            )}
          />
          <ReferenceLine
            x="300"
            stroke="grey"
            label={(
              <Label
                value="5 hours"
                angle={-90}
                position="insideTop"
                offset={70}
                style={{ fill: 'grey' }}
                dx={-15}
              />
            )}
          />
          <ReferenceLine
            x="600"
            stroke="grey"
            label={(
              <Label
                value="10 hours"
                angle={-90}
                position="insideTop"
                offset={70}
                style={{ fill: 'grey' }}
                dx={-15}
              />
            )}
          />
          <ReferenceLine
            x="900"
            stroke="grey"
            label={(
              <Label
                value="15 hours"
                angle={-90}
                position="insideTop"
                offset={70}
                style={{ fill: 'grey' }}
                dx={-15}
              />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WarnmeHistogram;
