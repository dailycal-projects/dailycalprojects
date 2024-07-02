import { useEffect } from 'react';
import { useLeaflet } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-choropleth'; // Make sure this is installed and imported correctly
import data from './data.json';

const style = {
  fillColor: '#F28F3B',
  weight: 2,
  opacity: 1,
  color: 'white',
  dashArray: '3',
  fillOpacity: 0.5,
};

export default function Choropleth() {
  const { map } = useLeaflet();

  useEffect(() => {
    // Assuming data.json is structured as expected
    const geojsonData = data;

    L.choropleth(geojsonData, {
      valueProperty: 'incidents', // Property in the features to use
      scale: ['white', 'red'], // Chroma.js scale
      steps: 5, // Number of breaks or steps in range
      mode: 'q', // Quantile mode
      style,
      onEachFeature(feature, layer) {
        layer.bindPopup(
          `District ${
            feature.properties.dist_num
          }<br>${
            feature.properties.incidents.toLocaleString()
          } incidents`,
        );
      },
    }).addTo(map);

    return () => {
      // Clean up
      map.removeLayer(geojsonData);
    };
  }, [map]);

  return null; // Since this is a Leaflet integration component
}
