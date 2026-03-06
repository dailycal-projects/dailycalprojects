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

  const buildExamples = process.env.GATSBY_BUILD_EXAMPLES === 'true';

  const articlePost = path.resolve('src/templates/articlePost.js');
  const reactArticlePost = path.resolve('src/templates/reactArticle.js');

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
                        frontmatter {
                          noTemplate
                          example
                        }
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
    const { noTemplate, example } = post.node.frontmatter;

    if (example && !buildExamples) {
      // Do not build examples if flag not set
      return;
    }

    createPage({
      path: post.node.slug,
      component: noTemplate ? reactArticlePost : articlePost,
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
