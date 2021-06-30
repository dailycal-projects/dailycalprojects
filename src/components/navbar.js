import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/customTheme.js';
import { Link } from 'gatsby'


const NavBar = ({ classes, children }) => { //children is content
  return (
    <div className={classes.navHeader}> 
      <div className={classes.navBar}>
          <Link to="/" className={classes.navText}>Home.</Link> {}
          <Link to="/about/" className={classes.navText}> About.</Link> 
      </div>
    </div>
  )
}

export default withStyles(styles)(NavBar)