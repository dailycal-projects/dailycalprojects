import React from 'react';
import {
  MapContainer,
  CircleMarker,
  TileLayer,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import classesMap from './classes_map';

const classMapViz = () => {
  // Compute bounding box
  const lats = classesMap.map((d) => d.center[0]);
  const lons = classesMap.map((d) => d.center[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  const bufferLat = (maxLat - minLat) * 0.1;
  const bufferLon = (maxLon - minLon) * 0.1;

  const containerStyle = {
    height: '600px',
    width: '100%',
    margin: '0',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  };

  return (
    <div>
      <h4 style={{ textAlign: 'center', margin: '16px 0' }}>
        Campus Classroom Occupancy by Time Block
      </h4>
      {typeof window !== 'undefined' ? (
        <MapContainer
          center={[centerLat, centerLon]}
          bounds={[
            [minLat - bufferLat, minLon - bufferLon],
            [maxLat + bufferLat, maxLon + bufferLon],
          ]}
          zoom={15}
          scrollWheelZoom={false}
          style={containerStyle}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

          {classesMap.map((loc, idx) => {
            // radius scaled by occupancy ratio
            const ratio = loc.Enrolled / loc.Capacity;
            const radius = 6 + ratio * 10;
            const color = ratio > 1 ? '#d14b49' : '#489bd1';

            return (
              <CircleMarker
                key={`${loc.center[0]}-${loc.center[1]}-${idx}`}
                center={loc.center}
                radius={radius}
                color={color}
                fillOpacity={0.6}
              >
                <Popup>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    <strong>{loc.Location}</strong>
                    <br />
                    {loc.address}
                    <br />
                    <em>
                      {loc.Day}
                      ,
                      {' '}
                      {loc.TimeBlock}
                    </em>
                    <br />
                    Enrolled:
                    {' '}
                    {loc.Enrolled}
                    {' '}
                    /
                    {' '}
                    {loc.Capacity}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default classMapViz;
