import React from 'react';
import {
  MapContainer, Popup, CircleMarker, TileLayer, Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import data from './guideCoordinates';

const MyMap = () => {
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

  return (
    <div>
      {(typeof window !== 'undefined') ? (
        <MapContainer
          scrollWheelZoom={false}
          style={containerStyle}
          zoom={13}
          center={[centerLat - 0.017, centerLong + 0.005]}
          bounds={[
            [data.minLat - bufferLat, data.minLong - bufferLong],
            [data.maxLat + bufferLat, data.maxLong + bufferLong],
          ]}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

          {data.info.map((info) => (
            <CircleMarker
              key={info.coordinates[0].toString + info.coordinates[1].toString}
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
                  {'Type of place: '}
                  {' '}
                  {info.type}
                  {' '}
                  <br />
                  {'Name: '}
                  {' '}
                  <a href={info.link} target="_blank" rel="noreferrer">{info.name}</a>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      ) : <p> Map is loading... </p>}
    </div>
  );
};

export default MyMap;
