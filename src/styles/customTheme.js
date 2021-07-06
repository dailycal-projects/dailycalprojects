import { createStyles } from '@material-ui/core';

const theme = {
  palette: {
    background: '#F5F5F5',
    white: '#FFFFFF',
    black: '#0E141B',
    dcalBlue: '#0D96D8',
    grey: '#F7F7F7',
    babyBlue: '#C5EAFC',
    orangeAccent: '#FC9D5A',
  },
  greyShadow: '2px 2px 5px rgba(14, 20, 27, 0.15)',
  blueShadow: '2px 2px 5px #C5EAFC',
  spacing: [16, 20, 24, 30, 36, 48, 60],
};

export const styles = () => createStyles({
  main: {
    display: 'flex',
    flexDirection: 'column',
    margin: '3rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  navHeader: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  navBar: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: theme.spacing[1],
  },
  navText: {
    textDecoration: 'none',
    color: theme.palette.black,
    '&:hover': {
      color: theme.palette.orangeAccent,
      transform: 'translate(2px, 2px)',
      transition: 'all 300ms ease-out',
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
    width: '450px',
    height: '300px',
    margin: '20px',
    boxShadow: theme.greyShadow,
    borderRadius: '15px',
    padding: '1.5rem 1rem 0rem 1rem',
    color: theme.palette.white,
    fontSize: theme.spacing[0],
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      color: theme.palette.dcalBlue,
      transform: 'translate(0px, -5px)',
      transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
  },
  articleRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing[6],
    textAlign: 'justify',
  },
  articleContent: {
    maxWidth: '650px',
  },
  byline: {
    textTransform: 'uppercase',
  },
});
