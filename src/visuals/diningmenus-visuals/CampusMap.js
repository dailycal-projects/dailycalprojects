import React, { useState } from 'react';

export default function CampusMap() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{
      borderRadius: 8, overflow: 'hidden', border: '1px solid #e8e8e8', background: '#fafaf8',
    }}
    >
      {!loaded && (
      <div style={{
        height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13, fontStyle: 'italic',
      }}
      >
        Loading map…
      </div>
      )}
      <iframe
        src="/dining/campusMap.html"
        title="Interactive campus dining map"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: 620, border: 'none', display: loaded ? 'block' : 'none',
        }}
      />
    </div>
  );
}
