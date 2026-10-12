import React, { useEffect, useRef, useState } from 'react';
import { labNote, manhattanNote } from './notes';
import './css/story.css';
import './css/intro.css';
import './css/parking-lot.css';
import './css/decade.css';
import './css/age-chart.css';
import './css/year-timeline.css';
import './css/map-story.css';
import './css/story-index.css';
import './css/host.css';

export function NobelNote({ kind, children }) {
  return (
    <mark
      className={kind === 'lab' ? 'lab-mention' : 'manhattan-mention'}
      data-info={kind === 'lab' ? labNote : manhattanNote}
      tabIndex={0}
    >
      {children}
    </mark>
  );
}

// The article template owns the masthead, metadata, prose and footer. This
// component owns only the graphic and its scroll steps, supplied by MDX.
export default function NobelScrolly({ children }) {
  const rootRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose;
    import('./runtime')
      .then(({ mountNobel }) => {
        if (!cancelled) dispose = mountNobel(rootRef.current);
      })
      .catch((cause) => {
        if (!cancelled) {
          console.error('The Nobel graphics could not load.', cause);
          setError(true);
        }
      });
    return () => {
      cancelled = true;
      if (dispose) dispose();
    };
  }, []);

  return (
    <div className="nobel-visuals" ref={rootRef}>
      {error && (
        <p role="alert">
          The Nobel graphics could not load. Please reload the page.
        </p>
      )}
      <section
        className="intro-scrolly"
        aria-label="Berkeley-connected Nobel laureates"
      >
        <figure className="intro-visual">
          <div className="intro-visual__composition">
            <h2 className="intro-visual__heading">63 Laureates</h2>
            <div
              className="intro-visual__grid"
              id="intro-portrait-grid"
              aria-label="Berkeley-connected Nobel laureates"
            ></div>
          </div>
          <div className="parking-lot__canvas">
            <svg
              className="parking-lot__svg parking-lot__svg--desktop"
              viewBox="0 0 1200 510"
              role="img"
              aria-label="Five parking bays for the Nobel Prize fields"
            >
              <rect
                className="parking-lot__asphalt"
                x="24"
                y="45"
                width="1152"
                height="420"
                fill="#272b2f"
              />
              <path
                className="parking-lot__stripe"
                pathLength="1"
                d="M24 356 Q318 354 600 357 T1176 355"
              />
              <g className="parking-lot__stalls">
                <path pathLength="1" d="M85 95 Q83 252 85 426" />
                <path pathLength="1" d="M290 95 Q292 248 290 426" />
                <path pathLength="1" d="M495 95 Q493 255 495 426" />
                <path pathLength="1" d="M700 95 Q702 245 700 426" />
                <path pathLength="1" d="M905 95 Q903 257 905 426" />
                <path pathLength="1" d="M1110 95 Q1112 251 1110 426" />
              </g>
              <g className="parking-lot__dots"></g>
            </svg>
            <svg
              className="parking-lot__svg parking-lot__svg--mobile"
              viewBox="0 0 500 770"
              role="img"
              aria-label="Five parking bays for the Nobel Prize fields"
            >
              <rect
                className="parking-lot__asphalt"
                x="15"
                y="25"
                width="470"
                height="720"
                fill="#272b2f"
              />
              <path
                className="parking-lot__stripe"
                pathLength="1"
                d="M165 25 Q163 382 166 745"
              />
              <g className="parking-lot__stalls">
                <path pathLength="1" d="M27 60 Q238 58 475 60" />
                <path pathLength="1" d="M27 190 Q241 192 475 190" />
                <path pathLength="1" d="M27 320 Q236 318 475 320" />
                <path pathLength="1" d="M27 450 Q244 452 475 450" />
                <path pathLength="1" d="M27 580 Q237 578 475 580" />
                <path pathLength="1" d="M27 710 Q239 712 475 710" />
              </g>
              <g className="parking-lot__dots"></g>
            </svg>
            <div className="parking-lot__labels">
              <div className="parking-lot__field" data-category="Physics">
                <span className="parking-lot__name">Physics</span>
                <span className="parking-lot__count"></span>
              </div>
              <div className="parking-lot__field" data-category="Chemistry">
                <span className="parking-lot__name">Chemistry</span>
                <span className="parking-lot__count"></span>
              </div>
              <div className="parking-lot__field" data-category="Economics">
                <span className="parking-lot__name">Economics</span>
                <span className="parking-lot__count"></span>
              </div>
              <div
                className="parking-lot__field"
                data-category="Physiology or Medicine"
              >
                <span className="parking-lot__name">Medicine</span>
                <span className="parking-lot__count"></span>
              </div>
              <div className="parking-lot__field" data-category="Literature">
                <span className="parking-lot__name">Literature</span>
                <span className="parking-lot__count"></span>
              </div>
            </div>
          </div>
          <div
            className="decade-chart"
            aria-label="Berkeley Nobel laureates by decade"
          >
            <svg
              className="decade-chart__svg decade-chart__svg--desktop"
              viewBox="0 0 1200 520"
              role="img"
              aria-label="Nobel laureates from the 1930s through the 2020s, colored by prize field"
            ></svg>
            <svg
              className="decade-chart__svg decade-chart__svg--mobile"
              viewBox="0 0 500 770"
              role="img"
              aria-label="Nobel laureates from the 1930s through the 2020s, colored by prize field"
            ></svg>
          </div>
          <div className="age-chart" aria-label="Age at award by decade">
            <svg
              className="age-chart__svg age-chart__svg--desktop"
              viewBox="0 0 1200 520"
              role="img"
              aria-label="Individual ages and average age at award by decade"
            ></svg>
            <svg
              className="age-chart__svg age-chart__svg--mobile"
              viewBox="0 0 500 770"
              role="img"
              aria-label="Individual ages and average age at award by decade"
            ></svg>
          </div>
          <div
            className="year-story"
            aria-label="Berkeley Nobel laureates by year"
          ></div>
          <div
            className="faculty-story"
            aria-label="Berkeley faculty laureates"
          ></div>
          <div
            className="map-story"
            aria-label="Laureates grouped by country of birth"
          ></div>
          <div className="intro-visual__footer">
            <div
              className="intro-visual__key"
              aria-label="Portrait border colors show Nobel Prize category"
            ></div>
          </div>
        </figure>
        <div className="intro-scrolly__steps">{children}</div>
      </section>
      <dialog
        className="intro-profile"
        id="intro-profile"
        aria-labelledby="intro-profile-name"
      >
        <button
          className="intro-profile__close"
          type="button"
          aria-label="Close profile"
        >
          ×
        </button>
        <div className="intro-profile__content" />
      </dialog>
      <div
        id="laureate-tooltip"
        className="laureate-tooltip"
        role="tooltip"
        hidden
      />
    </div>
  );
}
