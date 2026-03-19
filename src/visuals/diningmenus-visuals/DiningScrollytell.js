import React, { useEffect, useRef, useState } from 'react';
import { getImage, GatsbyImage } from 'gatsby-plugin-image';

const HALL_META = [
  {
    key: 'clark',
    name: 'Clark Kerr',
    originX: 12,
    color: '#3d2b1f',
    accent: '#C4956A',
    caption: 'Clark Kerr had the highest proportion of allergen-containing items of the four dining halls, particularly gluten, milk and egg.',
    fact: 'Unique menu items: 312',
  },
  {
    key: 'crossroads',
    name: 'Crossroads',
    originX: 37,
    color: '#003262',
    accent: '#FDB515',
    caption: "Crossroads is Berkeley Dining's flagship facility and the largest dining hall on campus.",
    fact: 'Serves breakfast, lunch & dinner daily',
  },
  {
    key: 'foothill',
    name: 'Foothill',
    originX: 63,
    color: '#2d4a2d',
    accent: '#A4C3A2',
    caption: 'Foothill had the fewest allergen-containing items of all four dining halls.',
    fact: 'Lowest allergen load on campus',
  },
  {
    key: 'cafe3',
    name: 'Café 3',
    originX: 88,
    color: '#4a1942',
    accent: '#B5829A',
    caption: 'Café 3 is the only dining hall with a Kosher-certified food station and prioritizes halal service.',
    fact: 'Only hall with Kosher certification',
  },
];

// Steps: intro → 4 halls → outro
const STEPS = [
  { type: 'intro' },
  { type: 'hall', index: 0 },
  { type: 'hall', index: 1 },
  { type: 'hall', index: 2 },
  { type: 'hall', index: 3 },
  { type: 'outro' },
];

