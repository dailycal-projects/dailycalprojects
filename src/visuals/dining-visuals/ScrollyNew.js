import React, { useState } from 'react';
import DatawrapperChart from '../../components/dataWrapper';
import * as styles from './scrollyNew.module.css';
import clarkImg from '../../images/coloredited_danalim_data_clark.png';
import croadsImg from '../../images/coloredited_danalim_data_croads.png';
import foothillImg from '../../images/coloredited_danalim_data_foothill.png';
import cafe3Img from '../../images/coloredited_danalim_data_cafe3.png';

const HALLS = {
  clark: {
    name: 'Clark Kerr',
    img: clarkImg,
    desc: 'Clark Kerr had the highest proportion of allergen-containing items of the four dining halls, particularly gluten, milk and egg.',
    color: '#3d2b1f',
    accent: '#C4956A',
    chartId: '2BrGR/4/',
  },
  crossroads: {
    name: 'Crossroads',
    img: croadsImg,
    desc: "Crossroads is Berkeley Dining's flagship facility — the largest dining hall on campus, serving breakfast, lunch and dinner daily.",
    color: '#003262',
    accent: '#FDB515',
    chartId: 'R2Ljp/1/',
  },
  foothill: {
    name: 'Foothill',
    img: foothillImg,
    desc: 'Foothill had the fewest allergen-containing items of all four dining halls — a standout for students managing dietary restrictions.',
    color: '#2d4a2d',
    accent: '#A4C3A2',
    chartId: 'JgXO3/2/',
  },
  cafe3: {
    name: 'Café 3',
    img: cafe3Img,
    desc: 'Café 3 is the only dining hall with a Kosher-certified food station and prioritizes halal service.',
    color: '#4a1942',
    accent: '#B5829A',
    chartId: 'kWcBp/1/',
  },
};

export default function ScrollyNew() {
  // Opens to Clark Kerr by default on first load
  const [activeHall, setActiveHall] = useState('clark');

  function toggleHall(key) {
    setActiveHall((prev) => (prev === key ? null : key));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
  }

  const hall = activeHall ? HALLS[activeHall] : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardsWrapper}>
        <h2 className={styles.cardsLabel}>Click on a dining hall to explore its menu data</h2>
        <div className={styles.cardsGrid}>
          {Object.entries(HALLS).map(([key, h]) => (
            <div
              key={key}
              role="button"
              tabIndex={0}
              className={styles.hallCard}
              style={
                activeHall === key
                  ? { borderColor: h.accent, boxShadow: `0 0 0 3px ${h.accent}33` }
                  : {}
              }
              onClick={() => toggleHall(key)}
              onKeyDown={(e) => e.key === 'Enter' && toggleHall(key)}
            >
              <div className={styles.cardBand} style={{ background: h.color }} />
              <span className={styles.cardHint} style={{ color: h.accent }}>Explore ↓</span>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{h.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.detailPanel}${activeHall ? ` ${styles.detailPanelOpen}` : ''}`}>
        {hall && (
          <div className={styles.detailInner}>
            <div className={styles.detailSidebar} style={{ background: hall.color }}>
              <img src={hall.img} alt={hall.name} className={styles.detailImg} />
              <div className={styles.detailHallName}>{hall.name}</div>
              <div className={styles.detailDesc}>{hall.desc}</div>
              <button
                type="button"
                className={styles.detailClose}
                onClick={() => setActiveHall(null)}
              >
                ✕ Close
              </button>
            </div>
            <div className={styles.detailContent}>
              <div className={styles.detailContentLabel} style={{ color: hall.accent }}>
                Menu Analysis
              </div>
              <div className={styles.dwContainer}>
                <DatawrapperChart chartId={hall.chartId} />
              </div>
            </div>
          </div>
        )}
      </div>

      <p className={styles.vizSource}>
        Chart: Anika Bhutani/The Daily Californian &nbsp;·&nbsp;
        Illustration: Dana Lim | Staff &nbsp;·&nbsp;
        Source:{' '}
        <a href="https://dining.berkeley.edu/menus/" target="_blank" rel="noreferrer">
          Berkeley Dining
        </a>
      </p>
    </div>
  );
}
