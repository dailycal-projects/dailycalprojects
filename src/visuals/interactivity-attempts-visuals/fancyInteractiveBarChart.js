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
import scores from './alamedaScoreData';
import schools from './alamedaSchoolsData';

function InteractiveBarChart() {
  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 120,
    },
  }));

  const classes = useStyles();

  const [district, setDistrict] = React.useState({
    name: 'Berkeley Unified',
  });

  const handleDistrictChange = (event) => {
    const { value } = event.target;
    setDistrict({
      name: value,
    });
    setSchool({
      name: 'All schools',
    });
  };

  const [school, setSchool] = React.useState({
    name: 'All schools',
  });

  const handleSchoolChange = (event) => {
    const { value } = event.target;
    setSchool({
      name: value,
    });
  };

  const districts = [

    'All districts',
    'Berkeley Unified',
    'Oakland Unified',
    'Alameda Unified',
    'Fremont Unified',

  ];

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
        <InputLabel>District</InputLabel>
        <Select
          value={district.name}
          id="regionSelector"
          name="region"
          onChange={handleDistrictChange}
          defaultValue="All districts"
          label="district"
        >

          {districts.map((item) => (

            <MenuItem value={item}>
              {item}
            </MenuItem>

          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl} sx={{ m: 3 }}>
        <InputLabel>School</InputLabel>
        <Select
          value={school.name}
          id="regionSelector1"
          name="region1"
          onChange={handleSchoolChange}
          defaultValue={schools[district.name][0]}
          label="school"
        >
          {schools[district.name].map((item) => (
            <MenuItem value={item}>
              {item}
            </MenuItem>

          ))}

        </Select>
      </FormControl>
      <br />
      <br />

      <ResponsiveContainer height={600}>
        <BarChart
          width={400}
          height={600}
          data={scores[`${district.name}, ${school.name}`]}
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
            fill="#e87876"
          />
        </BarChart>
      </ResponsiveContainer>

    </div>

  );
}

export default InteractiveBarChart;
