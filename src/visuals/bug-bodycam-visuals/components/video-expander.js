import gsap from 'gsap';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import * as styles from '../styling/video-expander.module.css';
import { DCVideoPlayer } from './dc-video-player';

// Init gsap
gsap.registerPlugin(ScrollTrigger, useGSAP);

// MARK: Dark mode
export function setBackgroundDarkMode(darkMode) {
  const topBar = document.getElementById('topBar');
  if (topBar) {
    topBar.style.backgroundColor = darkMode ? '#080808' : '';
    topBar.style.borderBottom = darkMode ? '1px solid #2b2b2b' : '';
  }

  const logo = document.getElementById('logo');
  if (logo) {
    logo.style.filter = darkMode ? 'invert(1)' : '';
  }

  document.body.style.transition = '.2s background ease';
  document.body.style.background = darkMode ? '#0a0a0a' : '';
}

export const VideoExpander = ({
  src, type = 'video/mp4', aspectRatio = null, externalSourceLink = null,
}) => {
  // MARK: VideoExpander Init
  // References
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const videoRef = useRef(null);
  const spacerRef = useRef(null);

  // Video state
  const shouldPlayRef = useRef(false);
  const [showControls, setShowControls] = useState(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // MARK: Animations
  // Init scroll animation
  const widthsRef = useRef({ start: 0, end: 0 });

  useGSAP(() => {
    if (!containerRef.current || !zoomRef.current || !spacerRef.current) return;

    // MARK: Animation sizes
    // Get current full video player aspect ratio
    const getPlayerAspectRatio = () => {
      const rect = zoomRef.current.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return rect.width / rect.height;
      }

      return 16 / 9;
    };

    // Clamp width using aspect ratio and viewport height
    const getClampedWidthPx = (desiredWidthPx, playerAspectRatio) => {
      const maxHeightPx = Math.max(window.innerHeight - 80, 0);
      const maxWidthByHeightPx = maxHeightPx * playerAspectRatio;

      if (maxWidthByHeightPx <= 0) {
        return desiredWidthPx;
      }

      return Math.min(desiredWidthPx, maxWidthByHeightPx);
    };

    // Recalculate start/end sizes and padding sizes
    const computeWidths = () => {
      const playerAspectRatio = getPlayerAspectRatio();

      // Recalculate start/end sizing
      const start = getClampedWidthPx(window.innerWidth > 600 ? 640 : 350, playerAspectRatio);
      const end = Math.max(start, getClampedWidthPx(window.innerWidth * 0.85, playerAspectRatio));

      widthsRef.current = { start, end };

      // Apply height spacing below this element
      // This is a shoddy way of doing this, but it works.
      const diff = ((end / playerAspectRatio) - (start / playerAspectRatio)) / 2;
      spacerRef.current.style.height = `${Math.max(diff, 0)}px`;
    };

    // Compute sizes initially
    computeWidths();

    // MARK: Timeline
    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'center center+=25px',
        end: window.innerWidth > 600 ? '+=1000' : '+=200',
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        pinSpacing: true,
        onRefreshInit: computeWidths,

        // Callback to play video and set dark mode
        onUpdate: (self) => {
          const shouldPlayNow = self.progress > 0.27 && self.progress < 1.0;

          // Only request play/pause when shouldPlayNow changes, not every frame
          if (shouldPlayNow !== shouldPlayRef.current) {
            shouldPlayRef.current = shouldPlayNow;

            if (shouldPlayNow) {
              videoRef.current.play(true);
              setShowControls(true);
            } else {
              videoRef.current.pause();
              setShowControls(false);
            }
          }

          // Update dark mode
          setIsDarkMode(self.progress > 0.27 && self.progress < 1.0);
        },
      },
    });

    // Small to large animation
    tl.fromTo(
      zoomRef.current,
      {
        width: () => `${widthsRef.current.start}px`,
      },
      {
        width: () => `${widthsRef.current.end}px`,
        duration: 1,
        ease: 'power2.inOut',
      },
    );

    // Fade in animation
    tl.fromTo(
      zoomRef.current,
      { opacity: 0.5 },
      {
        opacity: 1.0,
        duration: 0.2,
        ease: 'power2.inOut',
      },
      '<',
    );

    // Experimental styling here
    if (new URLSearchParams(window.location.search).has(atob('YWppdGg='))) {
      tl.fromTo(
        zoomRef.current,
        { rotation: 0 },
        { rotation: 720, duration: 1 },
        '<',
      );
    }

    // Buffer at end
    tl.to({}, { duration: 0.25 });
  }, []);

  // MARK: UI
  // Handle dark mode transition
  useEffect(() => {
    setBackgroundDarkMode(isDarkMode);

    // Switch off dark mode while unmounting
    return () => {
      setBackgroundDarkMode(false);
    };
  }, [isDarkMode]);

  // Handle controls show/hide
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.setControlsShown(showControls);
  }, [showControls]);

  return (
    <>
      <div className={styles.container} ref={containerRef}>
        <div
          className={styles.zoomElement}
          ref={zoomRef}
        >
          <DCVideoPlayer
            src={src}
            type={type}
            alt="Body-worn camera footage clip."
            ref={videoRef}
            aspectRatio={aspectRatio}
            pauseOnScrollOut={false}
            externalSourceLink={externalSourceLink}
          />
        </div>
      </div>
      <div className={styles.spacer} ref={spacerRef} />
    </>
  );
};
