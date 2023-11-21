import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
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

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  }
}

let legendLayout = [];
if (isMobile) {
  legendLayout = ['center', 'bottom', 'horizontal', 'relative', '0px'];
} else {
  legendLayout = ['right', 'top', 'vertical', 'absolute', '0px'];
}

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
          top: 0, right: 0, bottom: 65, left: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3" horizontal={false} />
        <XAxis
          dataKey={xDataKey}
          type="category"
          label={{
            value: 'Zip code area', offset: 30, position: 'bottom', fontWeight: '500',
          }}
          padding={{ left: 20, right: 20 }}
          allowDuplicatedCategory={false}
          tick={<CustomizedAxisTick />}
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
        <Legend
          align={legendLayout[0]}
          verticalAlign={legendLayout[1]}
          layout={legendLayout[2]}
          wrapperStyle={{ position: legendLayout[3], marginTop: legendLayout[4] }}
        />
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
