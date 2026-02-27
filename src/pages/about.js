import React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../components/navBar';
import Seo from '../components/seo';
import { styles } from '../styles/customTheme';

const About = () => (
  <Box sx={styles.main}>
    <NavBar />
    <Seo title="About" />
    <Box sx={styles.header}>
      <h1>Meet The Team</h1>
    </Box>
  </Box>
);

export default About;
