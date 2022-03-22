import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/customTheme';

const ArticleFooter = ({ classes, about }) => (
  <div className={classes.footerContainer}>
    <br />
    <div className={classes.footerCard}>
      <h3>
        <b> About this story </b>
      </h3>
      <p> This project was developed by the Projects Department at The Daily Californian. </p>
      <p>
        {about}
      </p>
      <p>
        Questions, comments or corrections? Email
        {' '}
        <a href="mailto: projects@dailycal.org.">projects@dailycal.org</a>
        .
      </p>
      <p>
        Code, data and text are open-source on
        {' '}
        <a href="https://github.com/dailycal-projects/dailycalprojects">GitHub</a>
        .
      </p>
    </div>

    <div className={classes.footerCard}>
      <h3>
        <b>
          Support us
        </b>
      </h3>
      <p>
        We are a nonprofit, student-run newsroom. Please consider
        {' '}
        <a href="https://donate.dailycal.org">donating</a>
        {' '}
        to support our coverage.
      </p>
    </div>
    <p style={{ paddingLeft: '5px' }}> Copyright © 2022 The Daily Californian, The Independent Berkeley Student Publishing Co., Inc. </p>
  </div>
);

export default withStyles(styles)(ArticleFooter);
