import React, { useEffect, useState } from 'react';

import { Link } from 'gatsby';
import logo from '../../images/dclogoblack.png';
import { FinanceTreemap } from './treemap';
import { FinanaceVizElement, FinanceDatawrapperCharts } from './extra_graphs';
import ArticleFooter from '../../components/articleFooter';

const TEXT_STYLING = {
  fontSize: '0.95rem',
  margin: 0,
  textAlign: 'justify',
  textJustify: 'inter-word',
};

/**
 * Root visual element.
 */
const CandidateFinanceVisuals = () => {
  const [isMobile, setIsMobile] = useState(false);

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
          height: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid #D3D3D3',
          backgroundColor: '#f7f7f7',
          flexShrink: 0,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img
            src={logo}
            alt="The Daily Californian"
            style={{
              height: '20px',
              display: 'block',
              margin: 0,
            }}
          />
        </Link>
      </div>
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '2px solid #ccc',
          backgroundColor: '#f7f7f7',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Out-of-state spending dominates Berkeley congressional donations
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
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.75em',
              width: isMobile ? '100%' : 'auto',
              paddingInline: '25px',
            }}
          >
            <p style={TEXT_STYLING}>
              During the most expensive gubernatorial race in California history, Berkeley residents and UC Berkeley employees donated hundreds of thousands of dollars to candidates such as Katie Porter and primary winner Xavier Becerra. Congressional candidates like Graham Platner and Jon Ossoff received significant amounts as well.
            </p>
            <p style={TEXT_STYLING}>
              The Daily Californian analyzed donations reported to the Federal Election Commission and California Secretary of State from Aug. 10, 2025 to Aug. 10, 2026. Here’s which candidates were most donated to.
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
        <p style={TEXT_STYLING}>
          Toggle the map above to view candidate donations from Berkeley residents (City of Berkeley Residents Only), UC Berkeley employees (UC Berkeley Employees Only) as well as their combined totals (Both). Hover over each candidate’s name in the map to see information about their political party, as well as their campaign contributions over time.
        </p>
        <br />
        <p style={TEXT_STYLING}>
          California’s gubernatorial race steered state-level contributions. Xavier Becerra’s campaign received the most donations from Berkeley residents: $526,986. Other Democratic candidates also received significant amounts — Katie Porter received $175,622, Matt Mahan received $169,261 and Tom Steyer received $39,800 — whereas Republican candidate Steve Hilton, who advanced to the general election, received only $6,129.
        </p>
        <br />
        <p style={TEXT_STYLING}>
          The campaign for Proposition 50, a measure on the ballot in California’s November 2025 special election that could allow Democrats to gain up to five U.S. House seats through redistricting, also comprised a significant portion of state contributions. Berkeley residents donated a total of $335,390 to Governor Gavin Newsom’s committee supporting Prop. 50.
        </p>
        <br />
        <p style={TEXT_STYLING}>
          In federal elections, Berkeley residents donated more to any single out-of-district elections than they did to local ones.
        </p>
        <br />
        <p style={TEXT_STYLING}>
          Berkeley is located in California’s 12th Congressional District, currently represented by Democrat Lateefah Simon, who ran against Democrat Jamie Joyce in the primary. Yet neither candidate made up a significant amount of federal contributions from Berkeley residents, with Simon receiving $54,315 and Joyce receiving $4,000.
        </p>
        <br />
        <p style={TEXT_STYLING}>
          Democrat Scott Wiener’s campaign for California’s 11th Congressional District, currently represented by Speaker Emerita Nancy Pelosi and located entirely in San Francisco, received the most contributions on a federal level. He gained $417,380 from Berkeley residents.
        </p>
        <br />
        <p style={TEXT_STYLING}>
          At a close second came Manhattan Democrat Alex Bores’ campaign for New York’s 12th Congressional District, for which Berkeley residents donated $413,655, more than 10% of his total contributions. Berkeley residents donated 6.6 times more per capita than Manhattanites, who accounted for 21% of his total contributions.
        </p>
      </FinanaceVizElement>

      {/* Datawrapper Content */}
      <FinanceDatawrapperCharts />

      {/* End Content */}
      <FinanaceVizElement maxWidth={640}>
        <p style={TEXT_STYLING}>
          Berkeley’s political spending swayed Democratic: 84% of federal contributions and 60% of state contributions went to Democratic candidates, while only 13% of federal and 10% of state contributions went to Republican ones.
        </p>
      </FinanaceVizElement>

      {/* About this story: centre the cards on the page, not the text inside them */}
      <FinanaceVizElement maxWidth={640}>
        <ArticleFooter />
      </FinanaceVizElement>
    </div>
  );
};

export default CandidateFinanceVisuals;
