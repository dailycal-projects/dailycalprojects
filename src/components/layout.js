import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import WaterPlot from '../visuals/redlining-charts/scatterplots/waterPlot';
import ChemPlot from '../visuals/redlining-charts/scatterplots/chemPlot';
import HealthPlot from '../visuals/redlining-charts/scatterplots/healthPlot';
import EconPlot from '../visuals/redlining-charts/scatterplots/econPlot';
import RedlineMap from '../visuals/redlining-charts/map-materials/map';

/*
To avoid using exact paths in MDX files, import your components here
and add them to the shortcodes list to be globally accessible.
To use a component in MDX, simply type <MyComponent />

Note: MDXProvider doesn't like parsing individual HTML elements followed
by an array of React components, so we must include them in the same array.
*/

const shortcodes = {
  a: (props) => <a {...props} style={{ textDecoration: 'none' }} />, // styles MDX hyperlinks
  // p: (props) => <p {...props} style={{ textIndent: '40px' }} />,
  img: (props) => <img style={{ display: 'flex', flexDirection: 'column' }} />,
  WaterPlot,
  ChemPlot,
  HealthPlot,
  EconPlot,
  RedlineMap,
};

export default function Layout({ children }) {
  return (
    <MDXProvider
      components={shortcodes}
    >
      {children}
    </MDXProvider>
  );
}
