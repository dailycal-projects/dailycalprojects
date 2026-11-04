/**
 * @mui/material and @mui/lab with Material UI v4's defaults, for the visuals from the old Gatsby site
 * that were written for v4 (@material-ui/core and @material-ui/lab). Newer versions changed some
 * defaults, which changes how those visuals look; this restores them, so their code works
 * unchanged with only its import changed to this file:
 *
 * - Form fields (FormControl, Select, TextField) use the underlined "standard" variant, not the
 *   outlined boxes that became the default in v5.
 * - Timeline content inherits the page's font instead of using MUI's own typography.
 */
import * as Lab from "@mui/lab";
import * as Material from "@mui/material";

export * from "@mui/material";

const standard = (Component) =>
  function V4Default({ variant = "standard", ...props }) {
    return <Component variant={variant} {...props} />;
  };

export const FormControl = standard(Material.FormControl);
export const Select = standard(Material.Select);
export const TextField = standard(Material.TextField);

const INHERIT_FONT = {
  fontFamily: "inherit",
  fontSize: "inherit",
  lineHeight: "inherit",
  letterSpacing: "inherit",
};

const inheritFont = (Component) =>
  function V4Font({ sx, ...props }) {
    return <Component sx={[INHERIT_FONT, ...(Array.isArray(sx) ? sx : [sx])]} {...props} />;
  };

export const { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineDot } = Lab;
export const TimelineContent = inheritFont(Lab.TimelineContent);
export const TimelineOppositeContent = inheritFont(Lab.TimelineOppositeContent);
