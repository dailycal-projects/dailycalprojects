import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { styles } from '../styles/customTheme';

const ArticleCard = ({
  classes, title, author, date, image,
}) => {
  const backgroundImage = {
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
  };

  return (
    <Card style={backgroundImage} className={classes.card}>
      <h3>{title}</h3>
      <p>{date}</p>
      <p>
        {' '}
        {author}
        {' '}
      </p>
    </Card>
  );
};

export default withStyles(styles)(ArticleCard);
