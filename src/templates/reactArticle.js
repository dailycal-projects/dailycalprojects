import React from 'react';
import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { Helmet } from 'react-helmet';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { styles } from '../styles/customTheme';

/**
 * A blank template for articles with noTemplate: true frontmatter set.
 */
const ReactArticle = ({ data, location }) => { // data.markdownRemark holds your article data
  const { frontmatter, body } = data.mdx;
  const socialImage = frontmatter.featuredImage
    ? frontmatter.featuredImage.childImageSharp.resize
    : null;

  return (
    <Layout>
      <Helmet>
        <style>
          {`
            html, body {
              overflow: hidden;
              margin: 0;
              padding: 0;
            }
          `}
        </style>
      </Helmet>
      <SEO
        title={frontmatter.title}
        description={frontmatter.subhead}
        image={socialImage}
        pathname={location.pathname}
      />
      <div style={{ width: '100vw', height: '100vh' }}>
        <MDXRenderer>
          {body}
        </MDXRenderer>
      </div>
    </Layout>
  );
};

export const pageQuery = graphql`
  query($slug: String!) {
    mdx(slug: { eq: $slug } ) {
      body
      frontmatter {
        title
        subhead
        featuredImage {
          childImageSharp {
            resize(width: 1200) {
              src
              height
              width
            }
            gatsbyImageData(width: 750)
          }
        }
      }
    }
  }
`;

export default withStyles(styles)(ReactArticle);
