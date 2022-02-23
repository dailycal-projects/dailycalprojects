import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import { theme } from '../styles/theme';
import WaterPlot from '../visuals/redlining-charts/scatterplots/waterPlot';
import ChemPlot from '../visuals/redlining-charts/scatterplots/chemPlot';
import HealthPlot from '../visuals/redlining-charts/scatterplots/healthPlot';
import EconPlot from '../visuals/redlining-charts/scatterplots/econPlot';
import RedlineMap from '../visuals/redlining-charts/map-materials/map';
import GuideMap from '../visuals/guide-visuals/guideMap';
import LunchChart from '../visuals/rent-shelter-visuals/berkeleyAlamedaLunch';
import RentChart from '../visuals/rent-shelter-visuals/berkeleyAlamedaRent';
import BerkeleyShelterChart from '../visuals/rent-shelter-visuals/berkeleyShelter';
import AlamedaShelterChart from '../visuals/rent-shelter-visuals/alamedaShelter';
import BUSDBlackEnrollment from '../visuals/exodus-visuals/BlackEnrollmentBUSD';
import DistrictMap from '../visuals/exodus-visuals/district-map-materials/districtMap';
import BlackPopulationCensus from '../visuals/exodus-visuals/BlackPopulationCensus';

/*
To avoid using exact paths in MDX files, import your components here
and add them to the shortcodes list to be globally accessible.
To use a component in MDX, simply type <MyComponent />

Note: MDXProvider doesn't like parsing individual HTML elements followed
by an array of React components, so we must include them in the same array.
*/

const shortcodes = {
  // style MDX files for any html element here!!
  a: (props) => (
    <a {...props} style={{ textDecoration: 'underline', color: theme.palette.black }} />), // styles MDX hyperlinks
  p: (props) => <p {...props} style={{ color: theme.palette.black }} />,
  img: (props) => <img {...props} style={{ display: 'flex', flexDirection: 'column' }} />,
  // cap: (props) => <cap {...props} style={{ text:  }} />,
  WaterPlot,
  ChemPlot,
  HealthPlot,
  EconPlot,
  RedlineMap,
  GuideMap,
  LunchChart,
  RentChart,
  BerkeleyShelterChart,
  AlamedaShelterChart,
  BUSDBlackEnrollment,
  DistrictMap,
  BlackPopulationCensus,
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
