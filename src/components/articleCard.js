import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { GatsbyImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';

const ArticleCard = ({
  classes, title, date, image,
}) => {
  const useWindowWidth = () => {
    const isBrowser = typeof window !== 'undefined';
    const [width, setWidth] = useState(isBrowser ? window.innerWidth : 0);

    useEffect(() => {
      if (isBrowser && width <= 360) { setCard('340px'); } else { setCard('450px'); }
    }, width);
  };

  useWindowWidth();
  const [card, setCard] = useState('450px');

  return (
    <div>
      <Card className={classes.card} style={{ width: card }}>
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
};
export default withStyles(styles)(ArticleCard);
