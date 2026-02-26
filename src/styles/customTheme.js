import { createStyles } from "@material-ui/core";
import { theme } from "./theme";

export const styles = () =>
  createStyles({
    main: {
      display: "flex",
      width: "100%",
      flexDirection: "column",
      backgroundColor: theme.palette.background,
      overflow: "hidden",
      alignItems: "center",
    },
    content: {
      display: "flex",
      width: "1200px",
      flexDirection: "column",
      paddingTop: "50px",

      "@media (max-width: 600px)": {
        display: "flex",
        width: "350px",
        flexDirection: "column",
        paddingTop: "50px",
      },
    },
    intro: {
      fontFamily: "'Georgia', sans-serif",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "8px",
    },
    dataTitle: {
      fontFamily: "Georgia",
      fontSize: theme.spacing[5],
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
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "2rem",
    },
    navHeader: {
      display: "flex",
      flexDirection: "row-reverse",
    },
    navBar: {
      display: "flex",
      flexDirection: "column",
      fontSize: theme.spacing[1],
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
    index: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    card: {
      display: "flex",
      flexDirection: "column",
      width: "360px",
      height: "350px",
      margin: "20px",
      boxShadow: "none",
      backgroundColor: theme.palette.background,
      fontSize: theme.spacing[0],
      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      "&:hover $articleTitle": {
        textDecoration: "underline",
      },

      "@media (max-width: 600px)": {
        width: "350px",
      },
    },
    cardImage: {
      width: "100%",
      height: "230px",
    },
    cardContent: {
      padding: "1rem 1rem 0rem 1rem",
    },
    articleRoot: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: theme.spacing[3],
      paddingTop: 85,
    },
    articleContent: {
      fontSize: theme.spacing[1],
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
      fontSize: theme.spacing[0],
      fontFamily: "sans-serif",
      textDecoration: "none",
      marginBottom: "25px",
      textAlign: "left",
    },
    footerContainer: {
      fontSize: theme.spacing[7],
      maxWidth: "640px",
    },
    footerCard: {
      padding: "20px 20px 0px 20px",
      margin: "10px 0px 20px 0px",
      border: "1px solid",
      borderColor: "#dbdbdbff",
      borderRadius: "10px",
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

    articleTitle: {
      fontWeight: 400,
      fontFamily: "'Georgia', serif",
      lineHeight: "normal",
      color: theme.palette.black,
      fontSize: theme.spacing[2],
      textDecoration: "none",
    },

    date: {
      color: theme.palette.grey,
      borderTop: "1px solid",
      borderColor: theme.palette.grey,
      fontWeight: 400,
      fontFamily: "'Georgia', sans-serif",
      lineHeight: "normal",
      fontSize: "12px",
      paddingBottom: "10px",
      paddingTop: "10px",
    },

    cardByline: {
      color: theme.palette.grey,
      fontWeight: 800,
      fontFamily: "'Helvetica', sans-serif",
      lineHeight: "normal",
      fontSize: "1vw",
      paddingTop: "2vw",
    },
    topBar: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "50px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.palette.background,
      zIndex: 9999,
      borderBottom: "1px solid #D3D3D3",
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
      fontSize: theme.spacing[4],
      fontFamily: "'Georgia', sans-serif",
      lineHeight: "normal",
    },

    subhead: {
      fontWeight: 300,
      fontSize: theme.spacing[2],
      lineHeight: "normal",
    },

    imageContainer: {
      maxWidth: "640px",
    },
  });
