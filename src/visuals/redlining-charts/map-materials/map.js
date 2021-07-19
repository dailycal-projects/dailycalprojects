import React, { Component } from 'react';
import {
  MapContainer, CircleMarker, TileLayer, Tooltip, Popup, // Map is outdated; Leaflet now uses MapContainer
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

    const containerStyle = { // omit width for responsive map width
      height: '600px',
      margin: '30px 0px 30px 0px',
      borderRadius: '15px',
      boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.25)',
    };

    if (typeof window !== 'undefined') { // fixes the window error @cameron
      return (
        <MapContainer
          scrollWheelZoom={false}
          style={containerStyle}
          zoom={13}
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
              radius={10}
              color={[info.color]}
              fillOpacity={0.6}
            >
              <Tooltip opacity={1}>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  Click me!
                </div>
              </Tooltip>
              <Popup>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {'ZIP code: '}
                  {info.ZIP}
                  <br />
                  <div style={{ color: info.color }}>
                    {'Housing burden percentile: '}
                    {info.hbp}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      );
    }
    return null;
  }
}

export default MyMap;
