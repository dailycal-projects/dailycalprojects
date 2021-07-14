import * as React from 'react';
import { withStyles } from '@material-ui/core';
import { graphql, Link } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';
import ArticleCard from '../components/articleCard';
import Header from '../components/header';

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
          const image = getImage(frontmatter.featuredImage);

          if (!frontmatter.oldLink) {
            return (
              <Link to={slug} key={slug} style={{ textDecoration: 'none' }}>
                <ArticleCard
                  title={frontmatter.title}
                  date={frontmatter.date}
                  image={image}
                />
              </Link>
            );
          }
          return (
            <a href={frontmatter.oldLink} key={slug} style={{ textDecoration: 'none' }}>
              <ArticleCard
                title={frontmatter.title}
                date={frontmatter.date}
                image={image}
              />
            </a>
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
            oldLink
            featuredImage {
              childImageSharp {
                gatsbyImageData(width: 450 height: 250)
              } 
            }
          } 
        }
      } 
    }
  }
`;

export default withStyles(styles)(IndexPage);
