import { createStyles } from '@material-ui/core';

const theme = {
  palette: {
    background: '#F8F8F8',
    black: '#0E141B',
    red: '#E2565F',
    redOrange: '#EA6B4E',
    orange: '#F28147',
    yellowOrange: '#F9A84A',
    yellow: '#FDD04C',
    yellowGreen: '#96C066',
    green: '#30B189',
    blueGreen: '#3FA6AB',
    darkBlueGreen: '#1D8B90',
    blue: '#4B9CCF',
    darkBlue: '#1D6A92',
    blueViolet: '#6F82B5',
    darkBlueViolet: '#606A97',
    violet: '#8E689B',
    redViolet: '#B8607E',
  },
  cardShadow: '0px 2px 0px 0.5px rgba(14, 20, 27, 0.15)',
  iconShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  spacing: [16, 20, 24, 30, 36, 48, 60],
};

export const styles = () => createStyles({
  main: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  navHeader: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  navBar: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: theme.spacing[1],
    padding: '2rem',
  },
  navText: {
    textDecoration: 'none',
    color: theme.palette.black,
    padding: 4,
    transform: 'translate(-2px, 0px)',
    transition: 'all 300ms ease-out',
    '&:hover': {
      color: theme.palette.darkBlueGreen,
      transform: 'translate(2px, 0px)',
      transition: 'all 300ms ease-out',
    },
  },
  icons: {
    display: 'flex',
    width: '10vh',
    justifyContent: 'space-between',
  },
  iconHover: {
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      // boxShadow: theme.iconShadow,
      transform: 'translate(0px, -7px)',
      transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
  },
  index: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    // width: cardWidth,
    height: '350px',
    margin: '20px',
    boxShadow: 'none',
    borderRadius: '15px',
    backgroundColor: theme.palette.background,
    fontSize: theme.spacing[0],
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      boxShadow: theme.cardShadow,
      transform: 'translate(0px, -7px)',
      transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
    '& .cardContent': {
      padding: '1rem 1rem 0rem 1rem',
      transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
      overflow: 'hidden',
    },
    '& .cardHidden': {
      transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
      visibility: 'hidden',
      height: 0,
      overflow: 'hidden',
    },
    '&:hover .cardContent': {
      transform: 'translate(0px, -1px)',
      transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
    '&:hover .cardHidden': {
      transform: 'translate(0px, -1px)',
      transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
      visibility: 'visible',
      height: 'auto',
    },
  },
  cardImage: {
    width: '100%',
    height: '240px',
  },
  imageHolder: {
    background: 'linear-gradient(180deg, rgba(0,0,0,0.7471580933988764) 0%, rgba(0,0,0,0.4090260709269663) 16%, rgba(0,0,0,0.0916103405898876) 67%, rgba(0,0,0,0) 89%)',
  },
  cardContent: {
    padding: '1rem 1rem 0rem 1rem',
  },
  articleRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  articleContent: {
    maxWidth: '70vh',
    textAlign: 'justify',
  },
  byline: {
    // textTransform: 'uppercase',
  },
});
