import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'gatsby';
import { styles } from '../styles/customTheme';
import logo from '../images/dclogoblack.png';

const Logo = ({ classes }) => (
  <Link to="/" style={{ textDecoration: 'none' }}>
    <div className={classes.topBar} id="topBar">
      <img src={logo} alt="The Daily Californian" className={classes.logo} id="logo" />
    </div>
  </Link>
);

export default withStyles(styles)(Logo);
