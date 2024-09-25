/* eslint-disable import/prefer-default-export */
import { createStyles } from '@material-ui/core';
import { theme } from './theme';

export const styles = () => createStyles({
  main: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    backgroundColor: theme.palette.background,
    overflow: 'hidden',
  },
  sideBar: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.dcBlue,
    overflow: 'hidden',
    minWidth: '25%',
    alignItems: 'center',
  },
  headingContainer: {
    paddingTop: '5rem',
    width: '85%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    width: '400px',
    height: '350px',
    margin: '20px',
    boxShadow: 'none',
    // borderRadius: '15px',
    backgroundColor: theme.palette.background,
    fontSize: theme.spacing[0],
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover $articleTitle': {
      textDecoration: 'underline',
    },
    // '&:hover': {
    //   boxShadow: theme.cardShadow,
    //   transform: 'translate(0px, -7px)',
    //   transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    // },
    // '& .cardContent': {
    //   padding: '0rem 1rem 0rem 1rem',
    //   transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    //   overflow: 'hidden',
    // },
    // '& .cardHidden': {
    //   transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    //   visibility: 'hidden',
    //   height: 0,
    //   overflow: 'hidden',
    // },
    // '&:hover .cardContent': {
    //   transform: 'translate(0px, -1px)',
    //   transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    // },
    // '&:hover .cardHidden': {
    //   transform: 'translate(0px, -1px)',
    //   transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    //   visibility: 'visible',
    //   height: 'auto',
    // },
  },
  cardImage: {
    width: '100%',
    height: '240px',
  },
  cardContent: {
    padding: '1rem 1rem 0rem 1rem',
  },
  articleRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing[3],
  },
  articleContent: {
    fontSize: theme.spacing[1],
    maxWidth: '75%',
    textAlign: 'justify',
  },
  byline: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: theme.spacing[0],
    textDecoration: 'none',
  },
  footerContainer: {
    fontSize: theme.spacing[7],
    maxWidth: '50%',
  },
  footerCard: {
    backgroundColor: '#e9edf0',
    padding: '25px 25px 10px 25px',
    margin: '10px 0px 20px 0px',
  },
  footBar: {
    width: '100%',
  },
  teamTitle: {
    fontWeight: 800,
    fontFamily: "'Georgia', serif", // change to Tiempo as used in main DC site
    lineHeight: 'normal',
    color: theme.palette.background,
    fontSize: '4vw',
  },

  articleTitle: {
    fontWeight: 400,
    fontFamily: "'Georgia', serif", // change to Tiempo as used in main DC site
    lineHeight: 'normal',
    color: theme.palette.black,
    fontSize: '1.9vw',
    textDecoration: 'none',
    // transition: 'all 0.3s ease-out',
  },

  date: {
    color: theme.palette.grey,
    borderTop: '1px solid',
    borderColor: theme.palette.grey,
    fontWeight: 400,
    fontFamily: "'Georgia', sans-serif", // change to Tiempo as used in main DC site
    lineHeight: 'normal',
    fontSize: '1vw',
    paddingBottom: '1vw',
    paddingTop: '1vw',
  },

  cardByline: {
    color: theme.palette.grey,
    fontWeight: 800,
    fontFamily: "'Helvetica', sans-serif", // change to Tiempo as used in main DC site
    lineHeight: 'normal',
    fontSize: '1vw',
    // paddingBottom: '1vw',
    paddingTop: '2vw',
  },
});
