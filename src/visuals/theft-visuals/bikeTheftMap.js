import React, { Component } from 'react';
import {
  MapContainer, TileLayer, Popup, Marker, // Map is outdated; Leaflet now uses MapContainer
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import { bikeTheftMapData } from './bikeTheftMapData';
import { bikeTheftMapDataByYear } from './bikeTheftMapDataByYear';

import scooterIconPng from '../../images/electric_scooter.png'; // path to your local PNG file
import bikeIconPng from '../../images/bike.png';
// import scooterIconPng from '../../images/bike.png';

const bikeIcon = L.icon({
  iconUrl: bikeIconPng,
  iconSize: [30, 30], // set the size of the icon
});

const scooterIcon = L.icon({
  iconUrl: bikeIconPng, // change this
  iconSize: [30, 30], // set the size of the icon
});

const icons = {
  Bikes: bikeIcon,
  'E-Scooters': scooterIcon,
};

function createIcon(vehicleType, size) {
  let icon;
  if (vehicleType === 'E-Scooters') {
    icon = bikeIconPng; // change Later
  } else {
    icon = bikeIconPng;
  }

  return L.icon({
    iconUrl: icon,
    iconSize: [size * 2, size * 2], // set the size of the icon
  });
}

function MarkerClusterMap() {
  const minLat = 37.8503526;
  const maxLat = 37.899434;
  const minLong = -122.3256618;
  const maxLong = -122.2319033;
  const centerLat = (minLat + maxLat) / 2;
  const distanceLat = maxLat - minLat;
  const bufferLat = distanceLat * 0.05;
  const centerLong = (minLong + maxLong) / 2;
  const distanceLong = maxLong - minLong;
  const bufferLong = distanceLong * 0.05;

  const containerStyle = { // omit width for responsive map width
    height: '600px',
    margin: '30px 0px 30px 0px',
    borderRadius: '15px',
    boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.25)',
  };

  const useStyles = makeStyles(() => ({
    formControl: {
      margin: '1%',
      minWidth: 120,
    },
  }));

  const classes = useStyles();

  const [vehicleType, setVehicleType] = React.useState({
    name: 'Bikes',
  });

  const [year, setYear] = React.useState({
    name: 'all',
  });

  const handleVehicleChange = (event) => {
    const { value } = event.target;
    setVehicleType({
      name: value,
    });
  };

  const handleYearChange = (event) => {
    const { value } = event.target;
    setYear({
      name: value,
    });
    console.log(bikeTheftMapDataByYear[value][vehicleType.name]);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          left: '0px',
        }}
      >
        <h4>

          Change in enrollment of Black students between the 1990-91 and 2020-21 academic years

        </h4>
      </div>
      <FormControl className={classes.formControl}>
        <InputLabel>Select vehicle</InputLabel>
        <Select
          value={vehicleType.name}
          id="regionSelector"
          name="region"
          onChange={handleVehicleChange}
          defaultValue="E-Scooters"
        >
          <MenuItem value="E-Scooters">E-Scooters</MenuItem>
          <MenuItem value="Bikes">Bikes</MenuItem>
          <MenuItem value="E-Bikes">E-Bikes</MenuItem>
        </Select>
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel>Select year</InputLabel>
        <Select
          value={year.name}
          id="regionSelector"
          name="region"
          onChange={handleYearChange}
          defaultValue="all"
        >
          <MenuItem value="2019">2019</MenuItem>
          <MenuItem value="2020">2020</MenuItem>
          <MenuItem value="2021">2021</MenuItem>
          <MenuItem value="2022">2022</MenuItem>
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="all">all</MenuItem>
        </Select>
      </FormControl>

      {(typeof window !== 'undefined') ? ( // must condition inside of a div in case content is null

        <MapContainer
          scrollWheelZoom={false}
          minZoom={7}
          style={containerStyle}
          zoom={14}
          center={[centerLat, centerLong]}
          bounds={[
            [minLat - bufferLat, minLong - bufferLong],
            [maxLat + bufferLat, maxLong + bufferLong],
          ]}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

          <MarkerClusterGroup>
            {bikeTheftMapDataByYear[year.name][vehicleType.name].filter((info, k) => info.count !== 1).map((info, k) => (
              <Marker
                position={[info.center[0], info.center[1]]}
                key={k}
                icon={createIcon(vehicleType.name, 15)}
              >
                <Popup>{info.Location}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          <MarkerClusterGroup singleMarkerMode>
            {bikeTheftMapDataByYear[year.name][vehicleType.name].filter((info, k) => info.count === 1).map((info, k) => (
              <Marker
                position={[info.center[0], info.center[1]]}
                key={k}
                icon={createIcon(vehicleType.name, 15)}
              >
                <Popup>{info.Location}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

        </MapContainer>

      ) : <p> Map is loading... </p>}
    </div>

  );
}

export default MarkerClusterMap;
