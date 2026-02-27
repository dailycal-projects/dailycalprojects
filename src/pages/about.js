import { styles } from '../styles/customTheme';

const About = () => (
  <Box sx={styles.main}>
    <NavBar />
    <Seo title="About" />
    <Box sx={classes.header}>
      <h1>Meet The Team</h1>
    </Box>
  </Box>
);

export default About;
