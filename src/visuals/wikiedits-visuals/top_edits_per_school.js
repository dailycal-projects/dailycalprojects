import { InputLabel, FormControl, Select, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import {
  BarChart,
  Bar,
  Brush,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  // Legend,
  Label,
  ResponsiveContainer,
} from "recharts";

import data from "./data";
import human_names from "./human_names";

const ROW_FONT_SIZE = "17px";
const ROW_PADDING = "2.5px 15px";

function TopEditsPerSchool() {
  const [selectedSchool, setSelectedSchool] = React.useState(
    Object.keys(data)[0]
  );
  const [selectedMetric, setSelectedMetric] = React.useState("net");

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
  };
  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  // Options for metrics: "net", "total", "net_asc", "unique", "edits"
  // Display labels for dropdown and table
  const metricOptions = [
    { value: "net", label: "Most growth (characters)" },
    { value: "net_asc", label: "Most deletions (characters)" },
    { value: "total", label: "Most change (characters)" },
    { value: "unique", label: "Most editors (unique IPs)" },
    { value: "edits", label: "Most changes (edits)" },
  ];

  // Table column label
  let columnLabel = "";
  switch (selectedMetric) {
    case "net":
      columnLabel = "Net characters changed";
      break;
    case "total":
      columnLabel = "Total characters changed";
      break;
    case "net_asc":
      columnLabel = "Net characters changed";
      break;
    case "unique":
      columnLabel = "Unique IP addresses";
      break;
    case "edits":
      columnLabel = "Edit count";
      break;
    default:
      columnLabel = "Metric";
  }

  // Compute which data to show based on the metric (default: keep previous behaviors)
  const rows = data[selectedSchool][selectedMetric];

  return (
    <div>
      <FormControl
        variant="outlined"
        style={{ minWidth: 240, marginBottom: 20, marginRight: 10 }}
      >
        <InputLabel id="school-select-label">Select campus</InputLabel>
        <Select
          labelId="school-select-label"
          id="school-select"
          value={selectedSchool}
          onChange={handleSchoolChange}
          label="Select School"
        >
          {Object.keys(data).map((school) => (
            <MenuItem value={school} key={school}>
              {human_names[school]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        variant="outlined"
        style={{ minWidth: 240, marginBottom: 20 }}
      >
        <InputLabel id="metric-select-label">Select metric</InputLabel>
        <Select
          labelId="metric-select-label"
          id="metric-select"
          value={selectedMetric}
          onChange={handleMetricChange}
          label="Select Metric"
        >
          {metricOptions.map((opt) => (
            <MenuItem value={opt.value} key={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            minWidth: 500,
            width: "100%",
            background: "white",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th
                style={{
                  border: "1px solid #e0e0e0",
                  padding: "5px 15px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: ROW_FONT_SIZE,
                }}
              >
                Article title
              </th>
              <th
                style={{
                  border: "1px solid #e0e0e0",
                  padding: "5px 15px",
                  textAlign: "right",
                  fontWeight: 600,
                  fontSize: ROW_FONT_SIZE,
                }}
              >
                {columnLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.title + selectedMetric}
                style={{
                  background: idx % 2 === 0 ? "#fafbfc" : "white",
                  transition: "background 0.2s",
                  border: "1px solid #e0e0e0",
                }}
              >
                <td
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: ROW_PADDING,
                    textAlign: "left",
                    maxWidth: 320,
                    overflow: "hidden",
                    textOverflow: "wrap",
                    fontSize: ROW_FONT_SIZE,
                    // color: 'black',
                  }}
                >
                  {row.urls ? (
                    <a
                      href={row.urls}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "black",
                        textDecoration: "none",
                        fontSize: ROW_FONT_SIZE,
                      }}
                    >
                      {row.title}
                    </a>
                  ) : (
                    row.title
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: ROW_PADDING,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: ROW_FONT_SIZE,
                    // color: 'black',
                  }}
                >
                  {selectedMetric === "net" || selectedMetric === "net_asc"
                    ? (row.net ?? 0).toLocaleString()
                    : selectedMetric === "total"
                    ? (row.total ?? 0).toLocaleString()
                    : selectedMetric === "unique"
                    ? (row.unique_editors ?? 0).toLocaleString()
                    : selectedMetric === "edits"
                    ? (row.edits ?? 0).toLocaleString()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopEditsPerSchool;
