import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { GatsbyImage } from 'gatsby-plugin-image';
import { useTheme } from '@mui/material';

/**
 * Removes leading zeros from date strings.
 */
function formatDate(dateStr) {
  return dateStr.replace(/\b0(?=\d)/, '');
}

const ArticleCard = ({ title, date, image }) => {
  const theme = useTheme();

  return (
    <Box>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          width: { xs: 350, sm: 360 },
          height: 350,
          margin: 2,
          boxShadow: "none",
          bgcolor: theme.palette.background.default,
          fontSize: theme.typography.body2.fontSize,
          transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Date */}
        <Box
          sx={{
            color: theme.palette.grey[700],
            borderTop: 1,
            borderColor: theme.palette.grey[400],
            fontWeight: theme.typography.body2.fontWeight,
            lineHeight: "normal",
            fontSize: theme.typography.caption.fontSize,
            py: 1,
            px: 2,
          }}
        >
          {formatDate(date)}
        </Box>

        {/* Image */}
        <Box sx={{ width: "100%", height: 230 }}>
          <GatsbyImage image={image} alt={title} style={{ height: "100%" }} />
        </Box>

        {/* Title */}
        <Box sx={{ p: 2, pt: 1 }}>
          <Box
            sx={{
              fontWeight: theme.typography.h6.fontWeight,
              lineHeight: "normal",
              color: theme.palette.text.primary,
              fontSize: theme.typography.h6.fontSize,
              textDecoration: "none",
            }}
          >
            {title}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ArticleCard;