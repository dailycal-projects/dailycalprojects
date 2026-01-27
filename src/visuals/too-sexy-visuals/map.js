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

function createSexSpotIcon(year) {
  if (typeof window === 'undefined') return null;

  if (year === 2018) {
    return L.icon({
      iconUrl: sexy2018IconPng,
      iconSize: [16, 16],
    });
  }
  if (year === 2026) {
    return L.icon({
      iconUrl: sexy2026IconPng,
      shadowUrl: sexy2026ShadowPng,
      shadowSize: [32, 32],
      iconSize: [32, 32],
    });
  }

  if (year === 0) {
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
  return null;
}

const SexyMap = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tutorialPinRef = useRef(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [draggablePosition, setDraggablePosition] = useState([37.8716, -122.2585]);
  const [pinMessage, setPinMessage] = useState('');
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [tutorialMessageDismissed, setTutorialMessageDismissed] = useState(false);

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

  // Open tutorial pin popup when warning is dismissed
  useEffect(() => {
    if (warningDismissed && tutorialPinRef.current) {
      // Small delay to ensure marker is fully rendered
      setTimeout(() => {
        if (tutorialPinRef.current) {
          tutorialPinRef.current.openPopup();
        }
      }, 300);
    }
  }, [warningDismissed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Submitting pin:', { position: draggablePosition, message: pinMessage });

    try {
      window.fetch(`https://docs.google.com/forms/d/e/1FAIpQLSfxEQSGr4_mPqU4nMrgUEMQNu_nPUUJkBU62RtYDOaNYzxpCw/formResponse?&submit=Submit?usp=pp_url&entry.949812204=${pinMessage}&entry.262371575=${draggablePosition[0]}&entry.1560180432=${draggablePosition[1]}&entry.1483653783=NA`);
    } catch (error) {
      // This fetch should fail, but the response will still be recorded
    }
    // Reset form
    setIsAddingPin(false);
    setPinMessage('');
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
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>
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
            <MapContainer
              center={[37.8716, -122.2585]}
              zoom={15.3}
              style={containerStyle}
              zoomSnap={0.5}
              minZoom={14.5}
              // maxZoom={10}
              whenCreated={(map) => { mapRef.current = map; }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
              {sex_spots_2018.map((spot, index) => {
                const pinId = `2018-${index}-${spot.lat}-${spot.long}`;
                const isTutorialPin = pinId === '2018-23-37.869071--122.261473';
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
                          setTutorialMessageDismissed(true);
                          // Close and reopen popup to show original message
                          setTimeout(() => {
                            if (tutorialPinRef.current) {
                              tutorialPinRef.current.openPopup();
                            }
                          }, 50);
                        }
                      },
                    }}
                  >
                    <Popup>
                      {isTutorialPin && warningDismissed && !tutorialMessageDismissed ? (
                        <p>Click on a pin to read more</p>
                      ) : (
                        <p>{spot.message}</p>
                      )}
                    </Popup>
                  </Marker>
                );
              })}
              {sex_spots_2026.map((spot) => (
                <Marker 
                  key={spot.message} 
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
              {isAddingPin && (
                <Marker
                  ref={markerRef}
                  position={draggablePosition}
                  icon={createSexSpotIcon(0)}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      setDraggablePosition([marker.getLatLng().lat, marker.getLatLng().lng]);
                    },
                  }}
                  zIndexOffset={2000}
                >
                  <Popup closeButton={false}>
                    <b>Drag me 🐻</b>
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
                  }}><b>Warning: </b>This project contains graphic descriptions of sex. Viewer discretion is advised. <b>Click to reveal the map</b></span>
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
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  margin: '0px',
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
                value="ADD A PIN"
                onClick={handleAddPinClick}
                style={{
                  fontFamily: 'sans-serif',
                  fontWeight: 'lighter',
                  // fontSize:
                  border: 'none',
                  backgroundColor: 'black',
                  color: 'white',
                  fontSize: '1.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  // scale: '1.3',
                  padding: '8px 16px',
                  position: isAddingPin ? 'absolute' : 'relative',
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
