import * as React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/customTheme.js';
import GitHubIcon from '../assets/github.svg';
import DCIcon from '../assets/dailycal.svg';

const TitleAndDescription = ({ classes, data }) => {
  // to make sitewide edits, go to gatsby-config -> siteMetaData
  const { title } = data.site.siteMetadata;
  const { description } = data.site.siteMetadata;

  return (
    <div className={classes.header}>
      <h1>
        {' '}
        {title}
        {' '}
      </h1>
      <p>
        {' '}
        {description}
        {' '}
      </p>
      <div className={classes.icons}>
        <a href="https://github.com/dailycal-projects" key="dailycalgithub" style={{ textDecoration: 'none' }}>
          {' '}
          <GitHubIcon className={classes.iconHover} />
        </a>
        <a href="https://www.dailycal.org/" key="dailycal" style={{ textDecoration: 'none' }}>
          {' '}
          <DCIcon className={classes.iconHover} />
        </a>
      </div>
    </div>
  );
};

const Header = ({ classes }) => (
  <StaticQuery
    query={graphql`
          query {
            site {
              siteMetadata {
                title 
                description 
              }
            }
          }
        `}
    render={(data) => <TitleAndDescription classes={classes} data={data} />}
  />
);

export default withStyles(styles)(Header);
