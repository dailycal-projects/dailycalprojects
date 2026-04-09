import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import * as styles from './styling/segment-scroller.module.css';
import { VideoPlayer } from './video-player';
import posterImage from '../../images/bug-video.jpg';

export const VideoScrollerSegment = () => null;

export const VideoScroller = ({ children }) => {
  // Video container references
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Segments
  const segments = React.Children.toArray(children);
  const segmentTextRefs = useRef([]);
  const [activeSegment, setActiveSegment] = useState(0);

  // Sticky video handler
  const splitRef = useRef(null);
  const [stickyStyle, setStickyStyle] = useState({});

  // Dark mode handler
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    function onScroll() {
      const TOP_OFFSET = 75;
      const DARK_MODE_THRESHOLD = 200;

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

      // Update dark mode
      setIsDarkMode(
        split.top <= DARK_MODE_THRESHOLD // Top is below dark mode threshold
        && split.bottom - videoContainer.bottom > 31, // Video hasn't reached the end
      );

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

  // Handle dark mode transition
  useEffect(() => {
    const topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = isDarkMode ? '#080808' : '';
    topBar.style.borderBottom = isDarkMode ? '1px solid #2b2b2b' : '';

    const logo = document.getElementById('logo');
    logo.style.filter = isDarkMode ? 'invert(1)' : '';

    document.body.style.transition = '.2s background ease';
    document.body.style.background = isDarkMode ? '#0a0a0a' : '';

    const root = document.querySelector(':root');
    root.style.setProperty('--segment-color', isDarkMode ? 'hsla(0,0%,100%,0.8)' : 'hsla(0,0%,0%,0.8)');
    root.style.setProperty('--segment-bg', isDarkMode ? 'black' : 'white');
    root.style.setProperty('--segment-border-active', isDarkMode ? 'white' : 'black');
  }, [isDarkMode]);

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
          <VideoPlayer
            src={[{ src: segments[activeSegment].props.src, type: segments[activeSegment].props.type }]}
            poster={posterImage}
            alt="Body-worn camera footage clip."
            title={segments[activeSegment].props.clipTitle}
            ref={videoRef}
          />
        </div>
      </div>
    </div>
  );
};
