import { withStyles } from "@material-ui/core";
import * as React from "react";

import NavBar from "../components/navBar";
import Seo from "../components/seo";
import { styles } from "../styles/customTheme";

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
