import React, { Component } from 'react';
import {
  MapContainer, CircleMarker, TileLayer, Popup, // Map is outdated; Leaflet now uses MapContainer
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { rackLocations } from './rackLocations';

class RackMap extends Component {
  render() {
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

            {districtData.locations.map((info, k) => (
              <CircleMarker
                key={k}
                center={[locations.center[0], locations.center[1]]}
                radius={locations.size}
                color={locations.color}
                fillOpacity={0.6}
              >
                <Popup>
                  <div style={{ fontWeight: 500, fontSize: '16px' }}>
                    {'Location: '}
                    {locations.location}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        ) : <p> Map is loading... </p>}
      </div>
    );
  }
}

export default RackMap;