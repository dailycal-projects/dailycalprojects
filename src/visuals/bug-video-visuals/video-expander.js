import gsap from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import * as styles from './styling/video-expander.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const VideoExpander = ({ src }) => {
  const containerRef = useRef(null);
  const zoomRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current || !zoomRef.current) return;

    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'center center',
        end: '+=1500',
        scrub: true,
        pin: true,
        anticipatePin: 1,
        markers: true,
      },
    });

    // Start element small
    tl.fromTo(
      zoomRef.current,
      { scale: 0.5 },
      { scale: 2.0, ease: 'cubic', duration: 1 },
    );

    tl.to(
      zoomRef.current,
      { scale: 0.5, ease: 'cubic', duration: 1 },
    );
  });

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.zoomElement} ref={zoomRef} />
    </div>
  );
};
