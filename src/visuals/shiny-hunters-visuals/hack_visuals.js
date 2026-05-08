import React, { useEffect, useState } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup,
} from 'react-leaflet';

// import logo from '../../images/dclogoblack.png';
// import { Link } from 'gatsby';

import { Link } from 'gatsby';
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

  const { universities, defaultUniversities, mappableUniversities } = hackData;
  const query = search.trim().toLowerCase();
  const filtered = query
    ? universities.filter((u) => u.searchName.includes(query))
    : defaultUniversities;

  if (typeof window === 'undefined') return null;

  return (
    <div
      style={{
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
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '2px solid #ccc',
          backgroundColor: '#f7f7f7',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img
              src={logo}
              alt="The Daily Californian"
              style={{
                height: '20px',
                marginTop: '5px',
                marginBottom: '15px',
                borderBottom: '2px solid #ccc',
              }}
            />
          </Link>
        </div>

        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          We mapped the nationwide Instructure breach — see if your organization could be at risk
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
              flex: 2,
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
<p>In what appears to be a global attack on thousands of schools, cybercrime group ShinyHunters has claimed credit for a massive breach of Instructure, the ed-tech company that provides the learning management system Canvas to roughly 41% of North American institutions of higher education. </p>
{/* <p> */}

{/* <p>ShinyHunters is holding the data from some schools for ransom and, this afternoon, launched an extensive seizure of school Canvas pages operated by Instructure, including UC Berkeley, resulting in students nationwide losing access to their course materials.</p> */}

{/* <p>While the list includes schools and universities, it also includes public institutions, financial institutions, nonprofits, businesses, religious institutions and hospitals. This was revealed in an expansive list of purportedly breached organizations published by ShinyHunters on its dark web page, which The Daily Californian reviewed and processed the list. Below is a searchable map.</p> */}

{/* <p>Organizations listed include Apple, The Church of Jesus Christ of Latter-day Saints, Goldman Sachs, California Department of Education, California Department of Corrections and Rehabilitation and Amazon. While ShinyHunters released 8809 names, some were subsidiaries of the same organization. Additionally, the Daily Californian found that some employees of Instructure were listed amongst the organizations.</p> */}

{/* <p>The Daily Californian was unable to verify the list's accuracy, though several universities on it have begun reporting intrusions. Additionally, the geolocation of some pins may be inaccurate due to lack of precision in the published list.</p> */}

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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'center',
              gap: '10px',
              width: isMobile ? '100%' : 'auto',
              // paddingLeft: '18px',
              paddingInline: '25px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'sans-serif',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              By
              {' '}
              <a
                href="https://www.dailycal.org/users/profile/ajith%20araiza-singh/"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00529B', textDecoration: 'underline' }}
              >
                Ajith Araiza-Singh
              </a>
              {' '}
              &
              {' '}
              <a
                href="https://www.dailycal.org/users/profile/luca%20vicisano/"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00529B', textDecoration: 'underline' }}
              >
                Luca Vicisano
              </a>
            </p>
            <p
              style={{
                margin: '-6px 0 0',
                fontFamily: 'sans-serif',
                fontSize: '0.7rem',
                textAlign: 'center',
                color: '#555',
              }}
            >
              Aarya Mukherjee, Brendan Raykoff, Antara Gangwal, Saloni Sethi, Emanuel Luo, and Jun Oh contributed to this project.
            </p>
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
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          flex: isMobile ? 'none' : 1,
          overflow: isMobile ? 'visible' : 'hidden',
          minHeight: isMobile ? 'auto' : 0,
        }}
      >
        {/* Left: search + list */}
        <div
          style={{
            width: isMobile ? '100%' : '40%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: isMobile ? 'none' : '2px solid #ccc',
            borderTop: isMobile ? '2px solid #ccc' : 'none',
            minHeight: isMobile ? 'auto' : 0,
            flex: isMobile ? 'none' : '0 0 auto',
          }}
        >
          <div
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              flexShrink: 0,
            }}
          >
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
          <div
            style={{
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
                  <span
                    style={{
                      color: '#bbb',
                      fontSize: '0.75rem',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    no location
                  </span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p
                style={{
                  color: '#aaa',
                  textAlign: 'center',
                  padding: '20px',
                  fontSize: '0.9rem',
                  fontFamily: 'sans-serif',
                }}
              >
                No results
              </p>
            )}
          </div>
        </div>

        {/* Right: map */}
        <div
          style={{
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
