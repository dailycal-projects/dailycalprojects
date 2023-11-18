import React from 'react';
import {
  MapContainer, Popup, CircleMarker, TileLayer, Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import studyAbroadData from './studyAbroadCoordinates';

const StudyAbroadMap = () => {
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
          maxZoom={6}
          zoom={2}
          center={[25, 0]}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

          {studyAbroadData.info.map((info) => (
            <CircleMarker
              key={info.coordinates[0].toString + info.coordinates[1].toString}
              center={[info.coordinates[0], info.coordinates[1]]}
              radius={info.radius}
              color="#8e669a"
              fillOpacity={0.6}
            >
              <Tooltip opacity={1}>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {info.country}
                </div>
              </Tooltip>
              <Popup>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {'Country: '}
                  {' '}
                  {info.country}
                  {' '}
                  <br />
                  {'Number of listings: '}
                  {' '}
                  {info.number}
                  {' '}
                  <br />
                  {'Semester(s): '}
                  {' '}
                  {info.semesters}
                  {' '}
                  <br />
                  {'Provider(s): '}
                  {' '}
                  {info.provider}
                  {' '}
                  <br />
                  {'Program listings: '}
                  {' '}
                  {info.programs}
                  {' '}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      ) : <p> Map is loading... </p>}
    </div>
  );
};

export default StudyAbroadMap;
