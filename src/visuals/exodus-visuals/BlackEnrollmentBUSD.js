import React, { Component } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, Label,
} from 'recharts';

const AlignedAxisLabel = ({
  axisType,
  x,
  y,
  width,
  height,
  stroke,
  children,
}) => {
  const isVert = axisType === 'yAxis';
  const cx = isVert ? x : x + width / 2;
  const cy = isVert ? height / 2 + y : y + height + 10;
  const rot = isVert ? `270 ${cx} ${cy}` : 0;
  return (
    <text
      x={cx}
      y={cy}
      transform={`rotate(${rot})`}
      textAnchor="middle"
      stroke={stroke}
    >
      {children}
    </text>
  );
};

const data = [
  {
    year: '1993-94',
    'Alameda County': 44130,
    Berkeley: 3651,
  },
  {
    year: '1994-95',
    'Alameda County': 44486,
    Berkeley: 3377,
  },
  {
    year: '1995-96',
    'Alameda County': 45192,
    Berkeley: 3452,
  },
  {
    year: '1996-97',
    'Alameda County': 46020,
    Berkeley: 3676,
  },
  {
    year: '1997-98',
    'Alameda County': 46302,
    Berkeley: 3870,
  },
  {
    year: '1998-99',
    'Alameda County': 45124,
    Berkeley: 3637,
  },
  {
    year: '1999-00',
    'Alameda County': 44904,
    Berkeley: 3630,
  },
  {
    year: '2000-01',
    'Alameda County': 42858,
    Berkeley: 3433,
  },
  {
    year: '2001-02',
    'Alameda County': 40862,
    Berkeley: 3328,
  },
  {
    year: '2002-03',
    'Alameda County': 40603,
    Berkeley: 3033,
  },
  {
    year: '2003-04',
    'Alameda County': 39352,
    Berkeley: 2773,
  },
  {
    year: '2004-05',
    'Alameda County': 38317,
    Berkeley: 2874,
  },
  {
    year: '2005-06',
    'Alameda County': 37022,
    Berkeley: 2784,
  },
  {
    year: '2006-07',
    'Alameda County': 35539,
    Berkeley: 2648,
  },
  {
    year: '2007-08',
    'Alameda County': 33740,
    Berkeley: 2479,
  },
  {
    year: '2008-09',
    'Alameda County': 32536,
    Berkeley: 2323,
  },
  {
    year: '2009-10',
    'Alameda County': 31087,
    Berkeley: 2209,
  },
  {
    year: '2010-11',
    'Alameda County': 30337,
    Berkeley: 2110,
  },
  {
    year: '2011-12',
    'Alameda County': 29516,
    Berkeley: 2031,
  },
  {
    year: '2012-13',
    'Alameda County': 28262,
    Berkeley: 1992,
  },
  {
    year: '2013-14',
    'Alameda County': 27233,
    Berkeley: 1997,
  },
  {
    year: '2014-15',
    'Alameda County': 25974,
    Berkeley: 1958,
  },
  {
    year: '2015-16',
    'Alameda County': 24760,
    Berkeley: 1826,
  },
  {
    year: '2016-17',
    'Alameda County': 23670,
    Berkeley: 1667,
  },
  {
    year: '2017-18',
    'Alameda County': 22820,
    Berkeley: 1570,
  },
  {
    year: '2018-19',
    'Alameda County': 21994,
    Berkeley: 1440,
  },
  {
    year: '2019-20',
    'Alameda County': 20865,
    Berkeley: 1282,
  },
  {
    year: '2020-21',
    'Alameda County': 19691,
    Berkeley: 1193,
  },
];

class BUSDBlackEnrollment extends Component {
  render() {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            left: '0px',
          }}
        >
          <h4>
            {' '}
            Black enrollment in BUSD by year
            {' '}
          </h4>
        </div>
        <AreaChart
          width={750}
          height={550}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <XAxis
            dataKey="year"
            angle={0}
            tick={{ fontSize: 16, transform: 'translate(0, 7)' }}
          >
            <Label value="Year" offset={-15} position="insideBottom" />
          </XAxis>
          <YAxis
            tick={{ fontSize: 16 }}
            label={(
              <AlignedAxisLabel
                x={20}
                y={250}
                width={0}
                height={0}
                axisType="yAxis"
              >
                Enrollment
              </AlignedAxisLabel>
          )}
          />
          <Tooltip />
          <defs>
            <linearGradient id="colorEnrollBerkeley" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#487A9B" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#487A9B" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="Berkeley"
            stroke="#487A9B"
            fill="url(#colorEnrollBerkeley)"
          />
        </AreaChart>
      </div>

    );
  }
}

export default BUSDBlackEnrollment;
