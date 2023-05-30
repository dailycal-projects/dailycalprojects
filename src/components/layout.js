import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import { GatsbyImage } from 'gatsby-plugin-image';
import { isMobile } from 'react-device-detect';
import { theme } from '../styles/theme';
import ArticleTags from './articleTags';
import VisualizationSizing from './visualizationSizing';
import TableSizing from './tableSizing';
import WaterPlot from '../visuals/redlining-charts/scatterplots/waterPlot';
import ChemPlot from '../visuals/redlining-charts/scatterplots/chemPlot';
import HealthPlot from '../visuals/redlining-charts/scatterplots/healthPlot';
import EconPlot from '../visuals/redlining-charts/scatterplots/econPlot';
import RedlineMap from '../visuals/redlining-charts/map-materials/map';
import GuideMap from '../visuals/guide-visuals/guideMap';
import HateBar from '../visuals/hate-charts/hateBar';
import HateLine from '../visuals/hate-charts/hateLine';
import LunchChart from '../visuals/rent-shelter-visuals/berkeleyAlamedaLunch';
import RentChart from '../visuals/rent-shelter-visuals/berkeleyAlamedaRent';
import BerkeleyShelterChart from '../visuals/rent-shelter-visuals/berkeleyShelter';
import AlamedaShelterChart from '../visuals/rent-shelter-visuals/alamedaShelter';
import BUSDBlackEnrollment from '../visuals/exodus-visuals/BlackEnrollmentBUSD';
import DistrictMap from '../visuals/exodus-visuals/district-map-materials/districtMap';
import BlackPopulationCensus from '../visuals/exodus-visuals/BlackPopulationCensus';
import GymTotals from '../visuals/gym-pac-12-visuals/gymTotals';
import GymVault from '../visuals/gym-pac-12-visuals/gymVault';
import GymBars from '../visuals/gym-pac-12-visuals/gymBars';
import GymBeam from '../visuals/gym-pac-12-visuals/gymBeam';
import GymFloor from '../visuals/gym-pac-12-visuals/gymFloor';
import Timeline1921 from '../visuals/1921-visuals/1921Timeline';
import STEMEnrollmentLine from '../visuals/STEM-visuals/STEMLine';
import TurnoverMap from '../visuals/turnover-visuals/turnoverMap';
import StudyAbroadMap from '../visuals/study-abroad-visuals/studyAbroadMap';
import ArtifactsBarChart from '../visuals/artifacts-visuals/artifactsBarChart';
import ArtifactsPieChart from '../visuals/artifacts-visuals/artifactsPieChart';
import HSILineChart from '../visuals/HSI-visuals/HSILineChart';
import SubscriberLineChart from '../visuals/reddit-visuals/subscriberCount';
import DailyCommentLineChart from '../visuals/reddit-visuals/dailyCommentCount';
import PostsPerHourBarChart from '../visuals/reddit-visuals/postsPerHourBarChart';
import PostsPerDayBarChart from '../visuals/reddit-visuals/postsPerDayBarChart';
import PostsPerFlairBarChart from '../visuals/reddit-visuals/postsPerFlairBarChart';
import GapStackedBarChart from '../visuals/gap-visuals/gapStackedBarChart';
import ProposalsASE from '../visuals/bargaining-visuals/proposalsASE';
import ProposalsAR from '../visuals/bargaining-visuals/proposalsAR';
import ProposalsPostocs from '../visuals/bargaining-visuals/proposalsPostdocs';
import ProposalsSR from '../visuals/bargaining-visuals/proposalsSR';
import OptionWidthBarChart from '../visuals/telegraph-visuals/optionWidths';
import KutcherTimeline from '../visuals/kutcher-visuals/kutcherTimeline';
import UnionVoteBarChart from '../visuals/union-vote-visuals/unionVoteBarChart';
import TimeDoctorateBarChart from '../visuals/union-vote-visuals/timeDoctorateBarChart';
import UniversityRentMap from '../visuals/rent-map-visuals/universityRentMap';
import OptionWidthViz2 from '../visuals/telegraph-visuals/optionWidths2';

/*
To avoid using exact paths in MDX files, import your components here
and add them to the shortcodes list to be globally accessible.ß
To use a component in MDX, simply type <MyComponent />
Note: MDXProvider doesn't like parsing individual HTML elements followed
by an array of React components, so we must include them in the same array.
*/

const component = ArticleTags(isMobile);

