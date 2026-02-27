import React from 'react';
import Box from '@mui/material/Box';
import Seo from '../components/seo';
import { styles } from '../styles/customTheme';

const NotFoundPage = ( ) => (
  <Box sx={styles.main}>
    <Seo title="404: Not found" />
    <h1>404: Not Found</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Box>
);

export default NotFoundPage;
