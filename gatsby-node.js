/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

import path from "path";
import { createFilePath } from "gatsby-source-filesystem";

/**
 * Creates pages for each MDX article using the template.
 */
export const createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const articleTemplate = path.resolve("src/templates/articlePost.js");
  const result = await graphql(`
    {
      allMdx(sort: { frontmatter: { date: DESC } }, limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  // Create article pages
  const posts = result.data.allMdx.edges;

  posts.forEach((post) => {
    const slug = post.node.fields?.slug;

    createPage({
      path: slug,
      component: articleTemplate,
      context: {
        slug,
      },
    });
  });
};

/**
 * Called on every node (file, images, etc) in GraphQL layer.
 * Attaches slug fields to each MDX file.
 */
export const onCreateNode = ({ node, actions, getNode }) => {
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
export const onCreateWebpackConfig = ({ stage, actions }) => {
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /react-leaflet/,
            use: require.resolve("null-loader"),
          },
        ],
      },
    });
  }
};
