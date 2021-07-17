import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import WaterPlot from '../visuals/redlining-charts/scatterplots/waterPlot.tsx';
import ChemPlot from '../visuals/redlining-charts/scatterplots/chemPlot.tsx';
import HealthPlot from '../visuals/redlining-charts/scatterplots/healthPlot.tsx';
import EconPlot from '../visuals/redlining-charts/scatterplots/econPlot.tsx';
import RedlineMap from '../visuals/redlining-charts/map-materials/map.js';

/*
To avoid using exact paths to MDX files, import your components here
and add them to the shortcodes array to be globally accessible.
To use a component, simply type <MyComponent />
*/
const shortcodes = {
  WaterPlot, ChemPlot, HealthPlot, EconPlot, RedlineMap,
};

export default function Layout({ children }) {
  return (
    <MDXProvider
      components={{
        a: (props) => <a {...props} style={{ textDecoration: 'none' }} />, // styles MDX hyperlinks
      }, shortcodes}
    >
      {children}
    </MDXProvider>
  );
}
