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
    color: '#3d2b1f',
    accent: '#C4956A',
    chartId: '2BrGR/4/',
  },
  crossroads: {
    name: 'Crossroads',
    img: croadsImg,
    color: '#003262',
    accent: '#FDB515',
    chartId: 'R2Ljp/1/',
  },
  foothill: {
    name: 'Foothill',
    img: foothillImg,
    color: '#2d4a2d',
    accent: '#A4C3A2',
    chartId: 'JgXO3/2/',
  },
  cafe3: {
    name: 'Café 3',
    img: cafe3Img,
    color: '#4a1942',
    accent: '#B5829A',
    chartId: 'kWcBp/1/',
  },
};

export default function ScrollyNew() {
  const [activeHall, setActiveHall] = useState('clark');
  const [chartReady, setChartReady] = useState(true);

  function toggleHall(key) {
    const next = activeHall === key ? null : key;
    setActiveHall(next);
    setChartReady(false);
    setTimeout(() => setChartReady(true), 460);
  }

  const hall = activeHall ? HALLS[activeHall] : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardsWrapper}>
        <h2 className={styles.cardsLabel}>Click on a dining hall to explore its menu data</h2>
        <div className={styles.cardsGrid}>
          {Object.entries(HALLS).map(([key, h]) => {
            const isActive = activeHall === key;
            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                className={styles.hallCard}
                style={
                  isActive
                    ? { borderColor: h.accent, boxShadow: `0 0 0 3px ${h.accent}33` }
                    : {}
                }
                onClick={() => toggleHall(key)}
                onKeyDown={(e) => e.key === 'Enter' && toggleHall(key)}
              >
                <div className={styles.cardBand} style={{ background: h.color }} />

                {/* Illustration lives in the card now */}
                <div
                  className={styles.cardImgWrap}
                  style={{ background: isActive ? `${h.color}18` : '#f4f4f2' }}
                >
                  <img src={h.img} alt={h.name} className={styles.cardImg} />
                </div>

                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>{h.name}</div>
                  {isActive ? (
                    <span className={styles.cardHintActive} style={{ color: h.accent }}>
                      Menu Analysis ▲
                    </span>
                  ) : (
                    <span className={styles.cardHint} style={{ color: h.accent }}>
                      Explore ↓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel — chart only, no sidebar */}
      <div className={`${styles.detailPanel}${activeHall ? ` ${styles.detailPanelOpen}` : ''}`}>
        {hall && (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <div className={styles.detailContentLabel} style={{ color: hall.accent }}>
                {hall.name} — Menu Analysis
              </div>
            </div>
            <div className={styles.detailContent}>
              <div className={styles.dwContainer}>
                {chartReady && <DatawrapperChart chartId={hall.chartId} />}
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