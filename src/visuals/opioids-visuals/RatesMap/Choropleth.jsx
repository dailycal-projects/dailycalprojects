import React, { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet-choropleth';
import L from 'leaflet';

import data from './alameda_data.json';

const style = {
  fillColor: '#F28F3B',
  weight: 2,
  opacity: 1,
  color: 'white',
  dashArray: '3',
  fillOpacity: 0.5,
};

const Choropleth = () => {
  useEffect(() => {
    const geojsonData = data;

    const map = L.map('map').setView([37.65, -121.9], 9.5); // Alameda County

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.choropleth(geojsonData, {
      valueProperty: 'RATE',
      scale: ['white', 'red'],
      steps: 5,
      mode: 'q',
      style,
      onEachFeature(feature, layer) {
        layer.bindPopup(`<b>Zip code:</b> ${feature.properties.ZIP}<br/><b>Age-adjusted rate:</b> ${feature.properties.RATE}`);
      },
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h4>

        Fentanyl death rates in Alameda County by zip code

      </h4>
      {' '}
      <div id="map" style={{ width: '100%', height: '450px' }} />
      {' '}
    </div>
  );
};

export default Choropleth;