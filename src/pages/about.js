import * as React from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customTheme';
import Layout from '../components/layout';

import NavBar from '../components/navBar';
import Seo from '../components/seo';

const About = ({ classes }) => (
  <Layout>
    <div className={classes.main}>
      <NavBar />
      <Seo title="About" />
      <div className={classes.header}>
        <h3>Founding of the Projects Department</h3>
      </div>
      <div
        style={{
          justifyContent: 'left',
          alignItems: 'center',
          position: 'relative',
          marginLeft: '250px',
          marginRight: '250px',
          marginTop: '0px',
        }}
      >
        <p>
          Though the projects department is now home to 14 developers and counting, it remains the youngest editorial department in The Daily Californian. It began with Sahil Chinoy, a copy editor turned news reporter.
        </p>
        <p>
          As a reporter, Chinoy began what would become a data journalism career by adding illustrated maps and charts to his news stories. After spending the summer of 2015 interning at the Los Angeles Times Data and Graphics Department, Chinoy came back to The Daily Cal with a model and a mission: compile a team of people to work on visually engaging long-term projects.
        </p>
        <p>
          The team began with a couple of website developers and a voter survey for the ASUC elections. They soon realized, however, that WordPress--which hosts The Daily Cal website--wasn't going to accommodate the work they wanted to produce. So, they built their own.
        </p>
        <p>
          Despite their early success, the team soon dismantled when Chinoy went to study abroad, leaving no one to advocate for the potential department in upper management. It wasn’t until he came back for an extra semester that he became the first projects editor on the Senior Editorial Board, solidifying the department among the others.
        </p>
        <p>
          Since then, the department has developed its own website, doubled in size and been led by eight different head editors. The department has and will continue to grow.
        </p>
      </div>
      <br />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <h3>Current Developers</h3>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        Cameron Fozi, editor
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        Veronica Roseborough, deputy editor
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        Michelle Li
      </div>
    </div>
  </Layout>
);

export default withStyles(styles)(About);
