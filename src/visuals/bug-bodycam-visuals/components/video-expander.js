import gsap from 'gsap';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import * as styles from '../styling/video-expander.module.css';
import { DCVideoPlayer } from './dc-video-player';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const VideoExpander = ({ src, type = 'video/mp4' }) => {
  // References
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const videoRef = useRef(null);

  // Video state
  const shouldPlayRef = useRef(false);
  const [showControls, setShowControls] = useState(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Init scroll animation
  useGSAP(() => {
    if (!containerRef.current || !zoomRef.current) return;

    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'center center+=25px',
        end: '+=1500',
        scrub: true,
        pin: true,
        anticipatePin: 1,

        // Callback to play video and set dark mode
        onUpdate: (self) => {
          const shouldPlayNow = self.progress > 0.27 && self.progress < 1.0;

          // Only request play/pause when shouldPlayNow changes, not every frame
          if (shouldPlayNow !== shouldPlayRef.current) {
            shouldPlayRef.current = shouldPlayNow;

            if (shouldPlayNow) {
              videoRef.current.play();
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
      { scale: 0.375 },
      {
        scale: 1.0,
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

    // Buffer at end
    tl.to({}, { duration: 0.25 });
  });

  // Handle dark mode transition
  useEffect(() => {
    setBackgroundDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Handle controls show/hide
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.setControlsShown(showControls);
  }, [showControls]);

  return (
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
        />
      </div>
    </div>
  );
};

export function setBackgroundDarkMode(darkMode) {
  const topBar = document.getElementById('topBar');
  topBar.style.backgroundColor = darkMode ? '#080808' : '';
  topBar.style.borderBottom = darkMode ? '1px solid #2b2b2b' : '';

  const logo = document.getElementById('logo');
  logo.style.filter = darkMode ? 'invert(1)' : '';

  document.body.style.transition = '.2s background ease';
  document.body.style.background = darkMode ? '#0a0a0a' : '';
}
