import React, { useEffect, useState } from 'react';
import {
  MapContainer, TileLayer, useMap, CircleMarker, Tooltip,
} from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faStarHalf as solidStarHalf } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import coffeeData from './coffeeData';

const latitudes = coffeeData.info.map((shop) => shop.center[0]);
const longitudes = coffeeData.info.map((shop) => shop.center[1]);
const averageLatitude = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
const averageLongitude = longitudes.reduce((sum, lon) => sum + lon, 0) / longitudes.length;

const minPrice = Infinity;
const maxPrice = -Infinity;

// // const sortedShops = [...coffeeData.info].sort((a, b) => b.stars - a.stars);

// const minPrice = Math.min(...sortedShops.map((shop) => shop.avgPrice));
// const maxPrice = Math.max(...sortedShops.map((shop) => shop.avgPrice));

function StarRating({ rating }) {
  const stars = [];

  for (let i = 1; i <= 5; i += 1) {
    if (rating >= i) {
      stars.push(<FontAwesomeIcon icon={solidStar} key={i} />);
    } else if (rating >= i - 0.5) {
      stars.push(
        <div className="star-icon" key={i}>
          <FontAwesomeIcon icon={regularStar} />
          <FontAwesomeIcon icon={solidStarHalf} className="half-star" />
        </div>,
      );
    } else {
      stars.push(<FontAwesomeIcon icon={regularStar} key={i} />);
    }
  }

  return (
    <div>{stars}</div>
  );
}

function GradientBar() {
  return (
    <div style={{
      borderRadius: '20px', height: '20px', background: 'linear-gradient(to right, rgba(121, 64, 6, 0.25), rgba(121, 64, 6, 0.9))', margin: '10px 0',
    }}
    />
  );
}

function GradientLegend() {
  return (
    <div style={{ padding: '10px', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
      <p className="pLevels" style={{ margin: 0 }}>Price Level:</p>
      <GradientBar />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p className="pLevels" style={{ margin: 0 }}>Less expensive</p>
        <p className="pLevels" style={{ margin: 0 }}>More expensive</p>
      </div>
    </div>
  );
}

const ResetZoomButton = () => {
  const map = useMap();

  const resetZoom = () => {
    if (map && averageLatitude != null && averageLongitude != null) {
      map.setView([averageLatitude, averageLongitude], 16);
    }
  };

  return (
    <button type="button" onClick={resetZoom} className="reset-button">
      Reset Map
    </button>
  );
};

const MapController = ({ selectedShop }) => {
  const map = useMap();
  const flyToDuration = 1.5;

  useEffect(() => {
    if (selectedShop && map) {
      const location = [selectedShop.center[0], selectedShop.center[1]];
      map.flyTo(location, 18, {
        animate: true,
        duration: flyToDuration,
      });
    }
  }, [selectedShop, map]);

  return null;
};

// const latitudes = coffeeData.info.map((shop) => shop.center[0]);
// const longitudes = coffeeData.info.map((shop) => shop.center[1]);
// const averageLatitude = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
// const averageLongitude = longitudes.reduce((sum, lon) => sum + lon, 0) / longitudes.length;

// // const minPrice = Infinity;
// // const maxPrice = -Infinity;

// const sortedShops = [...coffeeData.info].sort((a, b) => b.stars - a.stars);

// const minPrice = Math.min(...sortedShops.map((shop) => shop.avgPrice));
// const maxPrice = Math.max(...sortedShops.map((shop) => shop.avgPrice));

function CoffeeMap() {
  const [selectedShop, setSelectedShop] = useState(null);

  const sortedShops = [...coffeeData.info].sort((a, b) => b.stars - a.stars);

  // const latitudes = coffeeData.info.map((shop) => shop.center[0]);
  // const longitudes = coffeeData.info.map((shop) => shop.center[1]);
  // const averageLatitude = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
  // const averageLongitude = longitudes.reduce((sum, lon) => sum + lon, 0) / longitudes.length;

  // const minPrice = Math.min(...sortedShops.map((shop) => shop.avgPrice));
  // const maxPrice = Math.max(...sortedShops.map((shop) => shop.avgPrice));

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
      >
        <div className="sidebar">
          <GradientLegend />
          {sortedShops.map((shop, index) => (
            // <div
            //   key={index}
            //   className="coffee-shop"
            //   onClick={() => {
            //     setSelectedShop(shop);
            //   }}
            // >
            //   <p className="shopNamez">{shop.shopName}</p>
            //   <StarRating rating={shop.stars} />
            //   <p className="coffee-address">{shop.address}</p>
            // </div>
            <div
              key={index}
              className="coffee-shop"
              role="button" // Add role attribute
              tabIndex={0} // Add tabIndex attribute to make the element focusable
              onClick={() => {
                setSelectedShop(shop);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { // Handle Enter and Space key presses
                  setSelectedShop(shop);
                }
              }}
            >
              <p className="shopNamez">{shop.shopName}</p>
              <StarRating rating={shop.stars} />
              <p className="coffee-address">{shop.address}</p>
            </div>
          ))}
        </div>
        <div className="map-container">
          <MapContainer className="map" center={[37.8686181, -122.2611693]} zoom={15}>
            <MapController selectedShop={selectedShop} />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
            {coffeeData.info.map((shop, index) => {
              const minOpacity = 0.15;
              const maxOpacity = 0.9;
              const t = (shop.avgPrice - minPrice) / (maxPrice - minPrice);
              const opacity = minOpacity + t * (maxOpacity - minOpacity);

              return (
                <CircleMarker
                  key={index}
                  center={[shop.center[0], shop.center[1]]}
                  eventHandlers={{
                    click: () => {
                      setSelectedShop(shop);
                    },
                  }}
                  pathOptions={{
                    color: '#000',
                    fillColor: '#7e453a',
                    fillOpacity: opacity,
                  }}
                >
                  <Tooltip className="customTooltip">{shop.shopName}</Tooltip>
                  {selectedShop === shop && (
                  <Tooltip className="customTooltip" permanent>
                    <h3 className="shopName">{shop.shopName}</h3>
                      {/* {console.log(`selected shop: ${selectedShop.shopName}`)} */}
                      {shop.dripPrice !== null && (
                      <li>
                        Drip: $
                        {shop.dripPrice.toFixed(2)}
                      </li>
                      )}
                      {shop.mochaPrice !== null && (
                      <li>
                        Mocha: $
                        {shop.mochaPrice.toFixed(2)}
                      </li>
                      )}
                      {shop.lattePrice !== null && (
                      <li>
                        Latte: $
                        {shop.lattePrice.toFixed(2)}
                      </li>
                      )}
                      {shop.espressoPrice !== null && (
                      <li>
                        Espresso: $
                        {shop.espressoPrice.toFixed(2)}
                      </li>
                      )}
                      {shop.americanPrice !== null && (
                      <li>
                        Americano: $
                        {shop.americanPrice.toFixed(2)}
                      </li>
                      )}
                      {shop.capPrice !== null && (
                      <li>
                        Cappuccino: $
                        {shop.capPrice.toFixed(2)}
                      </li>
                      )}
                  </Tooltip>
                  )}
                </CircleMarker>
              );
            })}
            <ResetZoomButton />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default CoffeeMap;
