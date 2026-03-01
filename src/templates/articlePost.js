import { graphql, Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';
import { theme } from '../styles/theme';
import logo from '../images/dclogoblack.png';
import React from "react";
import Box from '@mui/material/Box';
import Layout from "../components/layout";
import SEO from "../components/seo";
import ArticleFooter from '../components/articleFooter';
import { ScopeInjector } from '../components/scopeInjector';

const ArticlePost = ({ data, location, children }) => { // data.markdownRemark holds your article data
  const { frontmatter } = data.mdx;

  const {
    bylineName, bylineUrl,
  } = frontmatter;
  const image = getImage(frontmatter.featuredImage);
  const socialImage = frontmatter.featuredImage
    ? frontmatter.featuredImage.childImageSharp.resize
    : null;

  return (
    <Box sx={styles.articleRoot}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Box sx={styles.topBar}>
          <img src={logo} alt="The Daily Californian" style={{ height: '20px', marginTop: '25px' }} />
        </Box>
      </Link>
      <Layout localImages={frontmatter.embeddedImages}>
        <SEO
          title={frontmatter.title}
          description={frontmatter.subhead}
          image={socialImage}
          pathname={location.pathname}
        />
        <Box sx={styles.headerContainer}>
          <h1 style={styles.title}>{frontmatter.title}</h1>
          <h3 style={styles.subhead}>{frontmatter.subhead}</h3>
        </Box>
        <h5>{frontmatter.date}</h5>

        {!frontmatter.hideHeroImage && image && (
          <Box sx={styles.imageContainer}>
            <GatsbyImage image={image} />
            <Box sx={{ marginTop: '10px' }}><em>{frontmatter.imageCaption1}</em></Box>

            <h5 style={{ marginTop: '10px' }}>{frontmatter.imageAttribution}</h5>

          </Box>
        )}

        <Box sx={styles.articleContent}>

          {(bylineName && bylineUrl) ? (
            <Box sx={styles.byline}>
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
            </Box>
          ) : null}

          <ScopeInjector scope={{ localImages: frontmatter.embeddedImages }}>
            { children }
          </ScopeInjector>
        </Box>

        <ArticleFooter about={frontmatter.aboutStory} />
      </Layout>
    </Box>
  );
};

export const pageQuery = graphql`
  query($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
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

export default ArticlePost;
