import React, { useEffect, useRef, useState } from 'react';
import { getImage, GatsbyImage } from 'gatsby-plugin-image';

const TOTAL = 30;
const REUSABLE_INDICES = [4, 7, 9, 12, 15, 17, 20, 22, 24, 26, 28];

export default function ContainerVis({ containerImg, monsoonImg }) {
  const [flipped, setFlipped] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)),
      );
      setFlipped(Math.floor(progress * REUSABLE_INDICES.length));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const reusableSet = new Set(REUSABLE_INDICES.slice(0, flipped));
  const containerGatsbyImg = containerImg ? getImage(containerImg) : null;
  const monsoonGatsbyImg = monsoonImg ? getImage(monsoonImg) : null;

  return (
    <div ref={ref} style={{ position: 'relative', minHeight: 160 }}>

      {/* Semi-transparent background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        padding: '20px 0',
        justifyContent: 'center',
        alignContent: 'flex-start',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => {
          const isReusable = reusableSet.has(i);
          const img = isReusable ? monsoonGatsbyImg : containerGatsbyImg;
          return img ? (
            <div
              key={i}
              style={{
                width: 52,
                height: 52,
                transition: 'filter 0.5s ease',
                filter: isReusable ? 'drop-shadow(0 0 6px rgba(45,106,45,0.8))' : 'none',
              }}
            >
              <GatsbyImage image={img} alt="" style={{ width: 52, height: 52, objectFit: 'contain' }} />
            </div>
          ) : (
            <div
              key={i}
              style={{
                width: 52,
                height: 52,
                borderRadius: 4,
                background: isReusable ? '#C97B6355' : '#ddd',
                transition: 'background 0.5s ease',
              }}
            />
          );
        })}
      </div>

      {/* Stat card on top */}
      <div style={{ position: 'relative', zIndex: 1, padding: '8px 0' }}>
        <div style={{
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          maxWidth: 440,
        }}
        >
          {monsoonGatsbyImg && (
            <div style={{ width: 70, flexShrink: 0 }}>
              <GatsbyImage image={monsoonGatsbyImg} alt="Monsoon reusable container" />
            </div>
          )}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2d6a2d', marginBottom: 4,
            }}
            >
              Sustainability Initiative
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2,
            }}
            >
              {flipped}
              {' '}
              of
              {REUSABLE_INDICES.length}
              {' '}
              containers replaced
            </div>
            <div style={{ fontSize: 12.5, color: '#777', marginTop: 4 }}>
              at Monsoon Kitchens — with plans to expand campus-wide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
