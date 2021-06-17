import * as React from "react"
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customTheme.js';
import ArticleCard from '../components/articlecard.js'
import butterfly from '../images/butterfly.png'
import Header from '../components/header.js'
import { graphql, Link } from 'gatsby'

import NavBar from "../components/navbar"
import Seo from "../components/seo"

const IndexPage = ({classes, data}) => {
  const {edges} = data.allMarkdownRemark // returns nodes 
  console.log(edges)
  // map over edges 

  return (
    <div className={classes.main}>
      <NavBar/>
      <Seo title="About" />
        <Header/> 
        {edges.map(edge => {
          const {frontmatter} = edge.node 
          return (
            <div key={frontmatter.path}>
              <Link to={frontmatter.path}>
                {frontmatter.title}
              </Link>
            </div>
          )
        })}
        {/* <div className={classes.index}> 
          <ArticleCard
            title="Gulp is Trash"
            author="Maia Alviar, Shannon Bonet, Michelle Li"
            date="January 1, 2021"
            image={butterfly}/> 
          <ArticleCard
            title="Gulp is Trash"
            author="Shannon Bonet"
            date="January 1, 2021"
            image={butterfly}
            /> 
          <ArticleCard
            title="Gulp is Trash"
            author="Shannon Bonet"
            date="January 1, 2021"
            image={butterfly}/> 
        </div> */}
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
            date
            subhead
          } 
        }
      } 
    }
  }
`

export default withStyles(styles)(IndexPage)
