import React, { useEffect, useState } from 'react';
import logo from '../../../assets/site/dclogoblack.webp?url';
import { FinanceTreemap } from './treemap';
import { FinanaceVizElement, FinanceDatawrapperCharts } from './extra_graphs';
import ArticleFooter from '../../../components/ArticleFooter';
import './finance_visuals.css';

/**
 * Root visual element. The story's text is written in the article's .mdx and passed in as slots
 * (so it's searchable), each one or more paragraphs: `intro` (beside the byline), `middle` (between
 * the treemap and the Datawrapper charts) and `end` (after the charts).
 */
const CandidateFinanceVisuals = ({ intro, middle, end }) => {
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
        <a href="/" style={{ textDecoration: 'none' }}>
          <img
            src={logo}
            alt="The Daily Californian"
            style={{
              height: '20px',
              display: 'block',
              margin: 0,
            }}
          />
        </a>
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
            className="candidate-prose"
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
            {intro}
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
                href="/team/antara-gangwal"
                style={{ color: '#00529B', textDecoration: 'underline' }}
              >
                Antara Gangwal
              </a>
              {' '}
              &
              {' '}
              <a
                href="/team/brendan-raykoff"
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
        <div
          className="candidate-prose"
          style={{ display: 'flex', flexDirection: 'column', gap: '1lh' }}
        >
          {middle}
        </div>
      </FinanaceVizElement>

      {/* Datawrapper Content */}
      <FinanceDatawrapperCharts />

      {/* End Content */}
      <FinanaceVizElement maxWidth={640} margin={0}>
        <div className="candidate-prose">{end}</div>
      </FinanaceVizElement>

      {/* About this story: centre the cards on the page, not the text inside them */}
      <FinanaceVizElement maxWidth={640}>
        <ArticleFooter />
      </FinanaceVizElement>
    </div>
  );
};

export default CandidateFinanceVisuals;
