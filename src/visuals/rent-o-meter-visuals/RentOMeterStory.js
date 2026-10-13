import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import './styles/app.css';
import './host.css';

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

  return (
    <>
      <Helmet>
        <html className="rom-page" lang="en" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* the paper's fonts (Tiempos Headline, Plantin), copied from dc_app/public/fonts by sync.js */}
        <link rel="preload" href="/rent-o-meter/fonts/tiempos-headline-bold.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/rent-o-meter/fonts/plantin-regular.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="stylesheet" href="/rent-o-meter/fonts/fonts.css" />
      </Helmet>
      <div className="rom">{App && <App />}</div>
    </>
  );
};

export default RentOMeterStory;
