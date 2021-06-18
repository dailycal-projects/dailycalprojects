import React from "react"
import { graphql } from "gatsby"
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/customTheme.js';


const ArticlePost = ({classes, data}) => {
    const { markdownRemark } = data // data.markdownRemark holds your article data
    const { frontmatter, html } = markdownRemark
    
    return (
        <div className={classes.articleRoot}>
            <h1>{frontmatter.title}</h1>
            <h4>{frontmatter.subhead}</h4>
            <h5>{frontmatter.byline}</h5>
            <h5>{frontmatter.date}</h5>
            <div
            className={classes.articleContent}
            dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}
    
export const pageQuery = graphql`
  query($pathSlug: String!) {
    markdownRemark(frontmatter: {path: { eq: $pathSlug }} ) {
      html
      frontmatter {
        path 
        date(formatString: "MMMM DD, YYYY")
        title
        byline
        subhead
      }
    }
  }
`

export default withStyles(styles)(ArticlePost)