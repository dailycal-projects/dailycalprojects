import React, { useEffect, useRef, useState } from 'react';
import { getImage, GatsbyImage } from 'gatsby-plugin-image';

export default function TruckScene({ truckImg, roadImg, caption }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = Math.max(
        0,
        Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)),
      );
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const truckLeft = `${-15 + progress * 115}%`;
  const truckGImg = truckImg ? getImage(truckImg) : null;
  const roadGImg = roadImg ? getImage(roadImg) : null;

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: 210,
        overflow: 'hidden',
        margin: '48px 0',
        background: '#080808',
        borderRadius: 4,
      }}
    >
      {/* Road */}
      {roadGImg && (
        <div style={{
          position: 'absolute',
          width: '120%',
          left: '-10%',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.9,
        }}
        >
          <GatsbyImage image={roadGImg} alt="" />
        </div>
      )}

      {/* Truck */}
      {truckGImg && (
        <div style={{
          position: 'absolute',
          height: '72%',
          bottom: '10%',
          left: truckLeft,
          transition: 'left 0.04s linear',
          width: 220,
          filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.55))',
        }}
        >
          <GatsbyImage image={truckGImg} alt="Food delivery truck" style={{ height: '100%', objectFit: 'contain' }} />
        </div>
      )}

      {/* Caption */}
      {caption && (
        <div style={{
          position: 'absolute',
          right: 28,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 13,
          fontStyle: 'italic',
          maxWidth: 220,
          textAlign: 'right',
          lineHeight: 1.55,
          opacity: progress > 0.25 ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
