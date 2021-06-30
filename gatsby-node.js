/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// You can delete this file if you're not using it

const path = require('path');

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
