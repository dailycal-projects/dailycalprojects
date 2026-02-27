import { styles } from '../styles/customTheme';

function formatDate(dateStr) {
  return dateStr.replace(/\b0(?=\d)/, ''); // remove leading zeros
}

const ArticleCard = ({
  title, date, image,
}) => (
  <div>
    <Card sx={styles.card}>
      <Box sx={styles.date}>
        {formatDate(date)}
      </Box>
      <Box sx={styles.cardImage}>
        <GatsbyImage image={image} />
      </Box>
      <Box sx={styles.cardContent}>
        <Box sx={styles.articleTitle}>
          {title}
        </Box>
      </Box>
    </Card>
  </div>
);

export default ArticleCard;

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
