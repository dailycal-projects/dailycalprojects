import React from 'react';
import './host.css';

export default function EndorsementWeb() {
  return (
    <div className="endorsementweb-visual">
      <iframe
        title="Explore Berkeley election endorsements by candidate and race"
        src="/endorsementweb/index.html"
        loading="lazy"
      />
    </div>
  );
}
