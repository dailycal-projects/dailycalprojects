import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { GatsbyImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';

const ArticleCard = ({
  classes, title, date, image,
}) => (
  <div>
    <Card className={classes.card}>
      <div className={classes.cardImage}>
        <GatsbyImage image={image} alt="pride illustration" />
      </div>
      <div className="cardContent">
        <h3 style={{ paddingBottom: 'none' }}>
          {title}
        </h3>
        <div className="cardHidden">
          <p>{date}</p>
        </div>
      </div>
    </Card>
  </div>
);
export default withStyles(styles)(ArticleCard);
