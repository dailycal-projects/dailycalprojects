import React from 'react';
import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import Layout from '../components/layout';
import { styles } from '../styles/customTheme';

const ArticlePost = ({ classes, data }) => { // data.markdownRemark holds your article data
  const { frontmatter, body } = data.mdx;
  const image = getImage(frontmatter.featuredImage);

  return (
    <div className={classes.articleRoot}>
      <Layout>
        <h1>{frontmatter.title}</h1>
        <h3>{frontmatter.subhead}</h3>
        <div className={classes.byline}>{frontmatter.byline}</div>
        <h5>{frontmatter.date}</h5>
        <div style={{ margin: 50 }}>
          <GatsbyImage image={image} alt="card illustration" />
        </div>
        <div className={classes.articleContent}>
          <MDXRenderer
            localImages={frontmatter.embeddedImages} // props that allows <GatsbyImage/> usage possible in MDX
          >
            {body}
          </MDXRenderer>
        </div>
      </Layout>
    </div>
  );
};

export const pageQuery = graphql`
  query($slug: String!) {
    mdx(slug: { eq: $slug } ) {
      body
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        byline
        subhead
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 1000)
          } 
        }
        embeddedImages {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
`;

export default withStyles(styles)(ArticlePost);
