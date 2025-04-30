import React, { useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import classesMap from './classes_map';

function DayCapacityMap() {
  // derive unique days and hours
  const days = useMemo(
    () => Array.from(new Set(classesMap.map((d) => d.Day))),
    [],
  );
  const hours = useMemo(
    () => Array.from(
      new Set(
        classesMap.map((d) => d.TimeBlock.slice(0, 7)),
      ),
    ),
    [],
  );

  const [day, setDay] = useState('Wednesday');
  const [hour, setHour] = useState('10:00am');

  // filter data
  const filtered = useMemo(
    () => classesMap.filter(
      (d) => d.Day === day && d.TimeBlock.startsWith(hour),
    ),
    [day, hour],
  );

  // compute bounds
  const lats = filtered.map((d) => d.lat);
  const lons = filtered.map((d) => d.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const bufferLat = (maxLat - minLat) * 0.1;
  const bufferLon = (maxLon - minLon) * 0.1;
  const center = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
  const maxEnrolled = Math.max(...filtered.map((d) => d.Enrolled));

  return (
    <div>
      <h4 style={{ textAlign: 'center', margin: '16px' }}>
        Occupancy on
        {' '}
        {day}
        {' '}
        at
        {' '}
        {hour}
      </h4>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <label style={{ marginRight: '12px' }}>
          Day:
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            style={{ marginLeft: '8px' }}
          >
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Hour:
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            style={{ marginLeft: '8px' }}
          >
            {hours.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length > 0 ? (
        <MapContainer
          style={{ height: '300px', width: '90%', margin: '0 auto' }}
          bounds={[
            [minLat - bufferLat, minLon - bufferLon],
            [maxLat + bufferLat, maxLon + bufferLon],
          ]}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
          {filtered.map((loc, i) => {
            // const ratio = loc.Enrolled / loc.Capacity;
            // const radius = 5 + ratio * 10;
            // const color = ratio > 1 ? '#d14b49' : '#489bd1';
            const radius = 5 + 20 * loc.Enrolled / maxEnrolled;
            const color = '#5A82CC';
            return (
              <CircleMarker
                key={i}
                center={[loc.lat, loc.lon]}
                radius={radius}
                color={color}
                fillOpacity={0.6}
                stroke={false}
              >
                <Tooltip>
                  <div style={{ fontSize: '14px' }}>
                    <strong>{loc.Location}</strong>
                    <br />
                    {loc.TimeBlock}
                    <br />
                    Enrolled:
                    {' '}
                    {loc.Enrolled}
                    <br />
                    Capacity:
                    {' '}
                    {loc.Capacity}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      ) : (
        <p style={{ textAlign: 'center' }}>No data for this selection</p>
      )}
    </div>
  );
}

export default DayCapacityMap;
