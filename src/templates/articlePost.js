import React from 'react';
import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';

const ArticlePost = ({ classes, data }) => { // data.markdownRemark holds your article data
  const { frontmatter, body } = data.mdx;
  const image = getImage(frontmatter.featuredImage);
  console.log(image);

  return (
    <div className={classes.articleRoot}>
      <h1>{frontmatter.title}</h1>
      <h4>{frontmatter.subhead}</h4>
      <div className={classes.byline}>{frontmatter.byline}</div>
      <h5>{frontmatter.date}</h5>
      <GatsbyImage image={image} alt="pride illustration" />
      <MDXRenderer className={classes.articleContent}>{body}</MDXRenderer>
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
      }
    }
  }
`;

export default withStyles(styles)(ArticlePost);
