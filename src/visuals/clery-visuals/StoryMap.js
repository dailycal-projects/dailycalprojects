import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { viewHref } from './views';

export default function StoryMap({ publicationDate }) {
  const rootRef = useRef(null);
  const [counts, setCounts] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCounts(null);
    setFailed(false);
    const root = rootRef.current;
    const controller = new AbortController();
    let disposeMap;
    let disposeSharing;
    Promise.all([import('./scripts/story-map'), import('./scripts/data')])
      .then(async ([{ default: mount }, { load, bindSharing }]) => {
        if (controller.signal.aborted) return;
        const data = await load({ signal: controller.signal });
        if (controller.signal.aborted) return;
        disposeSharing = bindSharing(root);
        const instance = mount({ root, data, publicationDate });
        disposeMap = instance.dispose;
        setCounts({ mapped: instance.mapped, total: instance.total });
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          console.error('The Clery story map could not load.', cause);
          setFailed(true);
        }
      });
    return () => {
      controller.abort();
      disposeSharing?.();
      disposeMap?.();
    };
  }, [publicationDate]);

  return (
    <div className="clery-viewer clery-story-map" ref={rootRef} data-mapped-incidents={counts?.mapped} data-total-incidents={counts?.total}>
      <div className="clery-story-map-canvas" role="region" aria-label="Approximate locations of crimes reported to UCPD" aria-busy={!counts && !failed} />
      {(!counts || failed) && (
        <p className="clery-story-map-status" role={failed ? 'alert' : 'status'}>
          {failed ? (
            <>The map could not load. <a href={viewHref('dashboard')} data-clery-view="dashboard">Open the dashboard</a>.</>
          ) : 'Loading crime locations…'}
        </p>
      )}
      <div className="clery-story-heat-legend" role="img" aria-label="Incident concentration: cooler colors show fewer nearby reports; warmer colors show more.">
        <span>Incident concentration</span>
        <time className="clery-story-heat-year" data-clery-year dateTime="2020">2020</time>
        <i aria-hidden="true" />
        <div aria-hidden="true"><span>Lower</span><span>Higher</span></div>
      </div>
    </div>
  );
}
