import { theme } from "./theme";

/**
 * Style used for the overall background and layout of each page.
 */
export const main = {
  display: "flex",
  width: "100%",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
  overflow: "hidden",
  alignItems: "center"
}

export const stylesz = {


  dataTitle: {
    fontFamily: "Georgia",
    fontSize: theme.fontSizes[5],
    fontWeight: 800,
    margin: 0,
  },
  headingContainer: {
    paddingTop: "5rem",
    width: "85%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  navHeader: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  navBar: {
    display: "flex",
    flexDirection: "column",
    fontSize: theme.fontSizes[1],
    padding: "2rem",
  },
  navText: {
    textDecoration: "none",
    color: theme.palette.black,
    padding: 4,
    transform: "translate(-2px, 0px)",
    transition: "all 300ms ease-out",
    "&:hover": {
      color: theme.palette.darkBlueGreen,
      transform: "translate(2px, 0px)",
      transition: "all 300ms ease-out",
    },
  },
  icons: {
    display: "flex",
    width: "10vh",
    justifyContent: "space-between",
  },
  iconHover: {
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    "&:hover": {
      transform: "translate(0px, -7px)",
      transition: "all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)",
    },
  },

  card: {
    display: "flex",
    flexDirection: "column",
    width: "360px",
    height: "350px",
    margin: "20px",
    boxShadow: "none",
    backgroundColor: theme.palette.background,
    fontSize: theme.fontSizes[0],
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    "@media (max-width: 600px)": {
      width: "350px",
    },
  },

  articleRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.fontSizes[3],
    paddingTop: 85,
  },
  articleContent: {
    fontSize: theme.fontSizes[1],
    fontFamily: "'Georgia', sans-serif",
    maxWidth: "640px",
    "@media (max-width: 600px)": {
      display: "flex",
      width: "350px",
      flexDirection: "column",
      paddingTop: "50px",
    },
  },
  byline: {
    fontSize: theme.fontSizes[0],
    fontFamily: "sans-serif",
    textDecoration: "none",
    marginBottom: "25px",
    textAlign: "left",
  },


  footBar: {
    width: "100%",
  },
  teamTitle: {
    fontWeight: 800,
    fontFamily: "'Georgia', serif",
    lineHeight: "normal",
    color: theme.palette.background,
    fontSize: "4vw",
  },

  cardByline: {
    color: theme.palette.grey,
    fontWeight: 800,
    fontFamily: "'Helvetica', sans-serif",
    lineHeight: "normal",
    fontSize: "1vw",
    paddingTop: "2vw",
  },
  headerContainer: {
    maxWidth: "640px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontWeight: 600,
    fontSize: theme.fontSizes[4],
    fontFamily: "'Georgia', sans-serif",
    lineHeight: "normal",
  },
  subhead: {
    fontWeight: 300,
    fontSize: theme.fontSizes[2],
    lineHeight: "normal",
  },
  imageContainer: {
    maxWidth: "640px",
  },
};
