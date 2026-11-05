import React, { useEffect, useRef } from 'react';
import './fonts.css';
import './host.css';

/** The endorsement web (see README.md). Use with client:load: the app is mounted in the browser. */
export default function EndorsementWeb() {
  const ref = useRef(null);
  useEffect(() => {
    let unmount;
    let cancelled = false;
    // Loaded here, not imported above, so its graph library and data only load in the browser
    import('./main').then(({ mount }) => {
      if (!cancelled) unmount = mount(ref.current);
    });
    return () => {
      cancelled = true;
      unmount?.();
    };
  }, []);
  return (
    <div
      ref={ref}
      className="endorsementweb-visual"
      role="region"
      aria-label="Explore Berkeley election endorsements by candidate and race"
    />
  );
}
