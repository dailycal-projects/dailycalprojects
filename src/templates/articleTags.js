import React from 'react';
import Sizing from '../components/visualizationSizing';

const ArticleTags = (isMobile) => {
  let component;

  if (isMobile) {
    const MobileParagraph = (props) => (
      <p
        style={{
          width: '75%',
          fontSize: '18px',
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
    const MobileHeader1 = (props) => (
      <h1
        style={{
          width: '75%',
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
    const MobileHeader2 = (props) => (
      <h2
        style={{
          width: '75%',
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
    const MobileHeader3 = (props) => (
      <h3
        style={{
          width: '75%',
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
    const MobileHeader4 = (props) => (
      <h4
        style={{
          width: '75%',
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
    const MobileBody = (props) => (
      <body
        style={{
          width: '75%',
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
    const MobileOl = (props) => (
      <ol
        style={{
          width: '47.5%',
          fontSize: '18px',
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
      p: MobileParagraph,
      body: MobileBody,
      h1: MobileHeader1,
      h2: MobileHeader2,
      h3: MobileHeader3,
      h4: MobileHeader4,
      body: MobileBody,
      ol: MobileOl,

    };
  } else {
    const BrowserParagraph = (props) => (
      <p
        style={{
          width: '47.5%',
          fontSize: '18px',
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
          fontSize: '18px',

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
          fontSize: '18px',
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
