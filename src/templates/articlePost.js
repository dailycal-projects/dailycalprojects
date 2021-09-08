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
          <h5 style={{ marginTop: '10px' }}>{frontmatter.imageAttribution}</h5>
        </div>
        <div className={classes.articleContent}>
          <MDXRenderer
            localImages={frontmatter.embeddedImages} // prop that allows <GatsbyImage/> usage possible in MDX
          >
            {body}
          </MDXRenderer>
        </div>

        <div className={classes.articleFooter} style={{ marginTop: '50px' }}>
          <h3>
            <b>
              About this story
            </b>
          </h3>

          <div style={{ marginTop: '15px' }}>
            {frontmatter.aboutStory}
          </div>

          <div style={{ marginTop: '10px' }}>
            This project was written and developed by the Daily Californian's Projects Department.
          </div>

          <div style={{ marginTop: '15px' }}>
            Questions, comments or corrections? Email
            {' '}
            <a href="mailto: projects@dailycal.org.">projects@dailycal.org</a>
            .
          </div>

          <div style={{ marginTop: '15px' }}>
            Code, data, and text are open-source on
            {' '}
            <a href="https://github.com/dailycal-projects/dailycalprojects">GitHub</a>
            .
            <div style={{ marginTop: '25px' }}>
              <h3>
                <b>
                  Support us
                </b>
              </h3>
            </div>

            <div style={{ marginTop: '15px' }}>
              We're a nonprofit, student-run newsroom. Please consider
              {' '}
              <a href="https://donate.dailycal.org">donating</a>
              {' '}
              to support our coverage.
            </div>
          </div>
        </div>

        <div className={classes.articleCopyright} style={{ marginTop: '20px' }}>
          <b>
            Copyright © 2021 The Daily Californian, The Independent Berkeley Student Publishing Co., Inc.
          </b>
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
        aboutStory
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
