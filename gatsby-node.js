/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// You can delete this file if you're not using it

const path = require('path')
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async({graphql, actions}) => {
    const {createPage} = actions 

    const articlePost = path.resolve('src/templates/articlePost.js')
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
                            title
                            date
                        }
                    }
                }
            }
        }
        `
    )

    if (result.errors) {
        throw results.errors 
    }

    //Create article post pages 

    const posts = result.data.allMdx.edges 
    
    posts.forEach((post, index) => {
        createPage({
            path: post.node.slug, 
            component: articlePost, 
            context: {
                slug: post.node.slug
            },
        })
    })
}

exports.onCreateNode = ({node, actions, getNode}) => {
    const {createNodeField} = actions 

    if (node.internal.type === 'Mdx') {
        const value = createFilePath({node, getNode})
        createNodeField({
            name: `slug`, 
            node, 
            value,
        })
    }
}

// exports.createPages = (({graphql, actions}) => {
//     const { createPage } = actions //destructure 

//     return new Promise((resolve, reject) => {
//         const articlePostTemplate = path.resolve('src/templates/articlePost.js')

//         resolve( //get all markdown data ready
//             graphql( 
//                 `
//                     query {
//                         allMdx {
//                             edges {
//                                 node {
//                                     frontmatter {
//                                         path 
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 `
//             ).then(result => { // create pages for each markdown file 
//                 result.data.allMarkdownRemark.edges.forEach(({node}) => {
//                     const path = node.frontmatter.path //get url path
//                     createPage({
//                         path, 
//                         component: articlePostTemplate, //component that displays markdown file content
//                         context: {
//                             pathSlug: path
//                         }
//                     })
//                     resolve()
//                 })
//             })
//         )
//     }) 
// })