export default function DiningScrollytell({
  buildingsImg, clarkImg, croadsImg, foothillImg, cafe3Img,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const stepRefs = useRef([]);

  // Map hall index → image
  const hallImages = [clarkImg, croadsImg, foothillImg, cafe3Img];

  useEffect(() => {
    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i); },
        { threshold: 0.5 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, []);

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(t);
  }, [activeStep]);

  const step = STEPS[activeStep];
  const isHall = step.type === 'hall';
  const hall = isHall ? HALL_META[step.index] : null;
  const hallImg = isHall ? hallImages[step.index] : null;

  const getZoomTransform = () => {
    if (!isHall) return 'scale(1) translate(0, 0)';
    const tx = (50 - hall.originX) * 0.55;
    return `scale(2.6) translate(${tx}%, -6%)`;
  };

  return (
    <div style={{ position: 'relative', margin: '0 -20px', fontFamily: 'inherit' }}>

      {/* ── STICKY VISUAL PANEL ───────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: '#080808',
        zIndex: 10,
      }}
      >

        {/* Buildings strip — always rendered, zooms toward active hall */}
        {buildingsImg && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            opacity: isHall && revealed ? 0 : 1,
            transition: 'opacity 0.45s ease',
            pointerEvents: 'none',
          }}
          >
            <div style={{
              width: '100%',
              maxWidth: 1100,
              transformOrigin: hall ? `${hall.originX}% 80%` : '50% 80%',
              transform: getZoomTransform(),
              transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            >
              <GatsbyImage image={getImage(buildingsImg)} alt="Berkeley dining halls" />
            </div>
          </div>
        )}

        {/* Individual hall panel — slides in after zoom */}
        {isHall && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            opacity: revealed ? 1 : 0,
            transition: 'opacity 0.5s ease 0.1s',
          }}
          >
            {/* Left sidebar: hall identity */}
            <div style={{
              width: 220,
              flexShrink: 0,
              background: hall.color,
              borderRight: `4px solid ${hall.accent}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 18px',
              gap: 18,
            }}
            >
              {hallImg && (
                <div style={{ width: '100%', maxWidth: 160 }}>
                  <GatsbyImage image={getImage(hallImg)} alt={hall.name} />
                </div>
              )}
              <div style={{
                color: hall.accent,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
              >
                {hall.name}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 12.5,
                textAlign: 'center',
                lineHeight: 1.55,
                fontStyle: 'italic',
              }}
              >
                {hall.caption}
              </div>
              <div style={{
                marginTop: 8,
                background: `${hall.accent}22`,
                border: `1px solid ${hall.accent}55`,
                borderRadius: 6,
                padding: '8px 12px',
                color: hall.accent,
                fontSize: 11.5,
                fontWeight: 600,
                textAlign: 'center',
                letterSpacing: '0.03em',
              }}
              >
                {hall.fact}
              </div>
            </div>

            {/* Right: menu heatmap for this hall */}
            <div style={{
              flex: 1, background: '#fff', overflow: 'auto', padding: '28px 32px',
            }}
            >
              <HallMenuHeatmap hallName={hall.name} hallColor={hall.color} hallAccent={hall.accent} />
            </div>
          </div>
        )}

        {/* Intro overlay */}
        {step.type === 'intro' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '0 40px',
            background: 'rgba(0,0,0,0.5)',
          }}
          >
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FDB515', marginBottom: 14,
            }}
            >
              Berkeley Dining · Four Halls
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(26px, 4vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 16,
              maxWidth: 600,
            }}
            >
              Scroll to explore each dining hall
            </h2>
            <p style={{
              fontSize: 15.5, color: 'rgba(255,255,255,0.65)', maxWidth: 440, lineHeight: 1.65,
            }}
            >
              Search any menu item to see which days of the week it appears at Clark Kerr, Crossroads, Foothill, and Café 3.
            </p>
            <p style={{
              marginTop: 44, color: 'rgba(255,255,255,0.35)', fontSize: 12, letterSpacing: '0.08em',
            }}
            >
              ↓ scroll
            </p>
          </div>
        )}

        {/* Outro overlay */}
        {step.type === 'outro' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '0 48px',
            background: 'rgba(0,0,0,0.6)',
          }}
          >
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(20px, 3vw, 34px)',
              fontWeight: 600,
              fontStyle: 'italic',
              maxWidth: 540,
              lineHeight: 1.45,
              color: 'rgba(255,255,255,0.92)',
            }}
            >
              "Each dining commons has its own culinary identity, kitchen configuration, and service model."
            </p>
            <p style={{
              marginTop: 18, fontSize: 13, color: '#FDB515', letterSpacing: '0.06em',
            }}
            >
              — Lindsey Michels, Berkeley Dining
            </p>
          </div>
        )}

        {/* Hall step indicator dots */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          zIndex: 20,
        }}
        >
          {HALL_META.map((h, i) => (
            <div
              key={h.key}
              style={{
                width: activeStep === i + 1 ? 22 : 7,
                height: 7,
                borderRadius: 4,
                background: activeStep === i + 1 ? h.accent : 'rgba(255,255,255,0.25)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── SCROLL TRIGGERS (invisible, stacked behind sticky) ── */}
      <div style={{ position: 'relative', zIndex: 20, marginTop: '-100vh' }}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            ref={(el) => (stepRefs.current[i] = el)}
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: s.type === 'hall' ? 'flex-end' : 'center',
              padding: '0 40px',
              pointerEvents: 'none',
            }}
          >
            {s.type === 'hall' && (
              <div style={{
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${HALL_META[s.index].accent}44`,
                borderRadius: 8,
                padding: '14px 20px',
                maxWidth: 200,
                pointerEvents: 'none',
              }}
              >
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: HALL_META[s.index].accent, marginBottom: 5,
                }}
                >
                  Hall
                  {' '}
                  {s.index + 1}
                  {' '}
                  of 4
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 700, color: 'white',
                }}
                >
                  {HALL_META[s.index].name}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── INLINE HEATMAP (replaces the HTML file iframes) ────────────────────────
// Reads from allMenus data embedded at build time via GraphQL, or falls back
// to a search UI powered by a passed-in dataset prop.
// For simplicity in the Gatsby MDX context this is a search + D3-style
// pure-React heatmap that parents pass allMenus data into via window or
// Gatsby's StaticQuery. The component self-contains all logic.

