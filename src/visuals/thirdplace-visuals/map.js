import React, { useRef, useState, useEffect } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
import L from 'leaflet';
import { third_places } from './map_data';
import mapViewIcon from '../../images/thirdplace-icon.png';
import placeIconPng from '../../images/thirdplace_1.png';
import publicPlaceIconPng from '../../images/thirdplace_2.png';
import newPinIconPng from '../../images/thirdplace-icon-2.png';
import satelliteViewIcon from '../../images/2-sexy-map-sattelite.png';

// LIVE: Runtime download the data from Sheet client-side
// STATIC: Read from map_data like normal
const dataSource = 'LIVE';

// Pin categories; each sheet below feeds one category
const categories = {
  staff: { label: 'Daily Cal staffers', icon: placeIconPng },
  public: { label: 'Public submissions', icon: publicPlaceIconPng },
};

const staffSheetUrl = 'https://docs.google.com/spreadsheets/d/1trDSVXjEHSBtRdJkn-N1RnyDQH1dIc2ExpRhL24QZQw/export?format=tsv&gid=1709202706';
const publicSheetUrl = 'https://docs.google.com/spreadsheets/d/1Cl05phZePtBgfkfrY3pYYiwwVI01WM66D9ETPAZ17ME/export?format=tsv';

// Sheet columns: place name, description, lat, long. Header and blank rows drop out on the lat/long check.
const fetchSheetPlaces = (url, category) => fetch(url)
  .then((response) => {
    if (!response.ok) throw new Error(`Sheet request failed: ${response.status}`);
    return response.text();
  })
  .then((tsvText) => tsvText.trim().split('\n').map((line) => {
    const parts = line.split('\t');
    if (parts.length < 4) return null;
    return {
      places: parts[0].trim(),
      reason: parts[1].trim(),
      lat: parseFloat(parts[2].trim()),
      long: parseFloat(parts[3].trim()),
      category,
    };
  }).filter((item) => item !== null && !Number.isNaN(item.lat) && !Number.isNaN(item.long)));

