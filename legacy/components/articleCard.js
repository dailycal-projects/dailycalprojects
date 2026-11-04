import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { GatsbyImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';

function formatDate(dateStr) {
  return dateStr.replace(/\b0(?=\d)/, ''); // remove leading zeros
}
const ArticleCard = ({
  classes, title, date, image,
}) => (
  <div>
    <Card className={classes.card}>
      <div className={classes.date}>
        {formatDate(date)}
      </div>
      <div className={classes.cardImage}>
        <GatsbyImage image={image} />
      </div>
      <div className="cardContent">
        <div className={classes.articleTitle}>
          {title}
        </div>
      </div>
    </Card>
  </div>
);
export default withStyles(styles)(ArticleCard);

// // not in use yet
// function formatByline(byline) {
//   if (!byline) {
//     return '';
//   }
//   let names = byline.replace(/^By /, '').split(', ');

//   if (names[names.length - 1].includes(' and ')) {
//     const lastNames = names.pop().split(' and ');
//     names.push(lastNames[0], lastNames[1]);
//   }
//   names = names.map((name) => name.toUpperCase());

//   if (names.length > 2) {
//     return `By ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
//   }
//   return `By ${names.join(' and ')}`;
// }
