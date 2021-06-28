import React from "react"
import { graphql } from "gatsby"
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/customTheme.js';
import { MDXRenderer } from "gatsby-plugin-mdx"


const ArticlePost = ({classes, data}) => { // data.markdownRemark holds your article data
    const { frontmatter, body } = data.mdx
    
    return (
        <div className={classes.articleRoot}>
            <h1>{frontmatter.title}</h1>
            <h4>{frontmatter.subhead}</h4>
            <h5>{frontmatter.byline}</h5>
            <h5>{frontmatter.date}</h5>
            <img src={frontmatter.featuredImage.publicURL}/>
            <MDXRenderer>{body}</MDXRenderer>
        </div>
    )
}
    
export const pageQuery = graphql`
  query($slug: String!) {
    mdx(fields: {slug: { eq: $slug }} ) {
      body
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        byline
        subhead
        featuredImage {
          publicURL
        } 
      }
    }
  }
`

export default withStyles(styles)(ArticlePost)