function HallMenuHeatmap({ hallName, hallColor, hallAccent }) {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [acOpen, setAcOpen] = useState(false);
  const [dayCounts, setDayCounts] = useState({});
  const [allItems, setAllItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load CSV on mount
  useEffect(() => {
    fetch('allMenus.csv')
      .then((r) => { if (!r.ok) throw new Error('not found'); return r.text(); })
      .then((text) => {
        const rows = parseCSV(text);
        const hallRows = rows.filter((r) => {
          const loc = (r.Location || '').replace(/_/g, ' ').trim();
          return loc.toLowerCase() === hallName.toLowerCase();
        });
        hallRows.forEach((r) => {
          const s = r.Date || '';
          if (s.length === 8) {
            const dt = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
            const dow = dt.getDay();
            r._day = DAYS[dow === 0 ? 6 : dow - 1];
          } else { r._day = null; }
        });
        const items = [...new Set(hallRows.map((r) => r.Item_Name).filter(Boolean))].sort();
        setAllItems(items);
        // Store rows in a ref-like closure
        window.__diningRows = window.__diningRows || {};
        window.__diningRows[hallName] = hallRows;
        setLoaded(true);
      })
      .catch(() => setLoadError(true));
  }, [hallName]);

  const handleInput = (val) => {
    setQuery(val);
    if (val.length < 2) { setMatches([]); setAcOpen(false); return; }
    const q = val.toLowerCase();
    setMatches(allItems.filter((i) => i.toLowerCase().includes(q)).slice(0, 10));
    setAcOpen(true);
  };

  const handleSelect = (item) => {
    setQuery(item);
    setSelected(item);
    setAcOpen(false);
    const rows = (window.__diningRows || {})[hallName] || [];
    const counts = {};
    rows.filter((r) => r.Item_Name === item && r._day).forEach((r) => {
      counts[r._day] = (counts[r._day] || 0) + 1;
    });
    setDayCounts(counts);
  };

  const activeDays = DAYS.filter((d) => dayCounts[d]);
  const maxCount = Math.max(1, ...Object.values(dayCounts));

  const cellColor = (count) => {
    // interpolate from light to hallColor
    const t = count / maxCount;
    return interpolateColor('#e8e8e8', hallColor === '#003262' ? '#1565a8' : hallColor === '#2d4a2d' ? '#2d6a2d' : hallColor === '#4a1942' ? '#7b2d6e' : '#7a4010', t);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8,
        }}
        >
          Menu Explorer
        </p>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4,
        }}
        >
          What's on the menu at
          {' '}
          {hallName}
          ?
        </h3>
        <p style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>
          Search any item to see which days of the week it's served.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="e.g. Scrambled Eggs, Pasta, Chicken…"
          style={{
            width: '100%',
            padding: '9px 14px',
            fontSize: 14,
            fontFamily: 'inherit',
            border: `1.5px solid ${acOpen ? hallAccent : '#ddd'}`,
            borderRadius: 5,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
        />
        {acOpen && matches.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1.5px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 5px 5px',
            zIndex: 100,
            maxHeight: 180,
            overflowY: 'auto',
            boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          }}
          >
            {matches.map((m) => (
              <div
                key={m}
                onMouseDown={() => handleSelect(m)}
                style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading / error states */}
      {loadError && (
        <p style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>
          Could not load menu data.
        </p>
      )}
      {!loaded && !loadError && (
        <p style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>
          Loading menu data…
        </p>
      )}

      {/* Heatmap cells */}
      {selected && activeDays.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <p style={{
            fontSize: 12, color: '#aaa', marginBottom: 14, fontStyle: 'italic',
          }}
          >
            <strong style={{ color: '#333', fontStyle: 'normal' }}>{selected}</strong>
            {' '}
            served
            {Object.values(dayCounts).reduce((a, b) => a + b, 0)}
            {' '}
            times across
            {activeDays.length}
            {' '}
            day
            {activeDays.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAYS.map((day) => {
              const count = dayCounts[day] || 0;
              const fill = count ? cellColor(count) : '#f5f5f5';
              const lum = count ? luminance(fill) : 1;
              return (
                <div
                  key={day}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 6,
                    background: fill,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    transition: 'background 0.3s ease',
                    border: count ? 'none' : '1px solid #eee',
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 700, color: count ? (lum > 0.4 ? '#1a1a1a' : '#fff') : '#ccc' }}>
                    {count || '—'}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: count ? (lum > 0.4 ? '#444' : 'rgba(255,255,255,0.7)') : '#ddd',
                  }}
                  >
                    {day.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && activeDays.length === 0 && (
        <p style={{
          fontSize: 13, color: '#aaa', fontStyle: 'italic', marginTop: 8,
        }}
        >
          No occurrences found for "
          {selected}
          " at
          {' '}
          {hallName}
          .
        </p>
      )}

      {!selected && loaded && (
        <p style={{
          fontSize: 13, color: '#bbb', fontStyle: 'italic', marginTop: 8,
        }}
        >
          Type 2+ characters to search
          {' '}
          {allItems.length.toLocaleString()}
          {' '}
          menu items.
        </p>
      )}
    </div>
  );
}

// ── HELPERS ─────────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^\uFEFF/, ''));
  return lines.slice(1).filter(Boolean).map((line) => {
    const vals = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
  });
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function interpolateColor(hex1, hex2, t) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

function luminance(color) {
  const m = color.match(/\d+/g);
  if (!m) return 0.5;
  const [r, g, b] = m.map(Number);
  return 0.2126 * r / 255 + 0.7152 * g / 255 + 0.0722 * b / 255;
}
