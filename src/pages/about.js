import * as React from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customTheme';

import NavBar from '../components/navBar';
import Seo from '../components/seo';

const staffTitles = {
  titles: [
    { name: 'Arfa Momin', title: 'the projects editor' },
    { name: 'Tyler Wu', title: 'a deputy projects editor' },
    { name: 'Anika Sikka', title: 'a deputy projects editor' },
    { name: 'Cameron Fozi', title: 'a projects developer and the projects training manager. He was the spring, summer and fall 2022 projects editor' },
    { name: 'Paloma Torres', title: 'a projects developer. She was the spring, fall and summer 2023 projects editor' },
    { name: 'Veronica Roseborough', title: 'a projects developer and a staff representative. She was the spring 2022 deputy projects editor' },
    { name: 'Nibras Suliman', title: 'a projects developer. She was a spring 2023 deputy projects editor' },
    { name: 'Isabella Borkovic', title: 'a projects developer. She was a spring 2023 deputy projects editor' },
    { name: 'Lydia Sidhom', title: 'a projects developer. She was a fall 2023 deputy projects editor' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Rayan Taghizadeh', title: 'a projects developer' },
    { name: 'Mark Verzhbinsky', title: 'a projects developer' },
    { name: 'Lauren Lee', title: 'a projects developer' },
    { name: 'Riya Chopra', title: 'a projects developer' },
    { name: 'Clara Brownstein', title: 'a projects developer' },
    { name: 'Angela Bi', title: 'a projects developer' },
    { name: 'Emile Shah', title: 'a projects developer' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Claire Roach', title: 'a projects developer' },
    { name: 'Sam Wang', title: 'a projects developer' },
    { name: 'Andy Chen', title: 'a projects developer' },
    { name: 'Nikki Iyer', title: 'a projects developer' },
    { name: 'John Bragado', title: 'a projects developer' },
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
        <p style={{ paddingLeft: '5px' }}> Copyright © 2024 The Daily Californian, The Independent Berkeley Student Publishing Co., Inc. </p>
      </div>
    </div>
  </div>
);

export default withStyles(styles)(About);
