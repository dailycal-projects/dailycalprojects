import * as React from "react"
import { withStyles } from '@material-ui/core';
import { styles } from '../styles/customTheme.js';
import ArticleCard from '../components/articlecard.js'
import butterfly from '../images/butterfly.png'

import NavBar from "../components/navbar"
import Seo from "../components/seo"

const IndexPage = ({classes}) => (
  <div className={classes.main}>
      <NavBar/>
      <Seo title="About" />
        <h1>Daily Cal Projects</h1>
        <div className={classes.index}> 
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
        </div>
    </div>
)

export default withStyles(styles)(IndexPage)
