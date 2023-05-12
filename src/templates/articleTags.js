import React from 'react';
import Sizing from '../components/visualizationSizing';

const ArticleTags = (isMobile) => {
  let component;

  if (isMobile) {
    const MobileBody = (props) => (
      <body
        style={{
          width: `${Sizing(isMobile)}%`,
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
    component = { body: MobileBody };
  } else {
    const BrowserParagraph = (props) => (
      <p
        style={{
          width: '47.5%',
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
          width: '47.5%',
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
          width: '47.5%',
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
    const BrowserHeader3 = (props) => (
      <h3
        style={{
          width: '47.5%',
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
    const BrowserHeader4 = (props) => (
      <h4
        style={{
          width: '47.5%',
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
    const BrowserBody = (props) => (
      <body
        style={{
          width: '47.5%',
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

    const BrowserOl = (props) => (
      <ol
        style={{
          width: '47.5%',
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

    component = {
      p: BrowserParagraph,
      h1: BrowserHeader1,
      h2: BrowserHeader2,
      h3: BrowserHeader3,
      h4: BrowserHeader4,
      body: BrowserBody,
      ol: BrowserOl,
    };
  }

  return (component);
};

export default ArticleTags;
