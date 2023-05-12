import * as React from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customTheme';
import { staffTitles } from '../templates/staffDesignations';

import NavBar from '../components/navBar';
import Seo from '../components/seo';

const About = ({ classes }) => (
  <div className={classes.main}>
    <NavBar />
    <Seo title="About" />
    <div className={classes.header}>
      <h1>Meet the team</h1>
    </div>
    <div className={classes.articleRoot}>
      <div className={classes.footerContainer}>
        {staffTitles.titles.map((item) => (

          <div className={classes.footerCard}>

            <h3>
              <b>
                {' '}
                {item.name}
                {' '}
              </b>
            </h3>
            <p>
              {' '}
              {item.name}
              {' '}
              is
              {' '}
              {item.title}
              .
              {' '}
            </p>
          </div>
        ))}
        <br />
        <div className={classes.footerCard}>
          <h3>
            <b>
              Support us
            </b>
          </h3>
          <p>
            We are a nonprofit, student-run newsroom. Please consider
            {' '}
            <a href="https://donate.dailycal.org">donating</a>
            {' '}
            to support our coverage.
          </p>
        </div>
        <p style={{ paddingLeft: '5px' }}> Copyright © 2022 The Daily Californian, The Independent Berkeley Student Publishing Co., Inc. </p>
      </div>
    </div>
  </div>
);

export default withStyles(styles)(About);
