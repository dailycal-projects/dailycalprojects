import React, { useEffect, useRef, useState } from 'react';

const ALLERGEN_FIELDS = [
  { col: 'Contains_Gluten', label: 'Gluten', color: '#6B8F71' },
  { col: 'Contains_Milk', label: 'Milk', color: '#C97B63' },
  {
    col: 'Contains_Soy', label: 'Soy', color: '#E8A598', fallback: 'Contains_Soybeans',
  },
  { col: 'Contains_Egg', label: 'Egg', color: '#7A9CBF' },
];

const DIETARY_FIELDS = [
  { col: 'Vegan', label: 'Vegan', color: '#6B8F71' },
  { col: 'Vegetarian', label: 'Vegetarian', color: '#A4C3A2' },
  { col: 'Halal', label: 'Halal', color: '#C4956A' },
  { col: 'Kosher', label: 'Kosher', color: '#7A9CBF' },
];

const LOCATIONS_ORDER = ['Clark Kerr', 'Crossroads', 'Foothill', 'Cafe 3'];

export default function AllergenVis() {
  const [hallData, setHallData] = useState({});
  const [activeHall, setActiveHall] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [globalAllergenMax, setGlobalAllergenMax] = useState(100);
  const [globalDietaryMax, setGlobalDietaryMax] = useState(100);
  const [resolvedAllergens, setResolvedAllergens] = useState([]);
  const [resolvedDietary, setResolvedDietary] = useState([]);

  useEffect(() => {
    fetch('/allMenus.csv')
      .then((r) => r.text())
      .then((text) => {
        const rows = parseCSV(text);
        const allCols = Object.keys(rows[0] || {});

        const allergens = ALLERGEN_FIELDS.map((f) => {
          const col = allCols.includes(f.col) ? f.col : (f.fallback && allCols.includes(f.fallback) ? f.fallback : null);
          return col ? { ...f, col } : null;
        }).filter(Boolean);

        const dietary = DIETARY_FIELDS.filter((f) => allCols.includes(f.col));
        [...allergens, ...dietary].forEach(({ col }) => {
          rows.forEach((r) => {
            const v = (r[col] || '').toLowerCase();
            r[col] = v === 'true' || v === '1';
          });
        });

        rows.forEach((r) => {
          r._location = (r.Location || '').replace(/_/g, ' ').trim();
        });

        const halls = [...new Set(rows.map((d) => d._location))].filter(Boolean);

        const hd = {};
        halls.forEach((hall) => {
          const sub = rows.filter((r) => r._location === hall);
          hd[hall] = {
            allergens: allergens.map((f) => ({
              label: f.label,
              color: f.color,
              pct: mean(sub, (r) => (r[f.col] ? 1 : 0)) * 100,
            })),
            dietary: dietary.map((f) => ({
              label: f.label,
              color: f.color,
              pct: mean(sub, (r) => (r[f.col] ? 1 : 0)) * 100,
            })),
          };
        });

        const rawA = Math.max(...Object.values(hd).flatMap((h) => h.allergens.map((d) => d.pct)), 10);
        const rawD = Math.max(...Object.values(hd).flatMap((h) => h.dietary.map((d) => d.pct)), 10);

        setHallData(hd);
        setResolvedAllergens(allergens);
        setResolvedDietary(dietary);
        setGlobalAllergenMax(Math.ceil(rawA / 5) * 5 + 5);
        setGlobalDietaryMax(Math.ceil(rawD / 5) * 5 + 5);
        setActiveHall(halls[0]);
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  const halls = Object.keys(hallData).sort((a, b) => {
    const ia = LOCATIONS_ORDER.findIndex((l) => a.toLowerCase().includes(l.toLowerCase()));
    const ib = LOCATIONS_ORDER.findIndex((l) => b.toLowerCase().includes(l.toLowerCase()));
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  if (!loaded) {
    return (
      <p style={{
        color: '#aaa', fontStyle: 'italic', fontSize: 14, padding: '24px 0',
      }}
      >
        Loading allergen data…
      </p>
    );
  }

  const data = hallData[activeHall];
  if (!data) return null;

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Dropdown */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
      }}
      >
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999',
        }}
        >
          Dining Hall
        </span>
        <select
          value={activeHall || ''}
          onChange={(e) => setActiveHall(e.target.value)}
          style={{
            padding: '8px 36px 8px 14px',
            fontSize: 14,
            fontFamily: 'inherit',
            border: '1.5px solid #ccc',
            borderRadius: 5,
            background: 'white',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23555\' stroke-width=\'1.8\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          {halls.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Two-panel layout */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
        {/* Allergens */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C97B63', marginBottom: 4,
          }}
          >
            Common Allergens
          </p>
          <p style={{ fontSize: 11.5, color: '#bbb', marginBottom: 16 }}>% of items containing each allergen</p>
          <BarPanel data={data.allergens} globalMax={globalAllergenMax} />
        </div>

        {/* Divider */}
        <div style={{
          width: 1, background: '#eee', alignSelf: 'stretch', margin: '0 32px', flexShrink: 0,
        }}
        />

        {/* Dietary */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B8F71', marginBottom: 4,
          }}
          >
            Dietary Labels
          </p>
          <p style={{ fontSize: 11.5, color: '#bbb', marginBottom: 16 }}>% of items meeting each classification</p>
          <BarPanel data={data.dietary} globalMax={globalDietaryMax} />
        </div>
      </div>
    </div>
  );
}

function BarPanel({ data, globalMax }) {
  const BAR_H = 28;
  const LABEL_W = 90;
  const VAL_W = 52;
  const TRACK_W = 260;

  return (
    <div>
      {data.map((d) => {
        const barW = Math.max(0, (d.pct / globalMax) * TRACK_W);
        return (
          <div
            key={d.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            }}
          >
            <span style={{
              width: LABEL_W, fontSize: 13, color: '#333', textAlign: 'right', flexShrink: 0,
            }}
            >
              {d.label}
            </span>
            <div style={{
              width: TRACK_W, height: BAR_H, background: '#f5f5f5', borderRadius: 4, position: 'relative', flexShrink: 0,
            }}
            >
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: barW,
                background: d.color,
                borderRadius: 4,
                transition: 'width 0.55s cubic-bezier(0.4,0,0.2,1)',
              }}
              />
            </div>
            <span style={{
              width: VAL_W, fontSize: 12, fontWeight: 600, color: '#444', flexShrink: 0,
            }}
            >
              {d.pct < 1 ? '<1%' : `${d.pct.toFixed(1)}%`}
            </span>
          </div>
        );
      })}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginTop: 4,
      }}
      >
        <span style={{ width: LABEL_W }} />
        <div style={{ width: TRACK_W, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#ccc' }}>0%</span>
          <span style={{ fontSize: 10, color: '#ccc' }}>
            {Math.round(globalMax / 2)}
            %
          </span>
          <span style={{ fontSize: 10, color: '#ccc' }}>
            {globalMax}
            %
          </span>
        </div>
      </div>
    </div>
  );
}

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

function mean(arr, fn) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + fn(x), 0) / arr.length;
}
