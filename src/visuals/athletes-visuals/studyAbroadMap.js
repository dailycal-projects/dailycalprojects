// import React from 'react';
// import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import californiaCounties from './california-counties.geojson';
// import data from './californiaCountiesData';

// const CaliforniaCountiesMap = () => {
//   const getColor = (count) => {
//     if (count > 50) return '#800026';
//     if (count > 30) return '#BD0026';
//     if (count > 20) return '#E31A1C';
//     if (count > 10) return '#FC4E2A';
//     if (count > 5) return '#FD8D3C';
//     if (count > 0) return '#FEB24C';
//     return '#FFEDA0';
//   };

//   const style = (feature) => {
//     const county = data.counties.find((c) => c.name === feature.properties.NAME);
//     return {
//       fillColor: getColor(county ? county.count : 0),
//       weight: 2,
//       opacity: 1,
//       color: 'white',
//       dashArray: '3',
//       fillOpacity: 0.7,
//     };
//   };

//   return (
//     <MapContainer center={[36.7783, -119.4179]} zoom={6} scrollWheelZoom={false} style={{ height: '600px', width: '100%' }}>
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <GeoJSON data={californiaCounties} style={style} />
//     </MapContainer>
//   );
// };

// export default CaliforniaCountiesMap;
