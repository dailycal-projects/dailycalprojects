import React from 'react';
import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { isMobile } from 'react-device-detect';
import { MDXProvider } from '@mdx-js/react';
import ArticleTags from './articleTags';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { styles } from '../styles/customTheme';
import { theme } from '../styles/theme';
import ArticleFooter from '../components/articleFooter';
import StaffDesignations from './staffDesignations';

const ArticlePost = ({ classes, data, location }) => { // data.markdownRemark holds your article data
  const { frontmatter, body } = data.mdx;
  const { bylineName, bylineUrl } = frontmatter;
  const image = getImage(frontmatter.featuredImage);
  const socialImage = frontmatter.featuredImage
    ? frontmatter.featuredImage.childImageSharp.resize
    : null;

  const component = ArticleTags(isMobile);

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
                <a href={url} target="_blank" style={{ textDecoration: 'underline', color: theme.palette.black, padding: '10px' }} rel="noreferrer">
                  {' '}
                  {author}
                  {StaffDesignations(bylineName, author)}

                </a>
              );
            })}
          </div>
        ) : null }
        <h5>{frontmatter.date}</h5>
        <div style={{ margin: 50, fontSize: '18.5px' }}>
          <GatsbyImage image={image} alt="card illustration" />
          <div style={{ marginTop: '10px' }}><em>{frontmatter.imageCaption1}</em></div>
          <div><em>{frontmatter.imageCaption2}</em></div>
          <div><em>{frontmatter.imageCaption3}</em></div>
          <div><em>{frontmatter.imageCaption4}</em></div>

          <h5 style={{ fontSize: '18.5px', marginTop: '10px' }}>{frontmatter.imageAttribution}</h5>

        </div>

        <div
          className={classes.articleContent}
        >
          <MDXProvider components={component}>
            <MDXRenderer
              localImages={frontmatter.embeddedImages}
            >
              {body}
            </MDXRenderer>
          </MDXProvider>
        </div>

        <ArticleFooter about={frontmatter.aboutStory} />
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
        imageCaption1
        imageCaption2
        imageCaption3
        imageCaption4
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
