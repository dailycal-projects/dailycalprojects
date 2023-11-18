import * as React from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customTheme';

import NavBar from '../components/navBar';
import Seo from '../components/seo';

const staffTitles = {
  titles: [
    { name: 'Paloma Torres', title: 'the projects editor' },
    { name: 'Arfa Momin', title: 'the deputy projects editor' },
    { name: 'Lydia Sidhom', title: 'the deputy projects editor' },
    { name: 'Cameron Fozi', title: 'a projects developer and the projects training manager. He was the spring, summer and fall 2022 projects editor' },
    { name: 'Nibras Suliman', title: 'a projects developer. She was a spring 2023 deputy projects editor' },
    { name: 'Isabella Borkovic', title: 'a projects developer. She was a spring 2023 deputy projects editor' },
    { name: 'Tyler Wu', title: 'a projects developer' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Rayan Taghizadeh', title: 'a projects developer' },
    { name: 'Mark Verzhbinsky', title: 'a projects developer' },
    { name: 'Lauren Lee', title: 'a projects developer' },
    { name: 'Riya Chopra', title: 'a projects developer' },
    { name: 'Clara Brownstein', title: 'a projects developer' },
    { name: 'Angela Bi', title: 'a projects developer' },
    { name: 'Emile Shah', title: 'a projects developer' },
    { name: 'Anika Sikka', title: 'a projects developer' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Claire Roach', title: 'a projects developer' },
  ],
};

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
