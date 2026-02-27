import { Link } from 'gatsby';
import { styles } from '../styles/customTheme';

const NavBar = () => (
  <Box sx={styles.navHeader}>
    <Box sx={styles.navBar}>
      <Box component={Link} to="/" sx={styles.navText}>
        Home.
      </Box>
      <Box component={Link} to="/about/" sx={styles.navText}>
        About.
      </Box>
    </Box>
  </Box>
);

export default NavBar;
