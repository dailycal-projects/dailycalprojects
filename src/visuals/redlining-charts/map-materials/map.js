import React, { Component } from 'react';
import {
  MapContainer, CircleMarker, TileLayer, Tooltip, // Map is outdated; Leaflet now uses MapContainer
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { data } from './coordinates';

class MyMap extends Component {
  render() {
    const centerLat = (data.minLat + data.maxLat) / 2;
    const distanceLat = data.maxLat - data.minLat;
    const bufferLat = distanceLat * 0.05;
    const centerLong = (data.minLong + data.maxLong) / 2;
    const distanceLong = data.maxLong - data.minLong;
    const bufferLong = distanceLong * 0.05;

    if (typeof window !== 'undefined') { // fixes the window error @cameron
      return (
        <MapContainer
          style={{ height: '600px', width: '1000px' }}
          zoom={13.25}
          center={[centerLat, centerLong]}
          bounds={[
            [data.minLat - bufferLat, data.minLong - bufferLong],
            [data.maxLat + bufferLat, data.maxLong + bufferLong],
          ]}
        >
          <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {data.info.map((info, k) => (
            <CircleMarker
              key={k}
              center={[info.coordinates[0], info.coordinates[1]]}
              radius={7.5}
              color={[info.color]}
              fillOpacity={0.5}
              stroke={false}
            >
              <Tooltip direction="right" offset={[-8, -2]} opacity={1}>
                <p>{`${'Census tract' + ': '}${info.ct}`}</p>
                <p>{`${'ZIP code' + ': '}${info.ZIP}`}</p>
                <p>{`${'Housing burden percentile' + ': '}${info.hbp}`}</p>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      );
    }
    return null;
  }
}

export default MyMap;
