import React, { useState } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup,
} from 'react-leaflet';

import header from '../../components/header';
import navBar from '../../components/navBar';

import 'leaflet/dist/leaflet.css';
import { hackData } from './hack_data';
import Header from '../../components/header';
import NavBar from '../../components/navBar';

function fuzzyMatch(name, query) {
  if (!query) return true;
  const lowerName = name.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lowerName.length && qi < lowerQuery.length; i++) {
    if (lowerName[i] === lowerQuery[qi]) qi++;
  }
  return qi === lowerQuery.length;
}

const HackVisuals = () => {
  const [search, setSearch] = useState('');

  if (typeof window === 'undefined') return null;

  const { universities } = hackData;
  const filtered = universities.filter((u) => fuzzyMatch(u.name, search));
  const mappable = universities.filter((u) => u.lat != null && u.lng != null);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', border: '2px solid #ccc', borderRadius: '10px', overflow: 'hidden',
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
        <h3 style={{ margin: 0, fontFamily: 'sans-serif', fontWeight: 'bold' }}>
          Affected Universities
        </h3>
        <NavBar />
      </div>

      {/* Content split */}
      <div style={{
        display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0,
      }}
      >
        {/* Left: search + list */}
        <div style={{
          width: '40%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '2px solid #ccc',
          minHeight: 0,
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
                fontSize: '0.9rem',
                fontFamily: 'sans-serif',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {filtered.map((u) => (
              <div
                key={u.name}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #f0f0f0',
                  fontFamily: 'sans-serif',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{u.name}</span>
                {(u.lat == null || u.lng == null) && (
                  <span style={{ color: '#bbb', fontSize: '0.75rem' }}>no location</span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{
                color: '#aaa', textAlign: 'center', padding: '20px', fontFamily: 'sans-serif', fontSize: '0.9rem',
              }}
              >
                No results
              </p>
            )}
          </div>
        </div>

        {/* Right: map */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <MapContainer
            center={[39.5, -98.35]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            zoomSnap={0.5}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png" />
            {mappable.map((u) => (
              <CircleMarker
                key={u.name}
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
                  <span style={{ fontFamily: 'sans-serif', fontSize: '0.85rem' }}>{u.name}</span>
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
