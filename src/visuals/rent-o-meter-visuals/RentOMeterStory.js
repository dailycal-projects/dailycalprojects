import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import './styles/app.css';
import './host.css';

/*
The rent-o-meter: the fake article, the finder, the story and the rent map. Ported from the standalone
Vite app (berkeley-rent-registry/dc_app), which stays the source of truth: app/, styles/app.css and
static/rent-o-meter/ are copied from it by sync.js, so change things there and rerun that.

The app is written for a page that scrolls the window, so on this page it undoes the full-page template's
scroll lock (host.css). Its views are hash routes (#map, #debug), which the site's router leaves alone.

It renders nothing at build time: the app reads window and the viewport from its first render, and
everything it shows depends on data fetched in the browser anyway.
*/
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
