import React from 'react';

const StickyHeader = () => (

  <div style={{
    position: 'fixed',
    width: '100%',
    backgroundColor: '#e9edf0',
    alignItems: 'center',
  }}
  >
    <h1 style={{ textAlign: 'justify', display: 'flex' }}>
      The Daily Californian
    </h1>
  </div>

);

export default StickyHeader;
