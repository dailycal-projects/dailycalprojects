import React from 'react';
import {
  Map, CircleMarker, TileLayer, Tooltip,
} from 'react-leaflet';
import data from './coordinates';

const BurdenMap = () => {
  const centerLat = (data.minLat + data.maxLat) / 2;
  const distanceLat = data.maxLat - data.minLat;
  const bufferLat = distanceLat * 0.05;
  const centerLong = (data.minLong + data.maxLong) / 2;
  const distanceLong = data.maxLong - data.minLong;
  const bufferLong = distanceLong * 0.05;

  if (typeof window !== 'undefined') { // fixes the window error @cameron
    return (
      <div>
        <Map
          style={{ height: '480px', width: '100%' }}
          zoom={7}
          center={[centerLat, centerLong]}
          bounds={[
            [data.minLat - bufferLat, data.minLong - bufferLong],
            [data.maxLat + bufferLat, data.maxLong + bufferLong],
          ]}
        >
          <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {data.info.map((info, k) => (
            <CircleMarker
              key={k}
              center={[info.coordinates[0], info.coordinates[1]]}
              radius={7.5}
              color={[info.color]}
              fillOpacity={0.5}
              stroke={false}
            >
              <Tooltip direction="right" offset={[-8, -2]} opacity={1}>
                <p>{`${'Census tract' + ': '}${info.ct}`}</p>
                <p>{`${'ZIP code' + ': '}${info.ZIP}`}</p>
                <p>{`${'Housing burden percentile' + ': '}${info.hbp}`}</p>
              </Tooltip>
            </CircleMarker>
          ))}
        </Map>
      </div>
    );
  }
  return null;
};

export default BurdenMap;
