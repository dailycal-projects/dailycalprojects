import * as React from "react"
import { StaticQuery, graphql } from 'gatsby'
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/customTheme.js';

const TitleAndDescription = ({classes, data}) => {

    //to make sitewide edits, go to gatsby-config -> siteMetaData
    const title = data.site.siteMetadata.title; 
    const description = data.site.siteMetadata.description; 
  
    return (
      <div className={classes.header}> 
        <h1> {title} </h1>
        <p> {description} </p>
      </div>
    )
  }

  const Header = ({classes}) => {
    return (
      <StaticQuery 
        query={graphql`
          query {
            site {
              siteMetadata {
                title 
                description 
              }
            }
          }
        `}
        render={data => <TitleAndDescription classes={classes} data={data} /> } 
      />
    ) 
  }

  export default withStyles(styles)(Header)