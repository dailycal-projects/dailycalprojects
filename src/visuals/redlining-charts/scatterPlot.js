import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  Scatter,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { theme } from '../../styles/theme';

const ScatterPlot = ({ data, xDataKey, yDataKey }) => {
  const colors = [
    theme.palette.green,
    theme.palette.yellowGreen,
    theme.palette.yellowOrange,
    theme.palette.orange,
    theme.palette.red];

  const ranges = [];
  ranges[0] = data.filter((d) => d.housing_burden < 15);
  ranges[1] = data.filter(
    (d) => d.housing_burden >= 15 && d.housing_burden < 30,
  );
  ranges[2] = data.filter(
    (d) => d.housing_burden >= 30 && d.housing_burden < 50,
  );
  ranges[3] = data.filter(
    (d) => d.housing_burden >= 50 && d.housing_burden < 80,
  );
  ranges[4] = data.filter(
    (d) => d.housing_burden >= 80 && d.housing_burden < 100,
  );

  return (
    <ResponsiveContainer width="100%" height={550}>
      <ScatterChart
        padding={{
          top: 0, right: 10, bottom: 0, left: 10,
        }}
        margin={{
          top: 0, right: 0, bottom: 50, left: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3" horizontal={false} />
        <XAxis
          dataKey={xDataKey}
          type="category"
          label={{ value: 'Zip code area', position: 'bottom', fontWeight: '500' }}
          padding={{ left: 20, right: 20 }}
          allowDuplicatedCategory={false}
        />
        <YAxis
          dataKey={yDataKey}
          label={{
            value: 'Percentile', position: 'insideLeft', fontWeight: '500', angle: -90,
          }}
          padding={{ top: 20, bottom: 20 }}
          name={yDataKey}
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
          name="< 15"
          data={ranges[0]}
          legendType="square"
          fill={colors[0]}
        />
        <Scatter
          name="15-30"
          data={ranges[1]}
          legendType="square"
          fill={colors[1]}
        />
        <Scatter
          name="30-50"
          data={ranges[2]}
          legendType="square"
          fill={colors[2]}
        />
        <Scatter
          name="50-80"
          data={ranges[3]}
          legendType="square"
          fill={colors[3]}
        />
        <Scatter
          name="80-100"
          data={ranges[4]}
          legendType="square"
          fill={colors[4]}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlot;

ScatterPlot.propTypes = {
  data: PropTypes.any,
  xDataKey: PropTypes.string,
  yDataKey: PropTypes.string,
};
