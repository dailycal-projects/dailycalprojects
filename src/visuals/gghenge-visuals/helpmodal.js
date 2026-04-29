import React from 'react';
import * as styles from '../GGHMap.module.css';

export default function HelpModal({ onClose }) {
  return (
    <div
      className={styles.helpModal}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.helpBox}>
        <div className={styles.popupName}>How to use this site</div>
        <div className={styles.popupRow}>• Use this site to find locations and times to see Golden Gate Henge (GGH).</div>
        <div className={styles.popupRow}>• Drag the slider to change the date.</div>
        <div className={styles.popupRow}>• The gold band shows valid areas to view GGH on a given date.</div>
        <div className={styles.popupRow}>• Red and blue pins show selected viewing locations off- and on-campus.</div>
        <div className={styles.popupRow}>• Click any pin to get more details, including sunset time, GGH dates, and ratings.</div>
        <div className={styles.popupRow}>• Click anywhere on the map to drop a pin and get sunset time.</div>
        <div className={styles.popupRow}>• Use the search bar to search for pins, addresses, or coordinates, then hit Enter.</div>
        <div className={styles.popupRow}>• Click "Filter by Date" to see only valid pins for a given date.</div>
        <div className={styles.popupRow}>• Click "Today" to go to today's date.</div>
        <div className={styles.popupRow}>• Click "Reset" to reset the search and map filters.</div>
        <button type="button" className={`${styles.btn} ${styles.helpClose}`} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}