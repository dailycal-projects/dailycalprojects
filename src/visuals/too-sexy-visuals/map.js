import React, { useRef, useState, useEffect } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
} from 'react-leaflet';
// import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import zIndex from '@material-ui/core/styles/zIndex';
// import { sex_spot_icon_2018, sex_spot_icon_2026 } from './icon';
import { sex_spots_2018, sex_spots_2026 } from './map_data';
import sexy2018IconPng from '../../images/2-sexy-2018-icon.png';
import sexy2026IconPng from '../../images/2-sexy-2026-icon.png';
import sexy2026ShadowPng from '../../images/2-sexy-2026-shadow.png';
import mapViewIcon from '../../images/2-sexy-map-map.png';
import satelliteViewIcon from '../../images/2-sexy-map-sattelite.png';

// LIVE: Runtime download the data from Sheet client-side
// STATIC: Read from map_data like normal
const source_2026 = 'LIVE';

function createSexSpotIcon(year) {
  if (typeof window === 'undefined') return null;

  if (year === 2018) {
    return L.divIcon({
      className: 'sex-spot-icon-2018',
      html: `<img src="${sexy2018IconPng}" style="width: 16px; height: 16px; transition: transform 0.2s ease-in-out; transform-origin: center center;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'" />`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }
  if (year === 2026) {
    return L.divIcon({
      className: 'sex-spot-icon-2026',
      html: `<div style="position: relative; width: 25px; height: 25px; transition: transform 0.2s ease-in-out; transform-origin: center center;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><img src="${sexy2026ShadowPng}" style="position: absolute; width: 25px; height: 25px; left: 0; top: 0;" /><img src="${sexy2026IconPng}" style="position: absolute; width: 25px; height: 25px; left: 0; top: 0;" /></div>`,
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5],
    });
  }

  if (year === 0) {
    return L.divIcon({
      className: 'sex-spot-icon-default',
      html: `<div style="position: relative; width: 25px; height: 41px; transition: transform 0.2s ease-in-out; transform-origin: center bottom;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png" style="position: absolute; width: 41px; height: 41px; left: -8px; top: 0;" /><img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="position: absolute; width: 25px; height: 41px; left: 0; top: 0;" /></div>`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }
  if (year === -1) {
    // Transparent invisible icon for hidden tutorial pin
    return L.divIcon({
      className: 'hidden-tutorial-pin',
      html: '',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }
  return null;
}

const SexyMap = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tutorialPinRef = useRef(null);
  const hiddenTutorialPinRef = useRef(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [draggablePosition, setDraggablePosition] = useState([37.8716, -122.2585]);
  const [pinMessage, setPinMessage] = useState('');
  const [pinContact, setPinContact] = useState('');
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [tutorialMessageDismissed, setTutorialMessageDismissed] = useState(false);
  const [live2026Data, setLive2026Data] = useState(null);
  const [pinSubmitted, setPinSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tileLayerIndex, setTileLayerIndex] = useState(0); // 0 = CartoDB, 1 = Esri, 2 = OSM

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerStyle = {
    height: '600px',
    margin: '0px',
    borderTop: '2px solid gray',
    borderBottom: '2px solid gray',
    // borderRadius: '0 0 15px 15px',
    // boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.25)',
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
      // Small delay to ensure marker is fully rendered
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 100);
    }
  }, [isAddingPin]);

  // Open hidden tutorial pin popup when warning is dismissed
  useEffect(() => {
    if (warningDismissed && hiddenTutorialPinRef.current && !tutorialMessageDismissed) {
      // Small delay to ensure marker is fully rendered
      setTimeout(() => {
        if (hiddenTutorialPinRef.current) {
          hiddenTutorialPinRef.current.openPopup();
        }
      }, 300);
    }
  }, [warningDismissed, tutorialMessageDismissed]);

  // Fetch live 2026 data from Google Sheets if in LIVE mode
  useEffect(() => {
    if (source_2026 === 'LIVE' && typeof window !== 'undefined') {
      const sheetsUrl = 'https://docs.google.com/spreadsheets/u/8/d/1Qk_6vu_YB0hxATJR27pkZBLidKyA1QS54Lmng6lUHaM/export?format=tsv&id=1Qk_6vu_YB0hxATJR27pkZBLidKyA1QS54Lmng6lUHaM&gid=0';

      fetch(sheetsUrl)
        .then((response) => response.text())
        .then((tsvText) => {
          // Parse TSV data
          const lines = tsvText.trim().split('\n');
          const parsedData = lines.map((line) => {
            // Split by tab character
            const parts = line.split('\t');
            if (parts.length >= 3) {
              return {
                message: parts[0].trim(),
                lat: parseFloat(parts[1].trim()),
                long: parseFloat(parts[2].trim()),
              };
            }
            return null;
          }).filter((item) => item !== null && !isNaN(item.lat) && !isNaN(item.long));

          setLive2026Data(parsedData);
        })
        .catch((error) => {
          console.error('Error fetching live 2026 data:', error);
          // Fallback to static data on error
          setLive2026Data(null);
        });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    // console.log('Submitting pin:', { position: draggablePosition, message: pinMessage });

    try {
      window.fetch(`https://docs.google.com/forms/d/e/1FAIpQLSfxEQSGr4_mPqU4nMrgUEMQNu_nPUUJkBU62RtYDOaNYzxpCw/formResponse?&submit=Submit?usp=pp_url&entry.949812204=${pinMessage}&entry.262371575=${draggablePosition[0]}&entry.1560180432=${draggablePosition[1]}&entry.1483653783=${pinContact}`);
    } catch (error) {
      // This fetch should fail, but the response will still be recorded
    }
    // Mark pin as submitted and show thank you message
    setPinSubmitted(true);
    // Hide form but keep pin visible
    setIsAddingPin(false);
    setPinMessage('');
    setPinContact('');
    // Open popup with thank you message
    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }, 100);
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
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
              Legend —
              <i> Click an encounter to read more</i>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              {[2018, 2026].map((year) => (
                <div
                  key={year}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <img
                    src={year === 2018 ? sexy2018IconPng : sexy2026IconPng}
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
          <div style={{ position: 'relative' }}>
            {/* Tile layer toggle switch */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '5px',
                padding: '5px',
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
                  height: 'fit-content'
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
                    borderRadius: '5px'
                  }}
                />
              </button>
            </div>
            <MapContainer
              center={[37.8716, -122.2585]}
              zoom={15.3}
              style={containerStyle}
              zoomSnap={0.5}
              minZoom={14.5}
              // maxZoom={10}
              whenCreated={(map) => { mapRef.current = map; }}
            >
              {tileLayerIndex === 0 && (
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
              )}
              {tileLayerIndex === 1 && (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />
              )}
              {sex_spots_2018.map((spot, index) => {
                const isTutorialPin = index === '67';
                return (
                  <Marker
                    key={spot.message}
                    ref={isTutorialPin ? tutorialPinRef : null}
                    position={[spot.lat, spot.long]}
                    icon={createSexSpotIcon(2018)}
                    opacity={0.8}
                    zIndexOffset={0}
                    eventHandlers={{
                      click: () => {
                        if (isTutorialPin && !tutorialMessageDismissed) {
                          // Close the hidden pin's popup
                          if (hiddenTutorialPinRef.current) {
                            hiddenTutorialPinRef.current.closePopup();
                          }
                          setTutorialMessageDismissed(true);
                        }
                      },
                    }}
                  >
                    <Popup>
                      <p>{spot.message}</p>
                    </Popup>
                  </Marker>
                );
              })}
              {/* Hidden invisible pin for tutorial message at same location as tutorial pin */}
              {warningDismissed && !tutorialMessageDismissed && (
                <Marker
                  ref={hiddenTutorialPinRef}
                  position={[37.872647, -122.259652]}
                  icon={createSexSpotIcon(-1)}
                  zIndexOffset={3000}
                >
                  <Popup>
                    <b>Click on a pin to read more</b>
                  </Popup>
                </Marker>
              )}
              {(source_2026 === 'LIVE' && live2026Data ? live2026Data : sex_spots_2026).map((spot, index) => (
                <Marker
                  key={`2026-${index}-${spot.lat}-${spot.long}`}
                  position={[spot.lat, spot.long]}
                  icon={createSexSpotIcon(2026)}
                  opacity={1}
                  zIndexOffset={1000}
                >
                  <Popup>
                    <p>{spot.message}</p>
                  </Popup>
                </Marker>
              ))}
              {(isAddingPin || pinSubmitted) && (
                <Marker
                  ref={markerRef}
                  position={draggablePosition}
                  icon={pinSubmitted ? createSexSpotIcon(2026) : createSexSpotIcon(0)}
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
              onClick={() => setWarningDismissed(true)}
              style={{
                position: 'absolute',
                top: '0px',
                left: '0px',
                right: '0px',
                bottom: '0px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                cursor: 'pointer',
                opacity: warningDismissed ? 0 : 1,
                transition: 'opacity 0.5s ease-in-out',
                pointerEvents: warningDismissed ? 'none' : 'auto',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontFamily: 'sans-serif',
                  // fontWeight: 'bold',
                  color: 'rgb(10, 10, 10)',
                  textAlign: 'center',
                  padding: '20px',
                  width: '75%',
                }}
              >
                <span style={{
                  // backgroundColor: 'white',
                  lineHeight: '1',
                  padding: '2px 8px',
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                  display: 'inline',
                  whiteSpace: 'pre-line',
                }}
                >
                  <b>Warning: </b>
                  This project contains descriptions of sex. Viewer discretion is advised.
                  <b>Click to reveal the map</b>
                </span>
              </div>
            </div>
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
                    value={pinMessage}
                    onChange={(e) => setPinMessage(e.target.value)}
                    placeholder="Describe your encounter..."
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: '1rem',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      flex: 1,
                    }}
                  />

                  {/* <input
                    type="text"
                    value={pinContact}
                    onChange={(e) => setPinContact(e.target.value)}
                    placeholder="Optionally, add your contact info so the Daily Cal can privately follow up"
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: isMobile ? '0.5rem' : '0.7rem',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      flex: 1,
                    }}
                  /> */}
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
            // gap: isAddingPin ? '10px' : '0px',
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
                Tell us about a sexual encounter you've had on Berkeley's campus.
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
                Drag the pin on the map to mark the location, then describe your encounter above. Responses may be edited for clarity and length.
              </p>
              <input
                type="button"
                value="Add a Pin"
                onClick={handleAddPinClick}
                style={{
                  fontFamily: 'sans-serif',
                  fontWeight: 'lighter',
                  // fontSize:
                  border: 'none',
                  backgroundColor: 'rgba(200,250,200, 1)',
                  border: '2px solid rgb(76, 110, 75)',
                  color: 'rgb(76, 110, 75)',
                  fontSize: '1.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  // boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',

                  // scale: '1.3',
                  padding: '8px 16px',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
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

export default SexyMap;