const shortcodes = {
  // style MDX files for any html element here!!
  a: (props) => (
    <a {...props} style={{ textDecoration: 'underline', color: theme.palette.black }} />), // styles MDX hyperlinks
  img: (props) => <img {...props} style={{ display: 'flex', flexDirection: 'column' }} />,
  // cap: (props) => <cap {...props} style={{ text:  }} />,
  GatsbyImage: (props) => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '25px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GatsbyImage {... props} />
    </div>
  ),
  WaterPlot: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <WaterPlot />
    </div>
  ),
  ChemPlot: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <ChemPlot />
    </div>
  ),
  HealthPlot: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <HealthPlot />
    </div>
  ),
  EconPlot: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <EconPlot />
    </div>
  ),
  RedlineMap: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <RedlineMap />
    </div>
  ),
  GuideMap: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GuideMap />
    </div>
  ),
  HateBar: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <HateBar />
    </div>
  ),
  HateLine: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <HateLine />
    </div>
  ),
  LunchChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <LunchChart />
    </div>
  ),
  RentChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <RentChart />
    </div>
  ),
  BerkeleyShelterChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <BerkeleyShelterChart />
    </div>
  ),
  AlamedaShelterChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <AlamedaShelterChart />
    </div>
  ),
  BUSDBlackEnrollment: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <BUSDBlackEnrollment />
    </div>
  ),
  DistrictMap: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <DistrictMap />
    </div>
  ),
  BlackPopulationCensus: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <BlackPopulationCensus />
    </div>
  ),
  GymTotals: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GymTotals />
    </div>
  ),
  GymVault: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GymVault />
    </div>
  ),
  GymBars: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GymBars />
    </div>
  ),
  GymBeam: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GymBeam />
    </div>
  ),
  GymFloor: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GymFloor />
    </div>
  ),
  Timeline1921: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <Timeline1921 />
    </div>
  ),
  STEMEnrollmentLine: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <STEMEnrollmentLine />
    </div>
  ),
  TurnoverMap: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <TurnoverMap />
    </div>
  ),
  StudyAbroadMap: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <StudyAbroadMap />
    </div>
  ),
  ArtifactsBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <ArtifactsBarChart />
    </div>
  ),
  ArtifactsPieChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <ArtifactsPieChart />
    </div>
  ),
  HSILineChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <HSILineChart />
    </div>
  ),
  SubscriberLineChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <SubscriberLineChart />
    </div>
  ),
  DailyCommentLineChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <DailyCommentLineChart />
    </div>
  ),
  PostsPerHourBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <PostsPerHourBarChart />
    </div>
  ),
  PostsPerDayBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <PostsPerDayBarChart />
    </div>
  ),
  PostsPerFlairBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <PostsPerFlairBarChart />
    </div>
  ),
  GapStackedBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <GapStackedBarChart />
    </div>
  ),
  ProposalsASE: () => (
    <div style={{
      fontSize: 18, maxWidth: `${TableSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <ProposalsASE />
    </div>
  ),
  ProposalsAR: () => (
    <div style={{
      fontSize: 18, maxWidth: `${TableSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <ProposalsAR />
    </div>
  ),
  ProposalsSR: () => (
    <div style={{
      fontSize: 18, maxWidth: `${TableSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <ProposalsSR />
    </div>
  ),
  ProposalsPostocs: () => (
    <div style={{
      fontSize: 18, maxWidth: `${TableSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <ProposalsPostocs />
    </div>
  ),
  OptionWidthBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <OptionWidthBarChart />
    </div>
  ),
  KutcherTimeline: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <KutcherTimeline />
    </div>
  ),
  UnionVoteBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <UnionVoteBarChart />
    </div>
  ),
  TimeDoctorateBarChart: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <TimeDoctorateBarChart />
    </div>
  ),
  UniversityRentMap: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <UniversityRentMap />
    </div>
  ),
  OptionWidthViz2: () => (
    <div style={{
      fontSize: 18, maxWidth: `${VisualizationSizing(isMobile)}%`, marginLeft: 'auto', marginTop: '15px', marginBottom: '15px', marginRight: 'auto',
    }}
    >
      <OptionWidthViz2 />
    </div>
  ),
};

export default function Layout({ children }) {
  return (
    <MDXProvider
      components={({ ...component, ...shortcodes })}
    >
      {children}
    </MDXProvider>
  );
}
