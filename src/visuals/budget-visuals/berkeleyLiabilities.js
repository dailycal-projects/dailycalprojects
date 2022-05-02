import React from 'react';
import { Tooltip, Sankey } from 'recharts';
import { Slider } from '@mui/material';
import SankeyNode from './SankeyNode';

const colors = ['#E3565F', '#FBA93D', '#25B288', '#489BD1', '#61699A'];

const nodes = [
  {
    name: 'Liabilities',
  },
  {
    name: 'Current Liabilities',
  },
  {
    name: 'Noncurrent Liabilities',
  },
  {
    name: 'Accounts payable',
  },
  {
    name: 'Accrued salaries',
  },
  {
    name: 'Employee Benefits',
  },
  {
    name: 'Unearned revenue',
  },
  {
    name: 'Commercial paper',
  },
  {
    name: 'Current portion of long-term debt',
  },
  {
    name: 'Funds held for others',
  },
  {
    name: 'Other current liabilities',
  },
  {
    name: 'Federal refundable loans',
  },
  {
    name: 'Long-term debt',
  },
  {
    name: 'Net pension liability',
  },
  {
    name: 'Pension payable to University',
  },
  {
    name: 'Net retiree health benefits liability',
  },
  {
    name: 'Other noncurrent liabilities',
  },
];

const b20 = {
  nodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 841.861,
    },
    {
      source: 0,
      target: 2,
      value: 5766.433,
    },
    {
      source: 1,
      target: 3,
      value: 53.01,
    },
    {
      source: 1,
      target: 4,
      value: 23.554,
    },
    {
      source: 1,
      target: 6,
      value: 253.322,
    },
    {
      source: 1,
      target: 7,
      value: 326.008,
    },
    {
      source: 1,
      target: 8,
      value: 112.431,
    },
    {
      source: 1,
      target: 9,
      value: 2.5,
    },
    {
      source: 1,
      target: 10,
      value: 71.036,
    },
    {
      source: 2,
      target: 11,
      value: 14.097,
    },
    {
      source: 2,
      target: 12,
      value: 2056.729,
    },
    {
      source: 2,
      target: 13,
      value: 1545.394,
    },
    {
      source: 2,
      target: 14,
      value: 368.399,
    },
    {
      source: 2,
      target: 15,
      value: 1706.807,
    },
    {
      source: 2,
      target: 16,
      value: 75.007,
    },
  ],
};
const b19 = {
  nodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 761.332,
    },
    {
      source: 0,
      target: 2,
      value: 5364.315,
    },
    {
      source: 1,
      target: 3,
      value: 73.498,
    },
    {
      source: 1,
      target: 4,
      value: 11.058,
    },
    {
      source: 1,
      target: 6,
      value: 217.516,
    },
    {
      source: 1,
      target: 7,
      value: 247.251,
    },
    {
      source: 1,
      target: 8,
      value: 113.064,
    },
    {
      source: 1,
      target: 9,
      value: 3.235,
    },
    {
      source: 1,
      target: 10,
      value: 95.71,
    },
    {
      source: 2,
      target: 11,
      value: 21.57,
    },
    {
      source: 2,
      target: 12,
      value: 2103.042,
    },
    {
      source: 2,
      target: 13,
      value: 1332.61,
    },
    {
      source: 2,
      target: 14,
      value: 349.424,
    },
    {
      source: 2,
      target: 15,
      value: 1496.425,
    },
    {
      source: 2,
      target: 16,
      value: 61.244,
    },
  ],
};

