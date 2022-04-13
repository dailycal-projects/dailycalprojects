import React from 'react';
import { Tooltip, Sankey } from 'recharts';
import { Slider } from '@mui/material';
// import MyCustomNode from './myCustomNode';
import SankeyNode from './sankeyNode';

const nodes = [
  {
    name: 'Total Budget',
  },
  {
    name: 'Gifts',
  },
  {
    name: 'Assets',
  },
  {
    name: 'Investments',
  },
  {
    name: 'Commercial Paper',
  },
  {
    name: 'Health Care',
  },
  {
    name: 'Student Fees',
  },
];

const sNodes = [
  {
    name: 'Total Budget',
  },
  {
    name: 'Gifts',
  },
  {
    name: 'Assets',
  },
  {
    name: 'Investments',
  },
  {
    name: 'Health Care',
  },
  {
    name: 'Student Fees',
  },
];

const bNodes = [
  {
    name: 'Total Budget',
  },
  {
    name: 'Gifts',
  },
  {
    name: 'Assets',
  },
  {
    name: 'Investments',
  },
  {
    name: 'Commercial Paper',
  },
  {
    name: 'Student Fees',
  },
];

const s20 = {
  nodes: sNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 1098.716,
    },
    {
      source: 0,
      target: 2,
      value: 47173,
    },
    {
      source: 0,
      target: 3,
      value: 40929,
    },
    {
      source: 0,
      target: 4,
      value: 7137,
    },
    {
      source: 0,
      target: 5,
      value: 610,
    },
  ],
};
const s19 = {
  nodes: sNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 858.601,
    },
    {
      source: 0,
      target: 2,
      value: 45189,
    },
    {
      source: 0,
      target: 3,
      value: 38819,
    },
    {
      source: 0,
      target: 4,
      value: 7051,
    },
    {
      source: 0,
      target: 5,
      value: 653,
    },
  ],
};

const s18 = {
  nodes: sNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 854.981,
    },
    {
      source: 0,
      target: 2,
      value: 43227,
    },
    {
      source: 0,
      target: 3,
      value: 37784,
    },
    {
      source: 0,
      target: 4,
      value: 6302,
    },
    {
      source: 0,
      target: 5,
      value: 635,
    },
  ],
};

const s17 = {
  nodes: sNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 1032.934,
    },
    {
      source: 0,
      target: 2,
      value: 40574,
    },
    {
      source: 0,
      target: 3,
      value: 35842,
    },
    {
      source: 0,
      target: 4,
      value: 5682,
    },
    {
      source: 0,
      target: 5,
      value: 618,
    },
  ],
};

const s16 = {
  nodes: sNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 1487.817,
    },
    {
      source: 0,
      target: 2,
      value: 36970,
    },
    {
      source: 0,
      target: 3,
      value: 31332,
    },
    {
      source: 0,
      target: 4,
      value: 5264,
    },
    {
      source: 0,
      target: 5,
      value: 587,
    },
  ],
};

const StanfordData = {
  2020: s20,
  2019: s19,
  2018: s18,
  2017: s17,
  2016: s16,
};

const b20 = {
  nodes: bNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 3386.457,
    },
    {
      source: 0,
      target: 2,
      value: 8843.106,
    },
    {
      source: 0,
      target: 3,
      value: 3945.595,
    },
    {
      source: 0,
      target: 4,
      value: 326.008,
    },
    {
      source: 0,
      target: 5,
      value: 1011.824,
    },
  ],
};
const b19 = {
  nodes: bNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 3024.097,
    },
    {
      source: 0,
      target: 2,
      value: 8683.907,
    },
    {
      source: 0,
      target: 3,
      value: 3908.633,
    },
    {
      source: 0,
      target: 4,
      value: 247.251,
    },
    {
      source: 0,
      target: 5,
      value: 968.549,
    },
  ],
};

const b18 = {
  nodes: bNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 2953.953,
    },
    {
      source: 0,
      target: 2,
      value: 8172.408,
    },
    {
      source: 0,
      target: 3,
      value: 3750.499,
    },
    {
      source: 0,
      target: 4,
      value: 204.537,
    },
    {
      source: 0,
      target: 5,
      value: 933.909,
    },
  ],
};

const b17 = {
  nodes: bNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 2829.821,
    },
    {
      source: 0,
      target: 2,
      value: 7801.271,
    },
    {
      source: 0,
      target: 3,
      value: 3586.379,
    },
    {
      source: 0,
      target: 4,
      value: 132.259,
    },
    {
      source: 0,
      target: 5,
      value: 834.442,
    },
  ],
};

const b16 = {
  nodes: bNodes,
  links: [
    {
      source: 0,
      target: 1,
      value: 2631.98,
    },
    {
      source: 0,
      target: 2,
      value: 7820.587,
    },
    {
      source: 0,
      target: 3,
      value: 3284.827,
    },
    {
      source: 0,
      target: 4,
      value: 114.077,
    },
    {
      source: 0,
      target: 5,
      value: 781.081,
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

const BerkeleyStanfordSankey = () => {
  const [sliderValS, setValueS] = React.useState(2020);
  const [sliderValB, setValueB] = React.useState(2020);

  const handleChangeS = (event, newValue) => {
    setValueS(newValue);
  };

  const handleChangeB = (event, newValue) => {
    setValueB(newValue);
  };

  const colors = ['#E3565F', '#FBA93D', '#25B288', '#489BD1', '#61699A'];

  return (
    <div>
      <br />
      <Slider
        aria-label="Year"
        defaultValue={2020}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={2016}
        max={2020}
        onChange={handleChangeS}
      />
      <Sankey
        width={960}
        height={600}
        data={StanfordData[sliderValS]}
        nodePadding={35}
        margin={{
          left: 120,
          right: 120,
          top: 100,
          bottom: 100,
        }}
        link={{ stroke: '#70AADA' }}
        node={<SankeyNode containerWidth={960} colors={colors} />}
      >
        <Tooltip label="k" />
      </Sankey>
      <br />
      <br />
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
      <Sankey
        width={960}
        height={600}
        data={BerkeleyData[sliderValB]}
        node={<SankeyNode containerWidth={960} colors={colors} />}
        nodePadding={25}
        margin={{
          left: 120,
          right: 120,
          top: 100,
          bottom: 100,
        }}
        link={{ stroke: '#E87876' }}

      >
        <Tooltip />
      </Sankey>
    </div>
  );
};

export default BerkeleyStanfordSankey;
