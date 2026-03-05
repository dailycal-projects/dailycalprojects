import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const FooterBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 2.5, 0),
  margin: theme.spacing(1.25, 0, 2.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const ArticleFooter = ({ about }) => (
  <Box sx={{ maxWidth: 640, marginTop: 2 }}>
    <FooterBox>
      <Typography variant="h6" fontWeight="bold">
        About this story
      </Typography>

      <Typography variant="body2">
        This project was developed by the Data Department at The Daily Californian.
      </Typography>

      <Typography variant="body2">
        {about}
      </Typography>

      <Typography variant="body2">
        Questions, comments or corrections? Email{' '}
        <Box component="a" href="mailto:dataeditors@dailycal.org">
          dataeditors@dailycal.org
        </Box>
        . Code, data and text are open-source on{' '}
        <Box component="a" href="https://github.com/dailycal-projects/dailycalprojects">
          GitHub
        </Box>.
      </Typography>
    </FooterBox>

    <FooterBox>
      <Typography variant="h6" fontWeight="bold">
        Support us
      </Typography>

      <Typography variant="body2">
        We are a nonprofit, student-run newsroom. Please consider{' '}
        <Box component="a" href="https://givebutter.com/w68cQv">
          donating
        </Box>{' '}
        to support our coverage.
      </Typography>
    </FooterBox>

    <Typography variant="caption">
      Copyright © 2025 The Daily Californian,
      The Independent Berkeley Student Publishing Co., Inc.
    </Typography>
  </Box>
);

export default ArticleFooter;