const b18 = {
  nodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 749.279,
    },
    {
      source: 0,
      target: 2,
      value: 4700.046,
    },
    {
      source: 1,
      target: 3,
      value: 70.658,
    },
    {
      source: 1,
      target: 4,
      value: 51.781,
    },
    {
      source: 1,
      target: 5,
      value: 9.761,
    },
    {
      source: 1,
      target: 6,
      value: 192.351,
    },
    {
      source: 1,
      target: 7,
      value: 204.537,
    },
    {
      source: 1,
      target: 8,
      value: 105.746,
    },
    {
      source: 1,
      target: 9,
      value: 2.403,
    },
    {
      source: 1,
      target: 10,
      value: 112.042,
    },
    {
      source: 2,
      target: 11,
      value: 21.04,
    },
    {
      source: 2,
      target: 12,
      value: 2148.065,
    },
    {
      source: 2,
      target: 13,
      value: 1045.619,
    },
    {
      source: 2,
      target: 15,
      value: 1443.567,
    },
    {
      source: 2,
      target: 16,
      value: 41.755,
    },
  ],
};

const b17 = {
  nodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 706.559,
    },
    {
      source: 0,
      target: 2,
      value: 4915.301,
    },
    {
      source: 1,
      target: 3,
      value: 85.576,
    },
    {
      source: 1,
      target: 4,
      value: 51.236,
    },
    {
      source: 1,
      target: 5,
      value: 10.227,
    },
    {
      source: 1,
      target: 6,
      value: 198.455,
    },
    {
      source: 1,
      target: 7,
      value: 132.259,
    },
    {
      source: 1,
      target: 8,
      value: 111.336,
    },
    {
      source: 1,
      target: 9,
      value: 2.456,
    },
    {
      source: 1,
      target: 10,
      value: 115.014,
    },
    {
      source: 2,
      target: 11,
      value: 22.663,
    },
    {
      source: 2,
      target: 12,
      value: 2164.34,
    },
    {
      source: 2,
      target: 13,
      value: 1141.828,
    },
    {
      source: 2,
      target: 15,
      value: 1556.935,
    },
    {
      source: 2,
      target: 16,
      value: 29.535,
    },
  ],
};

const b16 = {
  nodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 772.507,
    },
    {
      source: 0,
      target: 2,
      value: 4574.487,
    },
    {
      source: 1,
      target: 3,
      value: 97.606,
    },
    {
      source: 1,
      target: 4,
      value: 106.328,
    },
    {
      source: 1,
      target: 5,
      value: 23.868,
    },
    {
      source: 1,
      target: 6,
      value: 211.197,
    },
    {
      source: 1,
      target: 7,
      value: 114.077,
    },
    {
      source: 1,
      target: 8,
      value: 102.923,
    },
    {
      source: 1,
      target: 9,
      value: 1.824,
    },
    {
      source: 1,
      target: 10,
      value: 114.684,
    },
    {
      source: 2,
      target: 11,
      value: 22.721,
    },
    {
      source: 2,
      target: 12,
      value: 2140.804,
    },
    {
      source: 2,
      target: 13,
      value: 1485.336,
    },
    {
      source: 2,
      target: 15,
      value: 894.323,
    },
    {
      source: 2,
      target: 16,
      value: 31.303,
    },
  ],
};

const BerkeleyData = {
  2020: b20,
  2019: b19,
  2018: b18,
  2017: b17,
  2016: b16,
};

const BerkeleyLiabilities = () => {
  const [slideValB, setValueB] = React.useState(2020);

  const handleChangeB = (event, newValue) => {
    setValueB(newValue);
  };

  return (
    <div>
      <br />
      <h4> Year </h4>
      <Slider
        aria-label="Year"
        defaultValue={2020}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={2016}
        max={2020}
        onChange={handleChangeB}
      />
      <h4> UC Berkeley liabilities breakdown </h4>
      <Sankey
        width={1000}
        height={900}
        data={BerkeleyData[slideValB]}
        node={<SankeyNode containerWidth={960} colors={colors} />}
        nodePadding={25}
        margin={{
          left: 90,
          right: 215,
          top: 100,
          bottom: 100,
        }}
        link={{ stroke: '#70AADA' }}
      >
        <Tooltip separator=": $" formatter={(value) => `${value}k`} />
      </Sankey>
    </div>
  );
};

export default BerkeleyLiabilities;
