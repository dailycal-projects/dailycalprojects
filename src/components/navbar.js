import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/customStyles.js';
import { Link } from 'gatsby'
// import { Typography } from '@material-ui/core';


const NavBar = ({ classes, children }) => { //children is content
  return (
          <div className={classes.header}> 
          <div className={classes.navBar}>
              <Link to="/" style={{ textDecoration: 'none' }}>Home</Link> {}
              <Link to="/about/" style={{ textDecoration: 'none' }}>About</Link> 
          </div>
            {children}
          </div>
  )
}

export default withStyles(styles)(NavBar)