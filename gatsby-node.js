/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// You can delete this file if you're not using it

const path = require('path');

// Meant to rid of the "MaxListenersExceededWarning" warnings
const { EventEmitter } = require('events');

EventEmitter.defaultMaxListeners = 20;

exports.createSchemaCustomization = ({ actions }) => {
  /* …your existing code… */
};

const { createFilePath } = require('gatsby-source-filesystem');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const articlePost = path.resolve('src/templates/articlePost.js');
  const result = await graphql(
    `
        {
            allMdx(
                sort: { fields: [frontmatter___date], order: DESC }
                limit: 1000
            ) {
                edges {
                    node {
                        id
                        slug
                    }
                }
            }
        }
        `,
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create article post pages
  const posts = result.data.allMdx.edges;

  posts.forEach((post) => {
    createPage({
      path: post.node.slug,
      component: articlePost,
      context: {
        slug: post.node.slug,
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'Mdx') {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: 'slug',
      node,
      value,
    });
  }
};

// during server side rendering, leaflet maps will be ignored
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html' || stage === 'develop-html') {
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

// exports.createSchemaCustomization = ({ actions }) => {
//   const { createTypes } = actions;
//   createTypes(`
//     type MdxFrontmatter {
//       date: String
//       title: String
//       byline: String
//       bylineName: [String]
//       subhead: String
//       featuredImage: String
//       bylineUrl: [String]
//       imageAttribution: String
//       imageCaption1: String
//       imageCaption2: String
//       imageCaption3: String
//       imageCaption4: String
//       embeddedImages: [String]
//     }
//   `);
// };
