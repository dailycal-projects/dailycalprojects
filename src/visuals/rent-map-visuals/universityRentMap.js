import React from 'react';
import {
  MapContainer, TileLayer, Tooltip, Polygon,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './universityRentMapCSS.css';
import data from './universityRentData';

const MyMap = () => {
  const centerLat = 37.869436;
  const distanceLat = data.maxLat - data.minLat;
  const bufferLat = distanceLat * 0.05;
  const centerLong = -122.257589;
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

      <div>
        {(typeof window !== 'undefined') ? (
          <MapContainer
            scrollWheelZoom={false}
            zoomControl={false}
            dragging={false}
            style={containerStyle}
            zoom={14}
            maxZoom={14}
            minZoom={14}
            center={[centerLat, centerLong]}
            bounds={[
              [data.minLat - bufferLat, data.minLong - bufferLong],
              [data.maxLat + bufferLat, data.maxLong + bufferLong],
            ]}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" opacity={0.35} />

            {data.info.map((info) => (

              <Polygon opacity={1} positions={info.coordinates} color={[info.color]}>
                <Tooltip>
                  <font size="+1">
                    {' '}
                    Census tract:
                    {' '}
                    {info.tract}
                    {' '}
                    <br />
                    Median rent: $
                    {info.rent}
                  </font>
                </Tooltip>
              </Polygon>
            ))}
          </MapContainer>
        ) : <p> Map is loading... </p>}
      </div>
      <div id="gradient" />
    </div>
  );
};

export default MyMap;