function createPlaceIcon(category = 'staff') {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: 'place-icon',
    html: `<img src="${categories[category].icon}" style="width: 24px; height: 24px; transition: transform 0.2s ease-in-out; transform-origin: center center; filter: drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white); onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'" />`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createNewPinIcon() {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: 'new-pin-icon',
    html: `<img src="${newPinIconPng}" style="width: 24px; height: 24px;" />`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Nudge pins that sit on (nearly) the same spot onto a small circle so each is clickable
const OVERLAP_DEG = 0.0001; // ~10 m
const SPREAD_DEG = 0.0002; // ~20 m
const spreadOverlappingPins = (places) => {
  const clusters = [];
  places.forEach((place, i) => {
    const cluster = clusters.find((c) => (
      Math.abs(c.lat - place.lat) < OVERLAP_DEG && Math.abs(c.long - place.long) < OVERLAP_DEG
    ));
    if (cluster) cluster.members.push(i);
    else clusters.push({ lat: place.lat, long: place.long, members: [i] });
  });
  const spread = places.map((place) => ({ ...place }));
  clusters.filter((c) => c.members.length > 1).forEach((c) => {
    const lngScale = Math.cos((c.lat * Math.PI) / 180);
    c.members.forEach((idx, k) => {
      const angle = (2 * Math.PI * k) / c.members.length;
      spread[idx].lat = c.lat + SPREAD_DEG * Math.sin(angle);
      spread[idx].long = c.long + (SPREAD_DEG * Math.cos(angle)) / lngScale;
    });
  });
  return spread;
};

// Keep clicks/scrolls on overlay controls from panning or zooming the map
const stopMapEvents = (el) => {
  if (el) {
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }
};

const ThirdPlaceMap = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tutorialPinRef = useRef(null);
  const hiddenTutorialPinRef = useRef(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [draggablePosition, setDraggablePosition] = useState([37.8716, -122.2585]);
  const [pinTitle, setPinTitle] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [tutorialMessageDismissed, setTutorialMessageDismissed] = useState(false);
  const [livePlacesData, setLivePlacesData] = useState(null);
  const [publicPlacesData, setPublicPlacesData] = useState([]);
  const [pinSubmitted, setPinSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tileLayerIndex, setTileLayerIndex] = useState(0); // 0 = Esri Light Gray, 1 = Esri satellite

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Width/radius/shadow override the global .leaflet-container rule in baypasscalculator.css
  const containerStyle = {
    height: '600px',
    width: '100%',
    margin: '0px',
    borderRadius: '0px',
    boxShadow: 'none',
    borderTop: '2px solid gray',
    borderBottom: '2px solid gray',
  };

  const handleAddPinClick = () => {
    // Spawn the pin at the center of the current viewport (what the user is looking at).
    const map = mapRef.current;
    if (map && typeof map.getCenter === 'function') {
      const center = map.getCenter();
      setDraggablePosition([center.lat, center.lng]);
    }
    setPinSubmitted(false); // Reset submitted state for new pin
    setIsAddingPin(true);
  };

  // Auto-open popup when pin is added
  useEffect(() => {
    if (isAddingPin && markerRef.current) {
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 100);
    }
  }, [isAddingPin]);

  // Fetch live data from Google Sheets if in LIVE mode
  useEffect(() => {
    if (dataSource === 'LIVE' && typeof window !== 'undefined') {
      fetchSheetPlaces(staffSheetUrl, 'staff')
        .then(setLivePlacesData)
        .catch((error) => {
          console.error('Error fetching staff sheet:', error);
          setLivePlacesData(null);
        });
      fetchSheetPlaces(publicSheetUrl, 'public')
        .then(setPublicPlacesData)
        .catch((error) => {
          console.error('Error fetching public submissions sheet:', error);
          setPublicPlacesData([]);
        });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // window.fetch(`https://docs.google.com/forms/d/e/1FAIpQLSfxEQSGr4_mPqU4nMrgUEMQNu_nPUUJkBU62RtYDOaNYzxpCw/formResponse?&submit=Submit?usp=pp_url&entry.949812204=${pinMessage}&entry.262371575=${draggablePosition[0]}&entry.1560180432=${draggablePosition[1]}&entry.1483653783=${pinContact}`);
      window.fetch(
        `https://docs.google.com/forms/d/e/1FAIpQLSfgRPPU7Tdu_kR7emDYIvqxdEi-XdW8WIeFg2zXhlT2Zc4e0Q/formResponse?submit=Submit&usp=pp_url&entry.820777333=${encodeURIComponent(pinTitle)}&entry.2084412628=${encodeURIComponent(pinMessage)}&entry.2131805841=${encodeURIComponent(draggablePosition[0])}&entry.998039144=${encodeURIComponent(draggablePosition[1])}`,
      );
    } catch (error) {
      // This fetch should fail, but the response will still be recorded
      console.error(error);
    }
    setPinSubmitted(true);
    setIsAddingPin(false);
    setPinTitle('');
    setPinMessage('');

    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }, 100);
  };

  const placesToRender = spreadOverlappingPins([
    ...((dataSource === 'LIVE' && livePlacesData) ? livePlacesData : third_places),
    ...publicPlacesData,
  ]);

  return (
    <div>
      {(typeof window !== 'undefined') ? (
        <div style={{
          border: '2px solid gray',
          boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.15)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
        >
          <div style={{
            borderRadius: '15px 15px 0px 0px',
            padding: '10px',
            backgroundColor: '##d1d1d1',
            zIndex: 100,
          }}
          >
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
              Legend —
              <i> Click a pin to read more</i>
            </h4>
            <div style={{
              display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px',
            }}
            >
              {Object.entries(categories).map(([key, { label, icon }]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center',
                  }}
                >
                  <img
                    src={icon}
                    alt={label}
                    style={{
                      width: '32px',
                      height: '32px',
                      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
                      margin: '0px',
                    }}
                  />
                  <h4 style={{ margin: '0px' }}>{label}</h4>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <MapContainer
              center={[37.8716, -122.2585]}
              zoom={15.3}
              style={containerStyle}
              zoomSnap={0.5}
              minZoom={14.5}
              whenCreated={(map) => { mapRef.current = map; }}
            >
              {/* Tile layer toggle switch */}
              <div
                ref={stopMapEvents}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 1000,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '5px',
                  padding: '2px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => setTileLayerIndex((prev) => (prev + 1) % 2)}
                  style={{
                    padding: '0',
                    border: 'none',
                    borderRadius: '3px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'fit-content',
                  }}
                >
                  <img
                    src={tileLayerIndex !== 0 ? mapViewIcon : satelliteViewIcon}
                    alt={tileLayerIndex !== 0 ? 'Map view' : 'Satellite view'}
                    style={{
                      width: 'auto',
                      height: '60px',
                      display: 'block',
                      margin: '0px',
                      borderRadius: '5px',
                    }}
                  />
                </button>
              </div>
              {tileLayerIndex === 0 && (
                <>
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS User Community"
                    maxNativeZoom={16}
                    maxZoom={19}
                  />
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    maxNativeZoom={16}
                    maxZoom={19}
                  />
                </>
              )}
              {tileLayerIndex === 1 && (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                />
              )}
              {placesToRender.map((spot, index) => {
                const isTutorialPin = index === 67;
                return (
                  <Marker
                    key={`${spot.places}-${spot.lat}-${spot.long}-${index}`}
                    ref={isTutorialPin ? tutorialPinRef : null}
                    position={[spot.lat, spot.long]}
                    icon={createPlaceIcon(spot.category || 'staff')}
                    opacity={0.9}
                    zIndexOffset={0}
                    eventHandlers={{
                      click: () => {
                        if (isTutorialPin && !tutorialMessageDismissed) {
                          if (hiddenTutorialPinRef.current) {
                            hiddenTutorialPinRef.current.closePopup();
                          }
                          setTutorialMessageDismissed(true);
                        }
                      },
                    }}
                  >
                    <Popup>
                      <b>{spot.places}</b>
                      <p>{spot.reason}</p>
                    </Popup>
                  </Marker>
                );
              })}
              {/* Hidden helper pin for tutorial message at a fixed location */}
              {!tutorialMessageDismissed && (
                <Marker
                  ref={hiddenTutorialPinRef}
                  position={[37.872647, -122.259652]}
                  icon={createPlaceIcon()}
                  zIndexOffset={3000}
                  eventHandlers={{
                    // Show the hint as soon as the pin lands on the map, and drop the pin once it's closed
                    add: (e) => setTimeout(() => e.target.openPopup(), 0),
                    popupclose: () => setTutorialMessageDismissed(true),
                  }}
                >
                  <Popup autoPan={false}>
                    <b>Click on a pin to read more</b>
                  </Popup>
                </Marker>
              )}
              {(isAddingPin || pinSubmitted) && (
                <Marker
                  ref={markerRef}
                  position={draggablePosition}
                  icon={createNewPinIcon()}
                  draggable={!pinSubmitted}
                  eventHandlers={{
                    dragend: (e) => {
                      if (!pinSubmitted) {
                        const marker = e.target;
                        setDraggablePosition([marker.getLatLng().lat, marker.getLatLng().lng]);
                      }
                    },
                  }}
                  zIndexOffset={2000}
                >
                  <Popup closeButton={false}>
                    {pinSubmitted ? (
                      <p>Thanks! Your submission is under review</p>
                    ) : (
                      <b>Drag me</b>
                    )}
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: '0px',
                right: '0px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                padding: '15px',
                borderTop: '2px solid gray',
                zIndex: 1000,
                opacity: isAddingPin ? 1 : 0,
                visibility: isAddingPin ? 'visible' : 'hidden',
                pointerEvents: isAddingPin ? 'auto' : 'none',
                transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  margin: '0px',
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: isMobile ? '100%' : '80%',
                  gap: '5px',
                }}
                >
                  <input
                    type="text"
                    value={pinTitle}
                    onChange={(e) => setPinTitle(e.target.value)}
                    placeholder="Name this place..."
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: '1rem',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      flex: 1,
                    }}
                  />
                  <input
                    type="text"
                    value={pinMessage}
                    onChange={(e) => setPinMessage(e.target.value)}
                    placeholder="Describe this place..."
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: '1rem',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      flex: 1,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    fontFamily: 'sans-serif',
                    fontWeight: 'lighter',
                    border: 'none',
                    backgroundColor: 'black',
                    color: 'white',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    padding: '10px 20px',
                    height: isMobile ? 'auto' : '100%',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
          <div style={{
            borderRadius: '0px 0px 15px 15px',
            backgroundColor: '##d1d1d1',
            padding: '10px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            transition: 'all 0.3s ease-in-out',
          }}
          >
            <div style={{ width: isAddingPin ? '100%' : '50%' }}>
              <h3 style={{
                margin: '0px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                letterSpacing: '1.1',
              }}
              >
                What’s your favorite third place in Berkeley?
              </h3>
            </div>
            <div style={{
              width: isAddingPin ? '100%' : '50%',
              position: 'relative',
              minHeight: '40px',
              display: 'flex',
              justifyContent: 'center',
            }}
            >
              <p
                style={{
                  margin: '0px',
                  fontFamily: 'sans-serif',
                  fontSize: '0.7rem',
                  opacity: isAddingPin ? 1 : 0,
                  visibility: isAddingPin ? 'visible' : 'hidden',
                  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
                  position: isAddingPin ? 'relative' : 'absolute',
                  paddingTop: isAddingPin ? '0px' : '0px',
                  textAlign: 'right',
                }}
              >
                Drag the pin on the map to mark the location, then describe the place above. Responses may be edited for clarity and length.
              </p>
              <input
                type="button"
                value="Add Pin"
                onClick={handleAddPinClick}
                style={{
                  fontFamily: 'sans-serif',
                  fontWeight: 'lighter',
                  backgroundColor: 'rgba(200,250,200, 1)',
                  border: '2px solid rgb(76, 110, 75)',
                  color: 'rgb(76, 110, 75)',
                  fontSize: '1.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'normal',
                  padding: '8px 16px',
                  position: 'absolute',
                  top: '50%',
                  right: '0px',
                  transform: 'translateY(-50%)',
                  opacity: isAddingPin ? 0 : 1,
                  visibility: isAddingPin ? 'hidden' : 'visible',
                  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
                  pointerEvents: isAddingPin ? 'none' : 'auto',
                }}
              />
            </div>
          </div>
        </div>
      ) : <p> Map is loading... </p>}
    </div>
  );
};

export default ThirdPlaceMap;
