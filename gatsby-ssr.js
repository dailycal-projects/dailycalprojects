/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */
const React = require('react');
const { HelmetProvider } = require('react-helmet-async');

/**
 * Wraps the root element in another element.
 * This puts a HelmetProvider element around the entire page, which allows the react helmet
 * elements to work properly.
 */
exports.wrapRootElement = ({ element }) => (
  React.createElement(HelmetProvider, null, element)
);
