/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

/**
 * Creates pages for each MDX article using the template.
 */
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const articleTemplate = path.resolve("src/templates/articlePost.js");

  // Query MDX files
  const result = await graphql(`
    {
      allMdx(sort: { frontmatter: { date: DESC } }) {
        nodes {
          id
          internal {
            contentFilePath
          }
          fields {
            slug
          }
          frontmatter {
            oldLink
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  // Create article pages
  const posts = result.data.allMdx.nodes;

  posts.forEach(({ fields: { slug }, frontmatter: { oldLink }, internal: { contentFilePath } }) => {
    // Skip pages with oldLink
    if (oldLink !== null) {
      // TODO make redirect pages for these so they appear in the sitemap
      console.log(`Not building page for ${slug} because of oldLink frontmatter`);
      return;
    }

    // Create page
    createPage({
      path: slug,
      component: `${articleTemplate}?__contentFilePath=${contentFilePath}`,
      context: {
        slug
      },
    });
  });
};

/**
 * Called on every node (file, images, etc) in GraphQL layer.
 * Attaches slug fields to each MDX file.
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === "Mdx") {
    // Create URL-friendly path from mdx file name
    const value = createFilePath({ node, getNode });

    // Make that file path the "slug" field of the MDX node
    createNodeField({
      name: "slug",
      node,
      value,
    });
  }
};

/**
 * During server-side rendering, do not render leaflet maps.
 * (These can only run in browser, so it would cause errors)
 */
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {  
  if (stage === "build-html" || stage === "develop-html") {
    console.log("Disabling leaflet rendering");

    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /react-leaflet/,
            use: loaders.null(),
          },
        ],
      },
    });
  }
};
