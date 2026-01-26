import React from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
} from 'react-leaflet';
// import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import zIndex from '@material-ui/core/styles/zIndex';
// import { sex_spot_icon_2018, sex_spot_icon_2026 } from './icon';
import { sex_spots_2018, sex_spots_2026 } from './map_data';

function createSexSpotIcon(year) {
  if (typeof window === 'undefined') return null;

  if (year === 2018) {
    return L.icon({
      iconUrl: '/leaflet/icons/2-sexy-2018-icon.png',
      iconSize: [16, 16],
    });
  }
  if (year === 2026) {
    return L.icon({
      iconUrl: '/leaflet/icons/2-sexy-2026-icon.png',
      shadowUrl: '/leaflet/icons/2-sexy-2026-shadow.png',
      shadowSize: [32, 32],
      iconSize: [32, 32],
    });
  }
  return null;
}

const SexyMap = () => {
  const containerStyle = {
    height: '600px',
    margin: '0px',
    borderTop: '2px solid gray',
    borderBottom: '2px solid gray',
    // borderRadius: '0 0 15px 15px',
    // boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.25)',
  };

  return (
    <div>
      {(typeof window !== 'undefined') ? (
        <div style={{
          border: '2px solid gray',
          boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.15)',
          borderRadius: '10px',
        }}
        >
          <div style={{
            // border: '20pxpx solid #000000',
            borderRadius: '15px 15px 0px 0px',
            padding: '10px',
            backgroundColor: '##d1d1d1',
            zIndex: 100,
          }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>Legend</h4>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              {[2018, 2026].map((year) => (
                <div
                  key={year}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <img
                    src={`/leaflet/icons/2-sexy-${year}-icon.png`}
                    alt={`${year} Encounter`}
                    style={{
                      width: '32px',
                      height: '32px',
                      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
                      margin: '0px',
                    }}
                  />
                  <h4 style={{ margin: '0px' }}>
                    {year}
                    {' '}
                    Encounter
                  </h4>
                </div>
              ))}
            </div>
          </div>
          <MapContainer center={[37.8716, -122.2585]} zoom={15.2} style={containerStyle} zoomSnap={0.1}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
            {sex_spots_2018.map((spot) => (
              <Marker key={spot.message} position={[spot.lat, spot.long]} icon={createSexSpotIcon(2018)} opacity={0.8} zIndexOffset={0}>
                <Popup>
                  <p>{spot.message}</p>
                </Popup>
              </Marker>
            ))}
            {sex_spots_2026.map((spot) => (
              <Marker key={spot.message} position={[spot.lat, spot.long]} icon={createSexSpotIcon(2026)} opacity={1} zIndexOffset={1000}>
                <Popup>
                  <p>{spot.message}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div style={{

            borderRadius: '0px 0px 15px 15px',
            backgroundColor: '##d1d1d1',
            padding: '10px',
            display: 'flex',

            alignItems: 'center',
            // boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.15)',
          }}
          >
            <div style={{ width: '50%' }}>
              <h3 style={{
                margin: '0px',
                fontWeight: 'bold',
              }}
              >
                Tell us about a sexual encounter you've had on Berkeley's campus.
              </h3>
            </div>
            <div style={{
              width: '50%',
            }}
            >
              <form style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0px',
              }}
              >
                <input
                  type="button"
                  value="ADD A PIN"
                  style={{
                    fontFamily: 'sans-serif',
                    fontWeight: 'lighter',
                    border: 'none',
                    backgroundColor: 'black',
                    color: 'white',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    scale: '1.5',
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      ) : <p> Map is loading... </p>}
    </div>
  );
};

export default SexyMap;
