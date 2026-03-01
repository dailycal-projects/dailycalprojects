import React from 'react';
import Box from '@mui/material/Box';
import { graphql, Link } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import ArticleCard from '../components/articleCard';
import { styles } from '../styles/customTheme';
import circlelogo from '../images/dclogocircle.png';
import logo from '../images/dclogoblack.png';
import { theme } from '../styles/theme';

const IndexPage = ({ data }) => {
  const articles = data.allMdx.nodes;

  return (
    <Box sx={styles.main}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Box sx={styles.topBar}>
          <img src={logo} alt="The Daily Californian" style={{ height: '20px', marginTop: '25px' }} />
        </Box>
      </Link>
      {/* <Seo title="Daily Cal Data" /> */}
      <Box sx={styles.content}>
        <Box sx={styles.intro}>
          <img src={circlelogo} alt="The Daily Californian" width="100" style={{ margin: '0px' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{
              fontFamily: 'Georgia', fontSize: theme.fontSizes[5], fontWeight: 800, margin: 0, color: theme.palette.black,
            }}
            >
              Data
            </h1>
            <p style={{ fontFamily: 'Georgia', margin: 0, color: theme.palette.darkGrey }}>Investigative stories, data analysis and graphics by The Daily Californian’s Data Team</p>
          </Box>

        </Box>
        <Box sx={styles.index}>
          {articles.map((node) => {
            // Unpack each mdx node data
            const { frontmatter, fields } = node;
            const { featuredImage, oldLink, title, date, byline } = frontmatter;
            const { slug } = fields;

            const image = getImage(featuredImage);

            // Link to page if not old link
            if (!oldLink) {
              return (
                <Link to={slug} key={slug} style={{ textDecoration: 'none' }}>
                  <ArticleCard
                    title={title}
                    date={date}
                    image={image}
                    byline={byline}
                  />
                </Link>
              );
            }

            // Link to old link
            return (
              <a href={frontmatter.oldLink} key={slug} style={{ textDecoration: 'none' }}>
                <ArticleCard
                  title={title}
                  date={date}
                  image={image}
                  byline={byline}
                />
              </a>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

// Graphql lookup for articles
export const query = graphql`
  query HomepageQuery {
    allMdx(sort: {frontmatter: {date: DESC}}) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          byline
          oldLink
          featuredImage {
            childImageSharp {
              gatsbyImageData(width: 450, height: 250)
            }
          }
        }
      }
    }
  }
`;

export default IndexPage;
