import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'gatsby';
import { styles } from '../styles/customTheme';

const NavBar = ({ classes }) => (
  <div className={classes.navHeader}>
    <div className={classes.navBar}>
      <Link to="/" className={classes.navText}>Home.</Link>
      <Link to="/about/" className={classes.navText}> About.</Link>
    </div>
  </div>
);

export default withStyles(styles)(NavBar);
