import React from 'react';

const ArticleTags = (isMobile) => {
  let component;

  if (isMobile) {
    component = {};
  } else {
    const BrowserParagraph = (props) => (
      <p
        style={{
          width: '57%',
          fontSize: '18.5px',
          display: 'block',
          verticalAlign: 'middle',
          marginTop: '1em',
          marginBottom: '1em',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        {...props}
      />
    );
    const BrowserHeader1 = (props) => (
      <h1
        style={{
          width: '57%',
          display: 'block',
          verticalAlign: 'middle',
          marginTop: '1em',
          marginBottom: '1em',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        {...props}
      />
    );
    const BrowserHeader2 = (props) => (
      <h2
        style={{
          width: '57%',
          display: 'block',
          verticalAlign: 'middle',
          marginTop: '1em',
          marginBottom: '1em',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        {...props}
      />
    );

    component = {
      p: BrowserParagraph,
      h1: BrowserHeader1,
      h2: BrowserHeader2,
    };
  }

  return (component);
};

export default ArticleTags;
