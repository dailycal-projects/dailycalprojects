/**
 * Material UI's old JSS styling API (makeStyles, withStyles, createStyles from @material-ui/styles
 * and @mui/styles), which the visuals from the old Gatsby site use. @mui/styles is deprecated and
 * doesn't support React 19, so this provides the same API on top of tss-react (MUI's recommended
 * replacement), letting that code work unchanged with only its import changed to this file.
 */
import createCache from "@emotion/cache";
import { useTheme } from "@mui/material/styles";
import { createMakeAndWithStyles } from "tss-react";

// tss-react needs an explicit Emotion cache to render on the server (when the site is built). On
// the server it only generates the class names; in the browser, the styles are added to <body>,
// after MUI's own styles in <head>, so they override MUI's defaults the way v4's makeStyles did.
const { makeStyles: tssMakeStyles, withStyles: tssWithStyles } = createMakeAndWithStyles({
  useTheme,
  cache: createCache({
    key: "tss",
    ...(typeof document !== "undefined" && { container: document.body }),
  }),
});

/** makeStyles(styles) returns a hook that returns the generated class names. */
export function makeStyles(styles) {
  const useStyles = tssMakeStyles()(styles);
  return () => useStyles().classes;
}

/** withStyles(styles)(Component) passes the generated class names as the `classes` prop. */
export function withStyles(styles) {
  return (Component) => tssWithStyles(Component, styles);
}

/** createStyles() only existed for TypeScript types; it returns its argument. */
export function createStyles(styles) {
  return styles;
}
