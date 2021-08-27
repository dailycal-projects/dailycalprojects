import React from 'react';
import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { styles } from '../styles/customTheme';
import { theme } from '../styles/theme';

const ArticlePost = ({ classes, data, location }) => { // data.markdownRemark holds your article data
  const { frontmatter, body } = data.mdx;
  const { bylineName, bylineUrl } = frontmatter;
  const image = getImage(frontmatter.featuredImage);
  const socialImage = frontmatter.featuredImage
    ? frontmatter.featuredImage.childImageSharp.resize
    : null;

  return (
    <div className={classes.articleRoot}>
      <Layout>
        <SEO
          title={frontmatter.title}
          description={frontmatter.subhead}
          image={socialImage}
          pathname={location.pathname}
        />
        <h1>{frontmatter.title}</h1>
        <h3>{frontmatter.subhead}</h3>
        {(bylineName && bylineUrl) ? (
          <div className={classes.byline}>
            {bylineName.map((author, i) => {
              const url = bylineUrl[i];
              return (
                <a href={url} style={{ textDecoration: 'underline', color: theme.palette.black, padding: '10px' }}>
                  {' '}
                  {author}
                  {' '}
                </a>
              );
            })}
          </div>
        ) : null }
        <h5>{frontmatter.date}</h5>
        <div style={{ margin: 50 }}>
          <GatsbyImage image={image} alt="card illustration" />
          <h5><b>{frontmatter.imageAttribution}</b></h5>
        </div>
        <div className={classes.articleContent}>
          <MDXRenderer
            localImages={frontmatter.embeddedImages} // prop that allows <GatsbyImage/> usage possible in MDX
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
        bylineName
        bylineUrl
        subhead
        featuredImage {
          childImageSharp {
            resize(width: 1200) {
              src
              height
              width
            }
            gatsbyImageData(width: 1000)
          } 
        }
        imageAttribution
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
