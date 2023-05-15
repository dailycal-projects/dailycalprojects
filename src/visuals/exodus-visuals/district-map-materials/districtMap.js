import React from 'react';
import {
  MapContainer, CircleMarker, TileLayer, Popup, // Map is outdated; Leaflet now uses MapContainer
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import districtData from './districtData';

const MyMap = () => {
  const centerLat = (districtData.minLat + districtData.maxLat) / 2;
  const distanceLat = districtData.maxLat - districtData.minLat;
  const bufferLat = distanceLat * 0.05;
  const centerLong = (districtData.minLong + districtData.maxLong) / 2;
  const distanceLong = districtData.maxLong - districtData.minLong;
  const bufferLong = distanceLong * 0.05;

  const containerStyle = { // omit width for responsive map width
    height: '600px',
    margin: '30px 0px 30px 0px',
    borderRadius: '15px',
    boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.25)',
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          left: '0px',
        }}
      >
        <h4>

          Change in enrollment of Black students between the 1990-91 and 2020-21 academic years

        </h4>
      </div>
      {(typeof window !== 'undefined') ? ( // must condition inside of a div in case content is null

        <MapContainer
          scrollWheelZoom={false}
          minZoom={7}
          style={containerStyle}
          zoom={7.5}
          center={[centerLat, centerLong]}
          bounds={[
            [districtData.minLat - bufferLat, districtData.minLong - bufferLong],
            [districtData.maxLat + bufferLat, districtData.maxLong + bufferLong],
          ]}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

          {districtData.info.map((info) => (
            <CircleMarker
              key={info.center[0].toString + info.center[1].toString}
              center={[info.center[0], info.center[1]]}
              radius={info.size}
              color={info.color}
              fillOpacity={0.6}
            >
              <Popup>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {'District: '}
                  {info.District}
                  <br />
                  {'County: '}
                  {info.County}
                  <br />
                  {'Enrollment in 1990-1991: '}
                  {info.BEnr9091}
                  <br />
                  {'Enrollment in 2020-2021: '}
                  {info.BEnr2021}
                  <br />
                  {'Composition in 1990-1991: '}
                  {Math.round(info.BEnr9091Perc * 1000) / 10}
                  %
                  <br />
                  {'Composition in 2020-2021: '}
                  {Math.round(info.BEnr2021Perc * 1000) / 10}
                  %
                  <br />
                  {'Difference in percent composition: '}
                  {info.diff}
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
