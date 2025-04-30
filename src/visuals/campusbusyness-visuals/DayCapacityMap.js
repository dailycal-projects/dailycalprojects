// import React, { useState, useMemo } from 'react';
// import {
//   MapContainer,
//   TileLayer,
//   CircleMarker,
//   Popup,
// } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import classesMap from './classes_map';

// function DayCapacityMap() {
//   // derive unique days and hours
//   const days = useMemo(
//     () => Array.from(new Set(classesMap.map((d) => d.Day))),
//     [],
//   );
//   const hours = useMemo(
//     () => Array.from(
//       new Set(
//         classesMap.map((d) => d.TimeBlock.slice(0, 7)),
//       ),
//     ),
//     [],
//   );

//   const [day, setDay] = useState('Wednesday');
//   const [hour, setHour] = useState('10:00am');

//   // filter data
//   const filtered = useMemo(
//     () => classesMap.filter(
//       (d) => d.Day === day && d.TimeBlock.startsWith(hour),
//     ),
//     [day, hour],
//   );

//   // compute bounds
//   const lats = filtered.map((d) => d.lat);
//   const lons = filtered.map((d) => d.lon);
//   const minLat = Math.min(...lats);
//   const maxLat = Math.max(...lats);
//   const minLon = Math.min(...lons);
//   const maxLon = Math.max(...lons);
//   const bufferLat = (maxLat - minLat) * 0.1;
//   const bufferLon = (maxLon - minLon) * 0.1;
//   const center = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
//   const maxEnrolled = Math.max(...filtered.map((d) => d.Enrolled));

//   return (
//     <div>
//       <h4 style={{ textAlign: 'center', margin: '16px' }}>
//         Occupancy on
//         {' '}
//         {day}
//         {' '}
//         at
//         {' '}
//         {hour}
//       </h4>

//       <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
//         <label style={{ marginRight: '12px' }}>
//           Day:
//           <select
//             value={day}
//             onChange={(e) => setDay(e.target.value)}
//             style={{ marginLeft: '8px' }}
//           >
//             {days.map((d) => (
//               <option key={d} value={d}>{d}</option>
//             ))}
//           </select>
//         </label>
//         <label>
//           Hour:
//           <select
//             value={hour}
//             onChange={(e) => setHour(e.target.value)}
//             style={{ marginLeft: '8px' }}
//           >
//             {hours.map((h) => (
//               <option key={h} value={h}>{h}</option>
//             ))}
//           </select>
//         </label>
//       </div>

//       {filtered.length > 0 ? (
//         <MapContainer
//           style={{ height: '300px', width: '90%', margin: '0 auto' }}
//           bounds={[
//             [minLat - bufferLat, minLon - bufferLon],
//             [maxLat + bufferLat, maxLon + bufferLon],
//           ]}
//           scrollWheelZoom={false}
//         >
//           <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
//           {filtered.map((loc, i) => {
//             // const ratio = loc.Enrolled / loc.Capacity;
//             // const radius = 5 + ratio * 10;
//             // const color = ratio > 1 ? '#d14b49' : '#489bd1';
//             const radius = 5 + 20 * loc.Enrolled / maxEnrolled;
//             const color = '#5A82CC';
//             return (
//               <CircleMarker
//                 key={i}
//                 center={[loc.lat, loc.lon]}
//                 radius={radius}
//                 color={color}
//                 fillOpacity={0.6}
//                 stroke={false}
//               >
//                 <Tooltip>
//                   <div style={{ fontSize: '14px' }}>
//                     <strong>{loc.Location}</strong>
//                     <br />
//                     {loc.TimeBlock}
//                     <br />
//                     Enrolled:
//                     {' '}
//                     {loc.Enrolled}
//                     <br />
//                     Capacity:
//                     {' '}
//                     {loc.Capacity}
//                   </div>
//                 </Tooltip>
//               </CircleMarker>
//             );
//           })}
//         </MapContainer>
//       ) : (
//         <p style={{ textAlign: 'center' }}>No data for this selection</p>
//       )}
//     </div>
//   );
// }

// export default DayCapacityMap;

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
        <label style={{ marginRight: '24px' }}>
          Day:
          <select
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
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          Hour:
          <input
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
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

        {filtered.map((loc, i) => {
          const radius = 5 + (20 * loc.Enrolled) / maxEnrolled;
          const color = '#5A82CC';
          return (
            <CircleMarker
              key={i}
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
