import React from "react";
import {
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  Scatter,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const ScatterPlot = (props: any) => {
  const colors = ["#30B189", "#96C066", "#F9A84A", "#F28147", "#E2565F"];
  const data = props.data;
  const ranges = [];
  ranges[0] = data.filter((d: any) => d.housing_burden < 15);
  ranges[1] = data.filter(
    (d: any) => d.housing_burden >= 15 && d.housing_burden < 30
  );
  ranges[2] = data.filter(
    (d: any) => d.housing_burden >= 30 && d.housing_burden < 50
  );
  ranges[3] = data.filter(
    (d: any) => d.housing_burden >= 50 && d.housing_burden < 80
  );
  ranges[4] = data.filter(
    (d: any) => d.housing_burden >= 80 && d.housing_burden < 100
  );

  return (
    <ScatterChart
      width={750}
      height={400}
      margin={{ top: 0, right: 20, bottom: 30, left: 10 }}
    >
      <CartesianGrid strokeDasharray="3" horizontal={false} />
      <XAxis
        dataKey={props.xDataKey}
        type="category"
        label={{ value: "Zip code area", position: "bottom" }}
        padding={{ left: 20, right: 20 }}
        allowDuplicatedCategory={false}
      />
      <YAxis
        dataKey={props.yDataKey}
        label={{ value: "Percentile", position: "insideLeft", angle: -90 }}
        padding={{ top: 20, bottom: 20 }}
        name={props.yDataKey}
      />
      <ZAxis
        type="number"
        dataKey="housing_burden"
        range={[50, 250]}
        name="housing_burden"
      />
      <Tooltip />
      <Legend align="right" verticalAlign="top" layout="vertical" />
      <Scatter
        name={"< 15"}
        data={ranges[0]}
        legendType={"triangle"}
        fill={colors[0]}
      />
      <Scatter
        name={"15-30"}
        data={ranges[1]}
        legendType={"triangle"}
        fill={colors[1]}
      />
      <Scatter
        name={"30-50"}
        data={ranges[2]}
        legendType={"triangle"}
        fill={colors[2]}
      />
      <Scatter
        name={"50-80"}
        data={ranges[3]}
        legendType={"triangle"}
        fill={colors[3]}
      />
      <Scatter
        name={"80-100"}
        data={ranges[4]}
        legendType={"triangle"}
        fill={colors[4]}
      />
    </ScatterChart>
  );
};

export default ScatterPlot;
