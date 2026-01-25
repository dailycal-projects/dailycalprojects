import React from 'react';
import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
// import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sex_spot_icon_2018, sex_spot_icon_2026 } from './icon';
import { sex_spots_2018, sex_spots_2026 } from './map_data';

const SexyMap = () => {
  const containerStyle = {
    height: '600px',
    margin: '0px 0px 10px 0px',
    borderRadius: '0 0 15px 15px',
    boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.25)',
  };

  return (
    <div>
        {(typeof window !== 'undefined') ? (
          <div style={{
            // border: '1px solid black'
          }}>
            <div style={{ 
                // border: '1px solid #000000',
                borderRadius: '15px 15px 0px 0px',
                padding: '10px',
                backgroundColor: '##d1d1d1',
                boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.15)'
              }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold' , marginBottom: '10px'}}>Legend</h4>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                {[2018, 2026].map(year => (
                  <div
                    key={year}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <img src={`/leaflet/icons/2-sexy-${year}-icon.png`} alt={`${year} Encounter`} style=
                    {{ 
                      width: '32px',
                      height: '32px',
                      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
                      margin: '0px',
                      }} />
                    <h4 style={{ margin: '0px' }}>{year} Encounter</h4>
                  </div>
                ))}
              </div>
            </div>
            <MapContainer center={[37.8716, -122.2585]} zoom={15.2} style={containerStyle} zoomSnap={0.1}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
              {sex_spots_2018.map((spot) => (
                <Marker key={spot.message} position={[spot.lat, spot.long]} icon={sex_spot_icon_2018} opacity={0.8} zIndexOffset={0}>
                  <Popup>
                    <p>{spot.message}</p>
                  </Popup>
                </Marker>
              ))}
              {sex_spots_2026.map((spot) => (
                <Marker key={spot.message} position={[spot.lat, spot.long]} icon={sex_spot_icon_2026} opacity={1} zIndexOffset={1000}>
                  <Popup>
                    <p>{spot.message}</p>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : <p> Map is loading... </p>}
    </div>
  );
};

export default SexyMap;