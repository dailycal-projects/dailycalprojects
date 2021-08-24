import React from 'react';
import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { styles } from '../styles/customTheme';
import { theme } from '../styles/theme';
import FBIcon from '../assets/facebook.svg';
import TwitterIcon from '../assets/twitter.svg';

const ArticleHeader = ({ classes }) => (
  <div style={{
    width: '100%', height: '40px', backgroundColor: '#264559', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0px 10px 0px 10px',
  }}
  >
    <FBIcon className={classes.iconHover} />
    <TwitterIcon className={classes.iconHover} />
  </div>
);

export default withStyles(styles)(ArticleHeader);
