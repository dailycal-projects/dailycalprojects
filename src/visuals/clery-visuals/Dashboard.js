import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { bindSharing, load } from './scripts/data';
import { viewHref } from './views';

const ARCHIVE = 'https://drive.google.com/drive/u/1/folders/1ih_EkE5rVPpV02A05baaV7_IihZUgJwO';

export default function Dashboard({ view, caseNumber }) {
  const rootRef = useRef(null);
  const [status, setStatus] = useState('Loading incidents…');
  const [error, setError] = useState('');

  useEffect(() => {
    const root = rootRef.current;
    const controller = new AbortController();
    let disposeView;
    const disposeSharing = bindSharing(root);
    const module = view === 'table' ? import('./scripts/table') : import('./scripts/map');
    Promise.all([module, load({ signal: controller.signal })])
      .then(([{ default: mount }, data]) => {
        if (controller.signal.aborted) return;
        disposeView = mount({ root, data, caseNumber });
        const latest = Number.isFinite(data.latest) ? new Date(data.latest).toLocaleString([], {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        }) : '';
        setStatus(latest ? `Latest data: ${latest}` : 'No incidents available.');
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          console.error('The Clery crime log could not load.', cause);
          setError('The crime log could not load. Please reload to try again.');
          setStatus('');
        }
      });
    return () => {
      controller.abort();
      disposeSharing();
      disposeView?.();
    };
  }, [view, caseNumber]);

  return (
    <div className={`clery-viewer clery-dashboard clery-dashboard--${view}`} ref={rootRef}>
      <header>
        <div className="clery-dashboard-nav">
          <b><a href={viewHref('dashboard')} data-clery-view="dashboard">UCPD Crime Log Viewer</a></b>
          <a href={viewHref('story')} data-clery-view="story">Read the story</a>
          <a href={viewHref('dashboard')} data-clery-view="dashboard" aria-current={view === 'dashboard' ? 'page' : undefined}>Map</a>
          <a href={viewHref('table')} data-clery-view="table" aria-current={view === 'table' ? 'page' : undefined}>All incidents</a>
          <a href={ARCHIVE} target="_blank" rel="noopener noreferrer">Archival Drive</a>
          <a id="help" href={`${viewHref('dashboard')}#tour`}>Help</a>
        </div>
        <div id="latest" role="status">{status}</div>
        {error && <p className="clery-dashboard-error" role="alert">{error}</p>}
      </header>
      {view === 'table' ? (
        <>
          <div id="bar">
            <label className="clery-sr-only" htmlFor="q">Search all incidents</label>
            <input id="q" type="search" placeholder="Search" autoFocus defaultValue={caseNumber} />
            <span id="n" role="status" />
          </div>
          <div id="wrap"><table aria-label="UCPD crime log incidents"><thead /><tbody /></table></div>
        </>
      ) : (
        <>
          <div id="main">
            <div id="mapwrap">
              <div id="map" role="region" aria-label="UCPD incident map" />
              <div id="range" />
              <div id="stats" hidden><svg id="pie" viewBox="0 0 128 128" /><ul id="legend" /></div>
              <aside aria-label="Incidents in the selected time range">
                <div id="count" role="status" />
                <div id="list" />
                <a id="all" href={viewHref('table')} data-clery-view="table">All incidents</a>
              </aside>
            </div>
          </div>
          <div id="tl" aria-label="Incident timeline: four months are visible. Drag the background to browse dates, click to place the selected range, or drag the orange band and its left edge to adjust the range." title="Drag the timeline to browse dates; click to move the selected range.">
            <canvas />
            <div id="band"><div id="handle" /></div>
          </div>
        </>
      )}
    </div>
  );
}
