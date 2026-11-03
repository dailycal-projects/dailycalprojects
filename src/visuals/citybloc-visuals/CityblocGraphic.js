import React, { useEffect, useRef } from 'react';

// A separate DOM tree keeps the original graphics' IDs and styles local to
// each instance, including when several graphics appear in the same article.
export default function CityblocGraphic({ title, html, mount }) {
  const host = useRef(null);

  useEffect(() => {
    const root = host.current.shadowRoot || host.current.attachShadow({ mode: 'open' });
    const downloads = [];
    const controller = new AbortController();
    root.innerHTML = `${html}<style>.fig { width: 100%; max-width: none; }</style>`;
    const createDownload = (csv) => {
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      downloads.push(url);
      return url;
    };
    mount(root, createDownload, controller.signal);
    return () => {
      controller.abort();
      downloads.forEach((url) => URL.revokeObjectURL(url));
      root.replaceChildren();
    };
  }, [html, mount]);

  return (
    <div
      ref={host}
      role="region"
      aria-label={`City Council: ${title}`}
      style={{
        width: 'min(1000px, calc(100vw - 40px))',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        margin: '2rem 0',
        minWidth: 0,
      }}
    />
  );
}
