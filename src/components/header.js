import React from 'react';
import { Link } from 'gatsby';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import logo from '../images/dclogoblack.png';

/**
 * Top bar used on all site pages.
 */
const Header = () => {
  const theme = useTheme();

  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.background.default,
        zIndex: 9999,
        borderBottom: "1px solid #D3D3D3",
      }}>
        <Box
          component="img"
          src={logo}
          alt="The Daily Californian"
          sx={{
            height: 20,
            mt: '25px', // margin-top
            mb: "1.45rem"
          }}
        />
      </Box>
    </Link>
  );
};

export default Header;