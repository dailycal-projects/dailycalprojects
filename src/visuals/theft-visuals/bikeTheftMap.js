import React, { Component } from 'react';
import {
  MapContainer, CircleMarker, TileLayer, Popup, // Map is outdated; Leaflet now uses MapContainer
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { bikeTheftMapData } from './buttonMapData';

function ButtonMap() {
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

  const [county, setCounty] = React.useState({
    name: 'Alameda',
  });

  const handleChange = (event) => {
    const { value } = event.target;
    setCounty({
      name: value,
    });
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
        <InputLabel>Select county</InputLabel>
        <Select
          value={county.name}
          id="regionSelector"
          name="region"
          onChange={handleChange}
          defaultValue="Alameda"
        >
          <MenuItem value="Alameda">Alameda</MenuItem>
          <MenuItem value="Contra Costa">Contra Costa</MenuItem>
          <MenuItem value="San Francisco">San Francisco</MenuItem>
        </Select>
      </FormControl>

      {(typeof window !== 'undefined') ? ( // must condition inside of a div in case content is null

        <MapContainer
          scrollWheelZoom={false}
          minZoom={7}
          style={containerStyle}
          zoom={7.5}
          center={[centerLat, centerLong]}
          bounds={[
            [minLat - bufferLat, minLong - bufferLong],
            [maxLat + bufferLat, maxLong + bufferLong],
          ]}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

          <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points={buttonMapData[county.name]}
            longitudeExtractor={(m) => m.center[1]}
            latitudeExtractor={(m) => m.center[0]}
            intensityExtractor={() => 1}
          />

          {buttonMapData[county.name].map((info, k) => (
            <CircleMarker
              key={k}
              center={[info.center[0], info.center[1]]}
              radius={8}
              color="#fab081"
              fillOpacity={0.6}
            >
              <Popup>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {'District: '}
                  {info.District}
                  <br />
                  {'County: '}
                  {info.County}

                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      ) : <p> Map is loading... </p>}
    </div>
  );
}

export default BikeTheftMap;