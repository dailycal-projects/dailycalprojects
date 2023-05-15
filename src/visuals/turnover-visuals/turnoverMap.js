import React from 'react';
import {
  MapContainer, Popup, CircleMarker, TileLayer, Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import turnoverCoordinates from './turnoverCoordinates';

const TurnoverMap = () => {
  const centerLat = (turnoverCoordinates.minLat + turnoverCoordinates.maxLat) / 2;
  const distanceLat = turnoverCoordinates.maxLat - turnoverCoordinates.minLat;
  const bufferLat = distanceLat * 0.05;
  const centerLong = (turnoverCoordinates.minLong + turnoverCoordinates.maxLong) / 2;
  const distanceLong = turnoverCoordinates.maxLong - turnoverCoordinates.minLong;
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
          zoom={15}
          minZoom={15}
          center={[centerLat, centerLong]}
          bounds={[
            [turnoverCoordinates.minLat - bufferLat, turnoverCoordinates.minLong - bufferLong],
            [turnoverCoordinates.maxLat + bufferLat, turnoverCoordinates.maxLong + bufferLong],
          ]}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

          {turnoverCoordinates.info.map((info) => (
            <CircleMarker
              key={info.coordinates[0].toString + info.coordinates[1].toString}
              center={[info.coordinates[0], info.coordinates[1]]}
              radius={6}
              color={[info.color]}
              fillOpacity={0.6}
            >
              <Tooltip opacity={1}>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {info.address}
                </div>
              </Tooltip>
              <Popup>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {info.name}
                  {' '}
                  {info.status}
                  {' around '}
                  {info.approximateDate}
                  <br />
                  <i>
                    {info.note}
                  </i>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      ) : <p> Map is loading... </p>}
    </div>
  );
};

export default TurnoverMap;
