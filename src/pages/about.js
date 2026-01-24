import * as React from 'react';
import withStyles from '@mui/styles/withStyles';
import { styles } from '../styles/customTheme';

import NavBar from '../components/navBar';
import Seo from '../components/seo';

const About = ({ classes }) => (
  <div className={classes.main}>
    <NavBar />
    <Seo title="About" />
    <div className={classes.header}>
      <h1>Meet The Team</h1>
    </div>
  </div>
);

export default withStyles(styles)(About);
