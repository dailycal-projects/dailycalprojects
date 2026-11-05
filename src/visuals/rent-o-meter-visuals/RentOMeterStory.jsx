import React, { useEffect, useState } from 'react';
import { preinit, preload } from 'react-dom';
import './styles/app.css';
import './host.css';
import { withBase } from '../../lib/path';

const RentOMeterStory = () => {
  const [App, setApp] = useState(null);

  useEffect(() => {
    let live = true;
    import('./app/App').then((m) => {
      if (live) setApp(() => m.default);
    });
    return () => {
      live = false;
    };
  }, []);

  // <html class="rom-page">
  useEffect(() => {
    document.documentElement.classList.add('rom-page');
    return () => document.documentElement.classList.remove('rom-page');
  }, []);

  // the paper's fonts (Tiempos Headline, Plantin), copied from dc_app/public/fonts into public/fonts by sync.js
  preload(withBase('/fonts/tiempos-headline-bold.woff2'), { as: 'font', type: 'font/woff2', crossOrigin: '' });
  preload(withBase('/fonts/plantin-regular.woff2'), { as: 'font', type: 'font/woff2', crossOrigin: '' });
  preinit(withBase('/fonts/fonts.css'), { as: 'style' });

  return (
    <>
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <div className="rom">{App && <App />}</div>
    </>
  );
};

export default RentOMeterStory;
