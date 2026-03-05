import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    background: {
      default: "#F8F8F8", // main background
    },
    text: {
      primary: "#0E141B",
      secondary: "#949494",
    },
    red: { main: "#E2565F" },
    redOrange: { main: "#EA6B4E" },
    orange: { main: "#F28147" },
    yellowOrange: { main: "#F9A84A" },
    yellow: { main: "#FDD04C" },
    yellowGreen: { main: "#96C066" },
    green: { main: "#30B189" },
    blueGreen: { main: "#3FA6AB" },
    darkBlueGreen: { main: "#1D8B90" },
    blue: { main: "#4B9CCF" },
    darkBlue: { main: "#1D6A92" },
    blueViolet: { main: "#6F82B5" },
    darkBlueViolet: { main: "#606A97" },
    violet: { main: "#8E689B" },
    redViolet: { main: "#B8607E" },
    dcBlue: { main: "#94bbe2" },
    grey: { main: "#949494", dark: "rgba(67, 67, 67, 1)" },
  },

  shadows: [
    "none", // 0
    "0px 2px 0px 0.5px rgba(14, 20, 27, 0.15)", // cardShadow
    "0px 4px 4px rgba(0, 0, 0, 0.25)", // iconShadow
  ],

  typography: {
    fontFamily: "'Georgia', sans-serif",
    fontSize: 15, // base font size


    h2: { fontSize: "48px" },
    h3: { fontSize: "35px" },
    h4: { fontSize: "30px" },
    h5: { fontSize: "24px" },
    body1: { fontSize: "17px" },
    body2: { fontSize: "15px" },
  },

  spacing: 8,
});


/**
 *   cardShadow: '0px 2px 0px 0.5px rgba(14, 20, 27, 0.15)',
  iconShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  fontSizes: [
    15, // Card text, byline
    17, // Nav bar, article content
    24, // Article title, subheading
    30, // Article root
    35, // Title
    48, // Data title
    60,
    // Footer container?
  ],
};

 */