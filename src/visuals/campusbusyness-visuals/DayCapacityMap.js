import React, { useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
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
      new Set(classesMap.map((d) => d.TimeBlock.slice(0, 7))),
    ),
    [],
  );

  // state for selected day and hour index
  const [day, setDay] = useState('Wednesday');
  const [hourIndex, setHourIndex] = useState(
    Math.max(0, hours.indexOf('10:00am')),
  );
  const hour = hours[hourIndex] || hours[0];

  // filter data for the current selection
  const filtered = useMemo(
    () => classesMap.filter(
      (d) => d.Day === day && d.TimeBlock.startsWith(hour),
    ),
    [day, hour],
  );

  // compute global center (static) for map
  const allLats = classesMap.map((d) => d.lat);
  const allLons = classesMap.map((d) => d.lon);
  const minLatAll = Math.min(...allLats);
  const maxLatAll = Math.max(...allLats);
  const minLonAll = Math.min(...allLons);
  const maxLonAll = Math.max(...allLons);
  const globalCenter = [
    (minLatAll + maxLatAll) / 2,
    (minLonAll + maxLonAll) / 2,
  ];
  const defaultZoom = 15;

  // calculate maximum enrolled for radius scaling
  const maxEnrolled = 2500;

  return (
    <div>
      <h3 style={{ textAlign: 'center', margin: '16px' }}>
        {/* Occupancy on&nbsp;
        {day}
&nbsp;at&nbsp;
        {hour} */}
        Enrollment in halls by day and hour
      </h3>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '8px 0',
        }}
      >
        <label htmlFor="day-select" style={{ marginRight: '24px' }}>
          Day:
          <select
            id="day-select" // Add an id
            value={day}
            onChange={(e) => setDay(e.target.value)}
            style={{ marginLeft: '8px' }}
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label
          htmlFor="hour-range" // Add htmlFor
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          Hour:
          <input
            id="hour-range" // Add an id
            type="range"
            min={0}
            max={hours.length - 1}
            step={1}
            value={hourIndex}
            onChange={(e) => setHourIndex(Number(e.target.value))}
            style={{ width: '400px', margin: '4px 0' }}
          />
          <small>{hour}</small>
        </label>
      </div>

      {/* Always render map with static zoom and center; show markers if any */}
      <MapContainer
        center={globalCenter}
        zoom={defaultZoom}
        style={{ height: '400px', width: '100%', margin: '0 auto' }}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

        {filtered.map((loc) => {
          const radius = 5 + (20 * loc.Enrolled) / maxEnrolled;
          const color = '#5A82CC';
          return (
            <CircleMarker
              key={loc.Location} // Use a unique property like 'Location' as the key
              center={[loc.lat, loc.lon]}
              radius={radius}
              pathOptions={{ color, fillOpacity: 0.6 }}
              stroke={false}
            >
              <Tooltip direction="top" offset={[0, -radius]} opacity={1}>
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
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default DayCapacityMap;
