import * as React from 'react';
import { withStyles } from '@material-ui/core';
import { graphql, Link } from 'gatsby';
import { styles } from '../styles/customTheme.js';
import ArticleCard from '../components/articleCard.js';
import Header from '../components/header.js';

import NavBar from '../components/navBar';
import Seo from '../components/seo';

const IndexPage = ({ classes, data }) => {
  const articles = data.allMdx.edges;

  return (
    <div className={classes.main}>
      <NavBar />
      <Seo title="Daily Cal Projects" />
      <Header />
      <div className={classes.index}>

        {articles.map(({ node }) => { // map over edges and render frontmatter content from markdown files
          const { frontmatter, slug } = node;

          return (
            <Link to={slug} key={slug}>
              <ArticleCard
                title={frontmatter.title}
                author={frontmatter.byline}
                date={frontmatter.date}
                image={frontmatter.featuredImage.publicURL}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const query = graphql`
  query HomepageQuery {
    allMdx (
      sort: {order: DESC, fields: [frontmatter___date]}
    ){
      edges {
        node {
          id 
          slug
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            subhead
            byline
            featuredImage {
              publicURL
            } 
          } 
        }
      } 
    }
  }
`;

export default withStyles(styles)(IndexPage);
