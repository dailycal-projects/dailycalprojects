import * as React from "react"
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customTheme.js';
import ArticleCard from '../components/articleCard.js'
import butterfly from '../images/butterfly.png'
import Header from '../components/header.js'
import { graphql, Link } from 'gatsby'

import NavBar from "../components/navBar"
import Seo from "../components/seo"

const IndexPage = ({classes, data}) => {
  const {edges} = data.allMarkdownRemark // returns nodes; each node is an article post 
  console.log(edges)

  return (
    <div className={classes.main}>
      <NavBar/>
      <Seo title="Daily Cal Projects" />
        <Header/> 
        <div className={classes.index}>
          {edges.map(edge => { //map over edges and render frontmatter content from markdown files 
            const {frontmatter} = edge.node 


            return (
              <div key={frontmatter.path}>
                <Link to={frontmatter.path}>
                <ArticleCard
                  title={frontmatter.title}
                  author={frontmatter.byline}
                  date={frontmatter.date}
                  image={frontmatter.featuredImage.publicURL}/> 
                </Link>
              </div>
            )
          })}
        </div>
    </div>
  )
}

export const query = graphql`
  query HomepageQuery {
    allMarkdownRemark (
      sort: {order: DESC, fields: [frontmatter___date]}
    ){
      edges {
        node {
          frontmatter {
            title
            path
            date(formatString: "MMMM DD, YYYY")
            subhead
            byline
            featuredImage {
              publicURL
            } 
          } 
        }
      } 
    }
  }
`

export default withStyles(styles)(IndexPage)
