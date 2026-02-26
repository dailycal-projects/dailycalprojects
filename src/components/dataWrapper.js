import React from "react";
import DWChart from "react-datawrapper-chart";

export default function DatawrapperChart({ chartId }) {
  const src = `//datawrapper.dwcdn.net/${chartId}`;
  return <DWChart src={src} />;
}
