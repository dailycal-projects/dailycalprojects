import React, { useEffect, useState } from 'react';

import { Link } from 'gatsby';
import logo from '../../images/dclogoblack.png';
import { FinanceTreemap } from './treemap';
import { FinanaceVizElement, FinanceDatawrapperCharts } from './extra_graphs';

const TEXT_STYLING = {
  fontSize: '0.95rem',
  margin: 0,
  textAlign: 'justify',
  textJustify: 'inter-word',
};

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
        overflowY: 'scroll',
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
            <p style={TEXT_STYLING}>
              With federal and state elections coming up this November, how much are Berkeley residents and UC Berkeley employees contributing financially to campaigns? The Daily Californian used data made available by the Federal Election Commission (FEC) and California Secretary of State to analyze which committees and candidates were most donated to.
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

      {/* Treemap Content */}
      <FinanceTreemap />

      {/* Middle Text */}
      <FinanaceVizElement maxWidth={640}>
        <p style={TEXT_STYLING}>We tracked what amount Berkeley residents and UC Berkeley employees donated to each candidate on both a federal and state level. Of all the state candidates, Xavier Becerra’s campaign for California governor received the most donations from both Berkeley residents. For the federal candidates, Scott Wiener’s campaign for California’s 11th Congressional representative.</p>
        <br />
        <p style={TEXT_STYLING}>Hover over each candidate’s name in the map to see information about their political party, as well as their campaign contributions over time.</p>
      </FinanaceVizElement>

      {/* Piechart Content */}
      <FinanceDatawrapperCharts />
    </div>
  );
};

export default CandidateFinanceVisuals;
