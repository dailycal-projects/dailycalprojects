import React, { useEffect, useState } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup,
} from 'react-leaflet';

// import logo from '../../images/dclogoblack.png';
// import { Link } from 'gatsby';

import { withStyles } from '@material-ui/core';
import { Link } from 'gatsby';
import { styles } from '../../styles/customTheme';
import logo from '../../images/dclogoblack.png';

import 'leaflet/dist/leaflet.css';
import { hackData } from './hack_data';

const HackVisuals = () => {
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { universities, mappableUniversities } = hackData;
  const query = search.trim().toLowerCase();
  const filtered = query
    ? universities.filter((u) => u.searchName.includes(query))
    : universities;

  if (typeof window === 'undefined') return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowX: 'hidden',
      overflowY: isMobile ? 'auto' : 'hidden',
      WebkitOverflowScrolling: 'touch',
      fontFamily: "'Georgia', serif",
    }}
    >
      {/* Top bar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '2px solid #ccc',
        backgroundColor: '#f7f7f7',
        flexShrink: 0,
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img
              src={logo}
              alt="The Daily Californian"
              style={{
                height: '20px', marginTop: '5px', marginBottom: '15px', borderBottom: '2px solid #ccc',
              }}
            />
          </Link>
        </div>

        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center',
        }}
        >
          See if your organization was named in the Instructure breach
        </h1>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : 0,
            marginTop: '0.5em',
            // height: '66px',
            // minHeight: '40px',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              flex: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              // paddingRight: '18px',
              paddingInline: '25px',
            }}
          >
            <p
              style={{
                fontSize: '0.95rem',
                margin: 0,
                textAlign: 'justify',
                textJustify: 'inter-word',
                // fontFamily: 'sans-serif',
              }}
            >
              Hackers released a list of institutions that they claim to have compromised in a data breach targeting Instructure, the company that makes Canvas. The Daily Californian reviewed and heavily processed the list and is releasing it as a searchable map. The Daily Californian was not able to verify the veracity of the list, though several of the Universities present in the list have begun to report intrusions.
            </p>
          </div>
          <div
            style={{
              width: isMobile ? '100%' : '1px',
              height: isMobile ? '1px' : 'auto',
              background: '#bbb',
              // alignSelf: 'stretch',
              // margin: '0 25px 0 8px',
            }}
          />
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'center',
              width: isMobile ? '100%' : 'auto',
              // paddingLeft: '18px',
              paddingInline: '25px',
            }}
          >
            <button
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                background: '#00529B',
                color: '#fff',
                fontWeight: 600,
                fontFamily: 'sans-serif',
                fontSize: '0.95rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                // marginLeft: 'auto',
              }}
              onClick={() => window.open(
                'mailto:editor@dailycal.org?subject=Tips%20on%20Instructure%20breach',
                '_blank',
              )}
            >
              Submit Tips
            </button>
          </div>
        </div>

      </div>

      {/* Content split */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        flex: isMobile ? 'none' : 1,
        overflow: isMobile ? 'visible' : 'hidden',
        minHeight: isMobile ? 'auto' : 0,
      }}
      >
        {/* Left: search + list */}
        <div style={{
          width: isMobile ? '100%' : '40%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: isMobile ? 'none' : '2px solid #ccc',
          borderTop: isMobile ? '2px solid #ccc' : 'none',
          minHeight: isMobile ? 'auto' : 0,
          flex: isMobile ? 'none' : '0 0 auto',
        }}
        >
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search universities..."
              style={{
                width: '100%',
                padding: '8px 12px',
                fontFamily: 'sans-serif',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
          <div style={{
            flex: isMobile ? 'none' : 1,
            overflowY: isMobile ? 'visible' : 'auto',
            minHeight: isMobile ? 'auto' : 0,
          }}
          >
            {filtered.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.9rem',
                  fontFamily: 'sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{u.name}</span>
                {(u.lat == null || u.lng == null) && (
                  <span style={{ color: '#bbb', fontSize: '0.75rem', fontFamily: 'sans-serif' }}>no location</span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{
                color: '#aaa', textAlign: 'center', padding: '20px', fontSize: '0.9rem', fontFamily: 'sans-serif',
              }}
              >
                No results
              </p>
            )}
          </div>
        </div>

        {/* Right: map */}
        <div style={{
          flex: isMobile ? '0 0 45vh' : 1,
          minHeight: isMobile ? '280px' : 0,
          position: 'relative',
        }}
        >
          <MapContainer
            center={[39.5, -98.35]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            zoomSnap={0.5}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
            {mappableUniversities.map((u) => (
              <CircleMarker
                key={u.id}
                center={[u.lat, u.lng]}
                radius={6}
                pathOptions={{
                  color: '#1a1a1a',
                  fillColor: '#1a1a1a',
                  fillOpacity: 0.8,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <span style={{ fontSize: '0.85rem' }}>{u.name}</span>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default HackVisuals;
