import React from "react"
import { graphql } from "gatsby"


const ArticlePost = ({data}) => {
    const { markdownRemark } = data // data.markdownRemark holds your article data
    const { frontmatter, html } = markdownRemark
    return (
        <div className="articleRoot">
            <div className="articleHeader">
                <h1>{frontmatter.title}</h1>
                <h2>{frontmatter.date}</h2>
            <div
            className="articleContent"
            dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
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
        subhead
      }
    }
  }
`

export default ArticlePost 