import * as React from 'react';
import { withStyles } from '@material-ui/core';
import Seo from '../components/seo';
import { styles } from '../styles/customTheme';

const NotFoundPage = ({ classes }) => (
  <div className={classes.main}>
    <Seo title="404: Not found" />
    <h1>404: Not Found</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </div>
);

export default withStyles(styles)(NotFoundPage);
