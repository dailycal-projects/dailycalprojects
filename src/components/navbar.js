import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'gatsby';
import { styles } from '../styles/customTheme.js';

const NavBar = ({ classes }) => // children is content
  (
    <div className={classes.navHeader}>
      <div className={classes.navBar}>
        <Link to="/" className={classes.navText}>Home.</Link>
        {' '}
        {}
        <Link to="/about/" className={classes.navText}> About.</Link>
      </div>
    </div>
  );

export default withStyles(styles)(NavBar);
