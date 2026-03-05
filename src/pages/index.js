import React from 'react';
import Box from '@mui/material/Box';
import { graphql, Link } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import ArticleCard from '../components/articleCard';
import circlelogo from '../images/dclogocircle.png';
import Header from '../components/header';
import { useTheme } from '@mui/material';

const IndexPage = ({ data }) => {
  const articles = data.allMdx.nodes;
  const theme = useTheme();

  return (
    <Box>
      <Header />
      {/* Page Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 4, md: 6 },
          px: 2,
          width: { xs: '100%', md: 1200 },
          mx: 'auto',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
            mb: 4,
          }}
        >
          <Box
            component="img"
            src={circlelogo}
            alt="The Daily Californian"
            sx={{ width: { xs: 80, sm: 100 }, m: 0 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box
              component="h1"
              sx={{
                fontFamily: 'Georgia',
                fontSize: "48px",
                fontWeight: 800,
                m: 0,
                color: theme.palette.text.primary,
              }}
            >
              Data
            </Box>
            <Box
              component="p"
              sx={{
                m: 0,
                color: theme.palette.grey[700],
                fontSize: theme.typography.body1.fontSize,
              }}
            >
              Investigative stories, data analysis and graphics by The Daily Californian’s Data Team
            </Box>
          </Box>
        </Box>

        {/* Article Cards Grid */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          {articles.map((node) => {
            const { frontmatter, fields } = node;
            const { featuredImage, oldLink, title, date, byline } = frontmatter;
            const { slug } = fields;
            const image = getImage(featuredImage);

            const content = (
              <ArticleCard title={title} date={date} image={image} byline={byline} />
            );

            return oldLink ? (
              <Box component="a" href={oldLink} key={slug} sx={{ textDecoration: 'none' }}>
                {content}
              </Box>
            ) : (
              <Box component={Link} to={slug} key={slug} sx={{ textDecoration: 'none' }}>
                {content}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

// GraphQL query
export const query = graphql`
  query HomepageQuery {
    allMdx(sort: { frontmatter: { date: DESC } }) {
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
