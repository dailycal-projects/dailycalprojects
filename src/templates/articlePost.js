import React from 'react';
import { graphql, Link } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { styles } from '../styles/customTheme';
import { theme } from '../styles/theme';
import ArticleFooter from '../components/articleFooter';
import logo from '../images/dclogoblack.png';

const ArticlePost = ({ classes, data, location }) => { // data.markdownRemark holds your article data
  const { frontmatter, body } = data.mdx;
  const {
    bylineName, bylineUrl,
  } = frontmatter;
  const image = getImage(frontmatter.featuredImage);
  const socialImage = frontmatter.featuredImage
    ? frontmatter.featuredImage.childImageSharp.resize
    : null;

  return (
    <div className={classes.articleRoot}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div className={classes.topBar}>
          <img src={logo} alt="The Daily Californian" style={{ height: '20px', marginTop: '25px' }} />
        </div>
      </Link>
      <Layout>
        <SEO
          title={frontmatter.title}
          description={frontmatter.subhead}
          image={socialImage}
          pathname={location.pathname}
        />
        <div className={classes.headerContainer}>
          <h1 className={classes.title}>{frontmatter.title}</h1>
          <h3 className={classes.subhead}>{frontmatter.subhead}</h3>
        </div>
        <h5>{frontmatter.date}</h5>

        {!frontmatter.hideHeroImage && image && (
          <div className={classes.imageContainer}>
            <GatsbyImage image={image} />
            <div style={{ marginTop: '10px' }}><em>{frontmatter.imageCaption1}</em></div>

            <h5 style={{ marginTop: '10px' }}>{frontmatter.imageAttribution}</h5>

          </div>
        )}

        <div className={classes.articleContent}>

          {(bylineName && bylineUrl) ? (
            <div className={classes.byline}>
              By
              {' '}
              {bylineName.map((author, i) => {
                const url = bylineUrl[i];
                const isLast = i === bylineName.length - 1;
                const isSecondToLast = i === bylineName.length - 2;
                return (
                  <React.Fragment key={i}>
                    <a
                      href={url}
                      target="_blank"
                      style={{ textDecoration: 'underline', color: theme.palette.darkBlue }}
                      rel="noreferrer"
                    >
                      {author}
                    </a>
                    {bylineName.length > 2 && !isLast && !isSecondToLast && ', '}
                    {isSecondToLast ? ' & ' : ''}
                  </React.Fragment>
                );
              })}
            </div>
          ) : null}
          <MDXRenderer
            localImages={frontmatter.embeddedImages} // prop that allows <GatsbyImage/> usage possible in MDX
          >
            {body}
          </MDXRenderer>
        </div>

        <ArticleFooter about={frontmatter.aboutStory} />
      </Layout>
    </div>
  );
};

export const pageQuery = graphql`
  query($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      body
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        bylineName
        bylineUrl
        subhead
        aboutStory
        hideHeroImage
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
        imageAttribution
        imageCaption1

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
