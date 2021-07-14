import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { styles } from '../styles/customTheme';

const ArticleCard = ({
  classes, title, date, image,
}) => {
  const backgroundImage = {
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
  };

  return (
    <div>
      <Card className={classes.card}>
        <div style={backgroundImage} className={classes.cardImage} />
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
};

export default withStyles(styles)(ArticleCard);
