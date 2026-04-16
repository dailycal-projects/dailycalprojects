import React, { useEffect, useRef, useState } from 'react';
import * as styles from '../styling/video-scroller.module.css';
import { DCVideoPlayer } from './dc-video-player';

export const VideoScrollerSegment = () => null;

export const VideoScroller = ({ children }) => {
  // Video container references
  const videoContainerRef = useRef(null);

  // Segments
  const segments = React.Children.toArray(children);
  const segmentTextRefs = useRef([]);
  const videoPlayerRefs = useRef([]);
  const [activeSegment, setActiveSegment] = useState(0);

  // Compute video aspect ratio, taking into account scrubber height
  const getEffectiveContainerAspectRatio = () => {
    const videoAspectRatio = segments[activeSegment]?.props?.aspectRatio || 16 / 9;
    const width = videoContainerRef.current?.getBoundingClientRect().width || 0;

    if (width <= 0) return videoAspectRatio;

    const videoHeight = width / videoAspectRatio;
    return width / (videoHeight + 12); // include scrubber height
  };

  // Sticky video handler
  const splitRef = useRef(null);
  const [stickyStyle, setStickyStyle] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    function onScroll() {
      const isMobile = window.innerWidth < 600;

      if (isMobile !== isMobileView) {
        setIsMobileView(isMobile);
      }

      // Update video stickiness
      if (!splitRef.current || !videoContainerRef.current) return;

      const split = splitRef.current.getBoundingClientRect();
      const videoContainer = videoContainerRef.current.getBoundingClientRect();

      const TOP_OFFSET = isMobile ? (videoContainer.bottom || 0) : 75;

      // Desktop: center in viewport while sticky.
      // Mobile: stick to top of the container for the full section duration.
      if (isMobile) {
        setStickyStyle({
          position: 'sticky',
          top: '75px',
        });
      } else {
        const stickyTop = (window.innerHeight - videoContainer.height) / 2;

        if (split.top <= stickyTop) {
          setStickyStyle({
            position: 'sticky',
            top: `${stickyTop}px`,
          });
        }
      }

      // Update active segment
      for (let s = 0; s < segments.length; s++) {
        // Get element
        const el = segmentTextRefs.current[s];
        if (!el) continue;
        const segment = el.getBoundingClientRect();
        const top = isMobile
          ? (segment.top + (segment.height * 0.75))
          : segment.top;

        if (top >= TOP_OFFSET) {
          // This is the first element to be below the TOP_OFFSET
          if (s !== activeSegment) {
            // Active segment has changed!
            videoPlayerRefs.current[activeSegment].pause();
            setActiveSegment(s);

            // Restart and play next video:
            videoPlayerRefs.current[s].seek(0);
            videoPlayerRefs.current[s].play(true);
          }
          break;
        }
      }
    }

    // Assign listener and run on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    // Unmount handler
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [activeSegment, isMobileView]);

  // Play/pause on enter and leave
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Scroller has entered the page
          videoPlayerRefs.current[activeSegment].play(true);
        } else {
          // Scroller has left the page
          videoPlayerRefs.current[activeSegment].pause();
        }

        // Pausing on scroll out is redundant because its handled by dc-video-player.
      }, {
        threshold: 0.3,
      },
    );

    // Attach observer
    const split = splitRef.current;
    if (split) observer.observe(split);

    // Clean up
    return () => {
      if (split) observer.unobserve(split);
      observer.disconnect();
    };
  }, [activeSegment]);

  return (
    <div className={styles.videoScrollerContainer} ref={splitRef}>
      {/* Text descriptions */}
      <div className={styles.textSide}>
        {segments.map((segment, i) => (
          <div
            className={styles.segmentText}
            data-active={activeSegment === i}
            ref={(el) => (segmentTextRefs.current[i] = el)}
            key={i}
            style={{
              borderTop: i !== 0 ? '1px solid black' : '',
              paddingTop: i !== 0 ? 'calc(1.45rem + 15px)' : '',
            }}
          >
            {segment.props.children}
          </div>
        ))}
      </div>

      {/* Video section */}
      <div className={styles.videoSide} style={isMobileView ? stickyStyle : {}}>
        <div
          className={styles.videoContainer}
          style={{
            ...(!isMobileView ? stickyStyle : {}),
            aspectRatio: getEffectiveContainerAspectRatio(),
          }}
          ref={videoContainerRef}
        >
          {segments.map((segment, i) => (
            <div
              className={styles.videoLayer}
              data-active={i === activeSegment}
              key={i}
            >
              <DCVideoPlayer
                src={segment.props.src}
                type={segment.props.type}
                aspectRatio={segment.props.aspectRatio}
                ref={(el) => (videoPlayerRefs.current[i] = el)}
                pauseOnScrollOut={false}
                externalSourceLink={segment.props.externalSourceLink}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
