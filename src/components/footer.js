import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as styles from '../styles/footer.module.css';

const Footer = () => (
  <footer>
    <div id="global-footer">
      <p className="footer-text">
        Questions, comments or corrections? Email
        <a href="mailto:projects@dailycal.org">
          projects@dailycal.org
        </a>
        .
      </p>

      <p className="footer-text">
        Support innovative, independent student journalism.
        <a href="https://donate.dailycal.org/" target="_blank" rel="noreferrer">Donate today</a>
        .
      </p>

      <p className="footer-text">Copyright © 2020 The Daily Californian, The Independent Berkeley Student Publishing Co., Inc.</p>
    </div>
  </footer>
);
export default withStyles(styles)(Footer);
