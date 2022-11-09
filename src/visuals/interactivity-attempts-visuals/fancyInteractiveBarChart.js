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
import data from './fancyInteractiveData';

function InteractiveBarChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 120,
    },
  }));

  const classes = useStyles();

  const [origin, setOrigin] = React.useState({
    place: 'Moe',
  });

  const handleOriginChange = (event) => {
    const { value } = event.target;
    setOrigin({
      place: value,
    });
  };

  const [destination, setDestination] = React.useState({
    place: 'Mezzo',
  });

  const handleDestinationChange = (event) => {
    const { value } = event.target;
    setDestination({
      place: value,
    });
  };

  const [day, setDay] = React.useState({
    name: 'Monday',
  });

  const handleDayChange = (event) => {
    const { value } = event.target;
    setDay({
      name: value,
    });
  };

  return (
    <div
      className="App"
      style={{
        backgroundColor: '#e9edf0',
        paddingTop: '10px',
        paddingLeft: '5px',
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
        <strong>
          <p> Choice chart </p>
        </strong>
      </div>
      <FormControl className={classes.formControl} sx={{ m: 3 }}>
        <InputLabel>Origin</InputLabel>
        <Select
          value={origin.place}
          id="regionSelector"
          name="region"
          onChange={handleOriginChange}
          defaultValue="Morrison"
          label="origin"
        >
          <MenuItem value="Moe">Moe&apos;s</MenuItem>
          <MenuItem value="Mezzo">Mezzo</MenuItem>
          <MenuItem value="Morrison">Morrison&apos;s</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.formControl} sx={{ m: 3 }}>
        <InputLabel>Destination</InputLabel>
        <Select
          value={destination.place}
          id="regionSelector1"
          name="region1"
          onChange={handleDestinationChange}
          defaultValue="Morrison"
          label="destination"
        >
          <MenuItem value="Moe">Moe&apos;s</MenuItem>
          <MenuItem value="Mezzo">Mezzo</MenuItem>
          <MenuItem value="Morrison">Morrison&apos;s</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.formControl} sx={{ m: 3 }}>
        <InputLabel>Day of week</InputLabel>
        <Select
          value={day.name}
          id="regionSelector2"
          name="region2"
          onChange={handleDayChange}
          defaultValue="Monday"
          label="day"
        >
          <MenuItem value="Monday">Monday</MenuItem>
          <MenuItem value="Tuesday">Tuesday</MenuItem>
          <MenuItem value="Wednesday">Wednesday</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />

      {

        (origin.place !== destination.place) ? (

          <ResponsiveContainer height={600}>
            <BarChart
              width={400}
              height={600}
              data={data[`${origin.place} to ${destination.place} on ${day.name}`][0]}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="grade"
                fill={data[`${origin.place} to ${destination.place} on ${day.name}`][1]}
              />
            </BarChart>
          </ResponsiveContainer>

        ) : <p> The selected origin and destination are the same. Try a new selection.  </p>
    }

    </div>
  );
}

export default InteractiveBarChart;
