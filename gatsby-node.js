/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// You can delete this file if you're not using it

const path = require('path')

exports.createPages = (({graphql, actions}) => {
    const { createPage } = actions //destructure 

    return new Promise((resolve, reject) => {
        const articlePostTemplate = path.resolve('src/templates/articlePost.js')

        resolve( //get all markdown data ready
            graphql( 
                `
                    query {
                        allMarkdownRemark {
                            edges {
                                node {
                                    frontmatter {
                                        path 
                                    }
                                }
                            }
                        }
                    }
                `
            ).then(result => { // create pages for each markdown file 
                result.data.allMarkdownRemark.edges.forEach(({node}) => {
                    const path = node.frontmatter.path //get url path
                    createPage({
                        path, 
                        component: articlePostTemplate, //component that displays markdown file content
                        context: {
                            pathSlug: path
                        }
                    })
                    resolve()
                })
            })
        )
    }) 
})