import React, { useEffect, useState } from 'react';

import { Link } from 'gatsby';
import logo from '../../images/dclogoblack.png';

const CandidateFinanceVisuals = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          Candidate Finance TITLE HERE
        </h1>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : 0,
            marginTop: '0.5em',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              flex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              paddingInline: '25px',
            }}
          >
            <p
              style={{
                fontSize: '0.95rem',
                margin: 0,
                textAlign: 'justify',
                textJustify: 'inter-word',
              }}
            >
              Given the upcoming elections, we anaylzed federal and state campgain contributions from City of Berkeley residents and UC Berkeley employees from August 2025 through August 2026 using data made available by the Federal Election Commission and the California Secretary of State.
            </p>
          </div>
          <div
            style={{
              width: isMobile ? '100%' : '1px',
              height: isMobile ? '1px' : 'auto',
              background: '#bbb',
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
                href="https://www.dailycal.org/users/profile/antara%20gangwal/"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00529B', textDecoration: 'underline' }}
              >
                Antara Gangwal
              </a>
              {' '}
              &
              {' '}
              <a
                href="https://www.dailycal.org/users/profile/brendan%20raykoff/"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00529B', textDecoration: 'underline' }}
              >
                Brendan Raykoff
              </a>
            </p>
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
      />
    </div>
  );
};

export default CandidateFinanceVisuals;
