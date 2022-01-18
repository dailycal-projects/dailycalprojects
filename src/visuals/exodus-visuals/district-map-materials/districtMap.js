import React, { Component } from 'react';
import {
  MapContainer, CircleMarker, TileLayer, Tooltip, Popup, Polygon, // Map is outdated; Leaflet now uses MapContainer
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { districtData } from './districtData';

class MyMap extends Component {
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
            style={containerStyle}
            zoom={13}
            center={[centerLat, centerLong]}
            bounds={[
              [districtData.minLat - bufferLat, districtData.minLong - bufferLong],
              [districtData.maxLat + bufferLat, districtData.maxLong + bufferLong],
            ]}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />

            {districtData.info.map((info, k) => (
            //   <CircleMarker
            //     key={k}
            //     center={[info.coordinates[0], info.coordinates[1]]}
            //     radius={10}
            //     color={[info.color]}
            //     fillOpacity={0.6}
            //   >

              //     <Tooltip opacity={1}>
              //       <div style={{ fontWeight: 500, fontSize: '16px' }}>
              //         Click me!
              //       </div>
              //     </Tooltip>

              //     <Popup>
              //       <div style={{ fontWeight: 500, fontSize: '16px' }}>
              //         {'ZIP code: '}
              //         {info.ZIP}
              //         <br />
              //         {'Census tract: '}
              //         {info.ct}
              //         <br />
              //         <div style={{ color: info.color }}>
              //           {'Housing burden percentile: '}
              //           {info.hbp}
              //         </div>
              //       </div>
              //     </Popup>
              //   </CircleMarker>
              <Polygon pathOptions={{ color: info.colorcode }} positions={info.geometry} key={k}>
                <Tooltip sticky>sticky Tooltip for Polygon</Tooltip>
              </Polygon>

            ))}
          </MapContainer>
        ) : <p> Map is loading... </p>}
      </div>
    );
  }
}

export default MyMap;
