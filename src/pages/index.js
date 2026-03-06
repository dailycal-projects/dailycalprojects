import * as React from 'react';
import { withStyles } from '@material-ui/core';
import { graphql, Link } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';
import ArticleCard from '../components/articleCard';
import Layout from '../components/layout';
import Seo from '../components/seo';
import circlelogo from '../images/dclogocircle.png';
import logo from '../images/dclogoblack.png';
import { theme } from '../styles/theme';

const IndexPage = ({ classes, data }) => {
  const buildExamples = process.env.GATSBY_BUILD_EXAMPLES === 'true';
  const articles = data.allMdx.edges;

  return (
    <Layout>
      <div className={classes.main}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className={classes.topBar}>
            <img src={logo} alt="The Daily Californian" style={{ height: '20px', marginTop: '25px' }} />
          </div>
        </Link>
        {/* <Seo title="Daily Cal Data" /> */}
        <div className={classes.content}>
          <div className={classes.intro}>
            <img src={circlelogo} alt="The Daily Californian" width="100" style={{ margin: '0px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h1 style={{
                fontFamily: 'Georgia', fontSize: theme.spacing[5], fontWeight: 800, margin: 0, color: theme.palette.black,
              }}
              >
                Data
              </h1>
              <p style={{ fontFamily: 'Georgia', margin: 0, color: theme.palette.darkGrey }}>Investigative stories, data analysis and graphics by The Daily Californian’s Data Team</p>
            </div>

          </div>
          <div className={classes.index}>
            {articles.map(({ node }) => { // map over edges and render frontmatter content from markdown files
              const { frontmatter, slug } = node;
              const image = getImage(frontmatter.featuredImage);

              // Don't put links for examples that are not built
              if (frontmatter.example && !buildExamples) return;

              if (!frontmatter.oldLink) {
                return (
                  <Link to={slug} key={slug} style={{ textDecoration: 'none' }}>
                    <ArticleCard
                      title={frontmatter.title}
                      date={frontmatter.date}
                      image={image}
                      byline={frontmatter.byline}
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
                    byline={frontmatter.byline}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
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
            example
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
