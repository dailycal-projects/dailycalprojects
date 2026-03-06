/**
 * This is an example template for creating custom templates and articles using React, rather then
 * using the MDX template.
 */
import React from 'react';
import { useState } from 'react';
import { theme } from '../../styles/theme';

// Define your react page as 'Body"
const ExampleReactVisual = () => {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: theme.palette.grey }}>
      <div style={containerStyle}>
        <h1>
          Click count:
          {clickCount}
        </h1>
        <button onClick={() => setClickCount(clickCount + 1)}>Click Me</button>
      </div>
    </div>
  );
};

// Center the div
const containerStyle = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
};

// Export the body component
export default ExampleReactVisual;
