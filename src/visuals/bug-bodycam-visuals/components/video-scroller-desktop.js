import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import * as styles from '../styling/video-scroller.module.css';
import { DCVideoPlayer } from './dc-video-player';

export const VideoScrollerSegment = () => null;

export const VideoScroller = ({ children }) => {
  // Video container references
  const videoContainerRef = useRef(null);

  // Segments
  const segments = React.Children.toArray(children);
  const segmentTextRefs = useRef([]);
  const [activeSegment, setActiveSegment] = useState(0);

  // Sticky video handler
  const splitRef = useRef(null);
  const [stickyStyle, setStickyStyle] = useState({});

  useEffect(() => {
    function onScroll() {
      const TOP_OFFSET = 75;

      // Update video stickiness
      if (!splitRef.current || !videoContainerRef.current) return;

      const split = splitRef.current.getBoundingClientRect();
      const videoContainer = videoContainerRef.current.getBoundingClientRect();

      if (split.top <= TOP_OFFSET) {
        // Video is below TOP_OFFSET, make sticky to page
        setStickyStyle({
          position: 'sticky',
          top: `${TOP_OFFSET}px`,
        });
      } else {
        // Remove sticky styling
        setStickyStyle({});
      }

      // Update active segment
      for (let s = 0; s < segments.length; s++) {
        // Get element
        const el = segmentTextRefs.current[s];
        if (!el) continue;
        const segment = el.getBoundingClientRect();

        if (segment.top >= TOP_OFFSET) {
          // This is the first element to be below the TOP_OFFSET
          setActiveSegment(s);
          break;
        }
      }
    }

    // Assign listener and run on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Unmount handler
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.videoScrollerContainer} ref={splitRef}>
      {/* Preload videos */}
      <Helmet>
        {segments.map((s) => {
          if (s.props.src) {
            return (
              <link rel="preload" href={s.props.src} as="fetch" type={s.props.type} />
            );
          }
        })}
      </Helmet>

      {/* Text descriptions */}
      <div className={styles.textSide}>
        {segments.map((segment, i) => (
          <div
            className={styles.segmentText}
            data-active={activeSegment === i}
            ref={(el) => (segmentTextRefs.current[i] = el)}
            key={i}
          >
            {segment.props.children}
          </div>
        ))}
      </div>

      {/* Video section */}
      <div className={styles.videoSide}>
        <div className={styles.videoContainer} style={stickyStyle} ref={videoContainerRef}>
          <DCVideoPlayer
            src={segments[activeSegment].props.src}
            type={segments[activeSegment].props.type}
          />
        </div>
      </div>
    </div>
  );
};
