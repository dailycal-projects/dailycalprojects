import { graphql } from 'gatsby';
import { styles } from '../styles/customTheme';
import GitHubIcon from '../assets/github.svg';
import DCIcon from '../assets/dailycal.svg';

const TitleAndDescription = ({ data }) => {
  // to make site-wide edits, go to gatsby-config -> siteMetaData
  const { title, description } = data.site.siteMetadata;

  return (
    <Box sx={styles.header}>
      <h1>
        {' '}
        {title}
        {' '}
      </h1>
      <p>
        {' '}
        {description}
        {' '}
      </p>
      <Box sx={styles.icons}>
        <Box 
          component="a"
          href="https://github.com/dailycal-projects" 
          key="dailycalgithub" 
          style={{ textDecoration: 'none', ...styles.iconHover }}
        >
          <GitHubIcon />
        </Box>
        <Box
          component="a" 
          href="https://www.dailycal.org/" 
          key="dailycal" 
          style={{ textDecoration: 'none', ...styles.iconHover }}
        >
          <DCIcon />
        </Box>
      </Box>
    </Box>
  );
};

const Header = () => (
  <StaticQuery
    query={graphql`
          query {
            site {
              siteMetadata {
                title 
                description 
              }
            }
          }
        `}
    render={(data) => <TitleAndDescription data={data} />}
  />
);

export default Header;
