/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */
const { ThemeProvider } = require('@mui/material');
const React = require('react');
const { HelmetProvider } = require('react-helmet-async');
const { theme } = require('./src/styles/theme');

/**
 * Wraps the root element in another element.
 * This puts a HelmetProvider element around the entire page, which allows the react helmet
 * elements to work properly.
 */
exports.wrapRootElement = ({ element }) => {
  return (
    <HelmetProvider>
      <ThemeProvider theme={ theme }>
        {element}
      </ThemeProvider>
    </HelmetProvider>
  )
};

