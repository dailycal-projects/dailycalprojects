/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

module.exports = {
  // Site-wide metadata
  siteMetadata: {
    title: 'The Daily Californian',
    description: 'Investigative stories, data analysis and graphics by The Daily Californian’s Data Team',
    author: '@shannonbonet',
    siteUrl: 'https://data.dailycal.org/',
  },
  
  // Gatsby build flags
  flags: {
    // preserves files + cache except on `gatsby clean`
    PRESERVE_FILE_DOWNLOAD_CACHE: true,
    PRESERVE_WEBPACK_CACHE: true,
  },
  plugins: [
    "gatsby-transformer-sharp", // Needed for dynamic images
    "gatsby-plugin-image",
    "gatsby-plugin-react-leaflet",
    {
      resolve: "gatsby-plugin-sharp",
      options: {
        defaults: {
          quality: 70,
          placeholder: "blurred",
        },
      },
    },
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 1000,
            },
          },
        ],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "articles",
        path: `${__dirname}/src/articles`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "src",
        path: "./src",
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /assets/,
        },
      },
    },
  ],
};
