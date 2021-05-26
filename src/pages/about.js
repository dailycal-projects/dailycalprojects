import * as React from "react"
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customStyles.js';

import NavBar from "../components/navbar"
import Seo from "../components/seo"

const About = ( {classes} ) => (
    <div className={classes.main}>
        <NavBar/>
        <Seo title="About" />
        <h1>Meet The Team</h1>
    </div>
)

export default withStyles(styles)(About)
