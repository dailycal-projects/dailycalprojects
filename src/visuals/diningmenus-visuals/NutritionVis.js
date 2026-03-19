import React, { useEffect, useState } from 'react';

const KEYWORDS = {
  grains: ['rice', 'noodle', 'pasta', 'bread', 'roll', 'bun', 'tortilla', 'wrap', 'pita', 'bagel', 'english muffin', 'waffle', 'pancake', 'oatmeal', 'oat', 'grits', 'quinoa', 'grain', 'farro', 'barley', 'couscous', 'polenta', 'cornbread', 'biscuit', 'croissant', 'muffin', 'danish', 'flatbread', 'naan', 'cracker', 'cereal', 'granola', 'pilaf', 'risotto', 'lo mein', 'udon', 'ramen', 'spaghetti', 'penne', 'mac'],
  proteins: ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'tilapia', 'cod', 'shrimp', 'tofu', 'tempeh', 'egg', 'eggs', 'sausage', 'bacon', 'ham', 'lamb', 'steak', 'burger', 'meatball', 'meatloaf', 'lentil', 'bean', 'beans', 'chickpea', 'hummus', 'edamame', 'seitan', 'veggie burger', 'black bean', 'falafel', 'crab', 'brisket', 'pulled pork', 'carnitas', 'chorizo', 'soyrizo', 'gyro', 'pastrami', 'roast beef', 'ground beef', 'ground turkey'],
  greens: ['spinach', 'kale', 'lettuce', 'arugula', 'chard', 'collard', 'broccoli', 'asparagus', 'green bean', 'green beans', 'snap pea', 'bok choy', 'cabbage', 'brussels', 'zucchini', 'cucumber', 'celery', 'leek', 'fennel', 'watercress', 'romaine', 'mixed green', 'spring mix', 'basil', 'parsley', 'cilantro', 'mint', 'dill', 'chive', 'broccolini', 'pesto', 'salad', 'slaw', 'coleslaw'],
};

const COLORS = {
  grains: { bar: '#C4956A', light: '#F5E6D3', label: '#8B5E3C' },
  proteins: { bar: '#7A9CBF', light: '#D8E8F5', label: '#3d6080' },
  greens: { bar: '#6B8F71', light: '#D8EAD8', label: '#3a5c3e' },
};

const CAT_LABELS = { grains: 'Grains', proteins: 'Proteins', greens: 'Greens' };
const TOP_N_OPTIONS = [5, 10, 15];

function categorize(name) {
  const n = name.toLowerCase();
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    if (kws.some((kw) => n.includes(kw))) return cat;
  }
  return null;
}

export default function NutritionVis() {
  const [counts, setCounts] = useState({ grains: {}, proteins: {}, greens: {} });
  const [activeCat, setActiveCat] = useState('grains');
  const [topN, setTopN] = useState(10);
  const [loaded, setLoaded] = useState(false);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetch('/allMenus.csv')
      .then((r) => r.text())
      .then((text) => {
        const lines = text.replace(/\r/g, '').split('\n');
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^\uFEFF/, ''));
        const nameIdx = headers.indexOf('Item_Name');
        if (nameIdx === -1) return;

        const c = { grains: {}, proteins: {}, greens: {} };
        lines.slice(1).filter(Boolean).forEach((line) => {
          const vals = line.split(',');
          const name = (vals[nameIdx] || '').trim();
          if (!name) return;
          const cat = categorize(name);
          if (!cat) return;
          const key = name.replace(/\b\w/g, (ch) => ch.toUpperCase());
          c[cat][key] = (c[cat][key] || 0) + 1;
        });

        const sm = {};
        for (const [cat, obj] of Object.entries(c)) {
          sm[cat] = {
            unique: Object.keys(obj).length,
            total: Object.values(obj).reduce((a, b) => a + b, 0),
          };
        }

        setCounts(c);
        setSummary(sm);
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  if (!loaded) {
    return (
      <p style={{
        color: '#aaa', fontStyle: 'italic', fontSize: 14, padding: '24px 0',
      }}
      >
        Loading nutrition data…
      </p>
    );
  }

  const data = Object.entries(counts[activeCat] || {})
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const col = COLORS[activeCat];

  return (
    <div style={{ fontFamily: 'inherit' }}>

      {/* Category tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: 20 }}>
        {Object.keys(COLORS).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            style={{
              padding: '9px 24px 11px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeCat === cat ? COLORS[cat].label : '#aaa',
              borderBottom: activeCat === cat ? `3px solid ${COLORS[cat].bar}` : '3px solid transparent',
              marginBottom: -2,
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <span style={{
              width: 9, height: 9, borderRadius: '50%', background: COLORS[cat].bar, display: 'inline-block',
            }}
            />
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Summary pill */}
      {summary[activeCat] && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: col.light,
          borderRadius: 20,
          padding: '6px 14px',
          marginBottom: 20,
          fontSize: 12.5,
          fontWeight: 600,
          color: col.label,
        }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: col.bar, display: 'inline-block',
          }}
          />
          {summary[activeCat].unique.toLocaleString()}
          {' '}
          unique
          {CAT_LABELS[activeCat].toLowerCase()}
          &nbsp;·&nbsp;
          {summary[activeCat].total.toLocaleString()}
          {' '}
          total servings
        </div>
      )}

      {/* Top-N buttons */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
      }}
      >
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bbb',
        }}
        >
          Show top
        </span>
        {TOP_N_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setTopN(n)}
            style={{
              padding: '4px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              border: `1.5px solid ${topN === n ? '#1a1a1a' : '#ddd'}`,
              borderRadius: 4,
              cursor: 'pointer',
              background: topN === n ? '#1a1a1a' : 'white',
              color: topN === n ? 'white' : '#777',
              transition: 'all 0.15s',
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Bars */}
      <div>
        {data.map((d, i) => {
          const trackW = 480;
          const barW = (d.count / maxCount) * trackW;
          return (
            <div
              key={d.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9,
              }}
            >
              {/* Rank */}
              <span style={{
                width: 24, fontSize: 11, fontWeight: 700, color: col.bar, textAlign: 'right', flexShrink: 0,
              }}
              >
                #
                {i + 1}
              </span>
              {/* Label */}
              <span style={{
                width: 180, fontSize: 13, color: '#333', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
              >
                {d.label}
              </span>
              {/* Track + bar */}
              <div style={{
                width: trackW, height: 26, background: col.light, borderRadius: 4, position: 'relative', flexShrink: 0,
              }}
              >
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: barW,
                  background: col.bar,
                  borderRadius: 4,
                  transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
                />
              </div>
              {/* Count */}
              <span style={{
                fontSize: 11.5, fontWeight: 600, color: '#555', flexShrink: 0,
              }}
              >
                {d.count.toLocaleString()}
              </span>
            </div>
          );
        })}
        {/* Axis labels */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 6,
        }}
        >
          <span style={{ width: 24 + 10 + 180 }} />
          <div style={{ width: 480, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: '#ccc' }}>0</span>
            <span style={{ fontSize: 10, color: '#ccc' }}>Times served</span>
            <span style={{ fontSize: 10, color: '#ccc' }}>{maxCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
