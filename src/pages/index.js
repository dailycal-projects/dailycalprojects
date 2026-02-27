import { graphql } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';
import circlelogo from '../images/dclogocircle.png';
import logo from '../images/dclogoblack.png';
import { theme } from '../styles/theme';

const IndexPage = ({ data }) => {
  const articles = data.allMdx.edges;

  return (
    <Layout>
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
                fontFamily: 'Georgia', fontSize: theme.spacing[5], fontWeight: 800, margin: 0, color: theme.palette.black,
              }}
              >
                Data
              </h1>
              <p style={{ fontFamily: 'Georgia', margin: 0, color: theme.palette.darkGrey }}>Investigative stories, data analysis and graphics by The Daily Californian’s Data Team</p>
            </Box>

          </Box>
          <Box sx={styles.index}>
            {articles.map(({ node }) => { // map over edges and render frontmatter content from markdown files
              const { frontmatter, slug } = node;
              const image = getImage(frontmatter.featuredImage);

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
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export const query = graphql`
  query HomepageQuery {
    allMdx(sort: {frontmatter: {date: DESC}}) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            subhead
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
  }
`;

export default IndexPage;
