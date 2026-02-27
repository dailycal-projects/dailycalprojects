import { styles } from '../styles/customTheme';

const ArticleFooter = ({ about }) => (
  <Box sx={styles.footerContainer}>
    <br />
    <Box sx={styles.footerCard}>
      <h3>
        <b> About this story </b>
      </h3>
      <p> This project was developed by the Data Department at The Daily Californian. </p>
      <p>
        {about}
      </p>
      <p>
        Questions, comments or corrections? Email
        {' '}
        <a href="mailto: projects@dailycal.org.">projects@dailycal.org</a>
        . Code, data and text are open-source on
        {' '}
        <a href="https://github.com/dailycal-projects/dailycalprojects">GitHub</a>
        .
      </p>
    </Box>

    <Box sx={styles.footerCard}>
      <h3>
        <b>
          Support us
        </b>
      </h3>
      <p>
        We are a nonprofit, student-run newsroom. Please consider
        {' '}
        <a href="https://givebutter.com/w68cQv">donating</a>
        {' '}
        to support our coverage.
      </p>
    </Box>
    <p style={{ fontSize: '14px' }}> Copyright © 2025 The Daily Californian, The Independent Berkeley Student Publishing Co., Inc. </p>
  </Box>
);

export default ArticleFooter;
