import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, Cell, Brush, XAxis, YAxis, Tooltip, Text,
} from 'recharts';
import fund_data from './data/berk_construction_by_fund.json';

import './projectsByFundingBar.css';

const isMobile = window.innerWidth < 1024;

const config = {
  width: isMobile ? window.innerWidth : window.innerWidth * 3 / 4,
  height: isMobile ? window.innerWidth : window.innerHeight * 7 / 8,
  margin: {
    top: 20,
    right: isMobile ? 20 : 120,
    left: 20,
    bottom: 120,
  },
};

// y-label
const CustomizedLabelY = () => (
  <Text
    x={config.margin.left}
    y={config.height / 2}
    textAnchor="middle"
    angle={-90}
  >
    # of Projects Funded by Source
  </Text>
);

// x-label
const CustomizedLabelX = () => (
  <Text
    x={config.width / 2}
    y={config.height - config.margin.top}
    textAnchor="middle"
    dx={isMobile ? 0 : config.width / 2 - config.margin.right / 2}
    dy={isMobile ? 0 : -config.margin.bottom}
  >
    Funding Source
  </Text>
);

// rotated tick label
const CustomizedAxisTick = () =>
// console.log('this tick',this);
  (
  // <g transform={`translate(${x},${y})`}>
    <Text
      x={0}
      y={0}
      textAnchor="end"
      fill="#666"
      transform="rotate(-35)"
    >
      test
    </Text>
  // </g>
  );

const measureDescriptions = {
  'Measure T1': <p>
    Measure T1 provides $100 million of funding from bond revenue to pay for improvements to
    <b>City infrastructure and facilities</b>
    .
                </p>,
  'Capital Improvement Fund': <p>
    The Capital Improvement Fund provides funding for annual street rehabilitations, and most recently, the
    <b>Southside Complete Streets project</b>
    .
                              </p>,
  'State Transportation Tax': <p>
    A county-level tax applied to shipping within the county's jurisdiction; also used to fund
    <b>annual street rehabilitations</b>
    .
                              </p>,

  'Measure O': <p style={{ color: '#8EC583' }}>
    Measure O provides $135 million of funding from bond revenue to pay for
    <b>affordable housing</b>
    {' '}
    projects.
  </p>,
  'Measure M': <p>
    Measure M provided $30 million of funding from bond revenue to improve Berkeley’s streets and install
    <b>green infrastructure</b>
    {' '}
    to protect water quality in the Bay.
               </p>,
  'Measure F': <p>
    Starting in FY 2015, Measure F provided an additional 17% of annual funding to the Parks Tax, a parcel tax that pays for
    <b>park maintenance.</b>
  </p>,
  'Measure B & BB': <p>
    Measure B was approved in 2000, and Measure BB in 2014 to provide sales tax funding for
    <b>transportation projects</b>
    .
                    </p>,
  'Sanitary Sewer Fund': <p>
    The Sanitary Sewer Fund provides funds for rehabilitating
    <b>sewage systems</b>
    .
                         </p>,
  'Marina Fund': <p>
    The Marina Fund provides $15 million of funding for repairing docks and dredging in
    <b>Berkeley's Marina</b>
    .
                 </p>,
  'Vehicle Registration Fee (VRF)': <p>
    {' '}
    A 0.65% fee applied to the purchase price/value of vehicle; also used to fund
    <b>annual street rehabilitations</b>
    .
                                    </p>,
  'Senate Bill 1': <p>
    Also known as the Road Repair and Accountability Act, this invests $5.4 billion annually to fix
    <b>roads, freeways and bridges</b>
    {' '}
    in communities across California.
                   </p>,
};

export default function ProjectsByFundRe() {
  const [currentMeasure, setCurrentMeasure] = useState('Measure O');
  const [fundDataDynamic, setFundDataDynamic] = useState(fund_data);

  // truncate to first 10 for mobile
  useEffect(() => {
    console.log('fd', fund_data);
    if (isMobile) {
      setFundDataDynamic(fund_data.slice(0, 13));
    }
    // console.log('FDD', fundDataDynamic);
  }, []);

  return (
    <div>
      <div className="fund-title-div">
        <h4>
          Berkeley Capital Projects by Funding Source
        </h4>
      </div>
      <div className="fund-desc-div">
        <p>Click a bar to learn more about the funding source</p>
      </div>

      <div id="measure-explainer-container-div">
        <div id="measure-explainer-div">
          <b
            style={{ color: currentMeasure === 'Measure O' ? '#8EC583' : '#888' }}
          >
            {currentMeasure}
          </b>
          <p style={{ color: currentMeasure === 'Measure O' ? '#8EC583' : '#888' }}>{measureDescriptions[currentMeasure]}</p>
        </div>
      </div>
      <BarChart
        width={config.width}
        height={config.height}
        data={fundDataDynamic}
        margin={config.margin}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        {/* <XAxis dataKey="Funding Source" label={CustomizedLabelX} tick={CustomizedAxisTick} /> */}
        <XAxis dataKey="Funding Source" label={CustomizedLabelX} angle={-45} interval={0} tick={{ fontSize: 8, fill: '#000' }} textAnchor="end" />
        <YAxis label={CustomizedLabelY} />
        <Tooltip cursor={false} />
        {/* <Legend /> */}
        <Bar dataKey="count" fill="#BABABA">
          {fund_data.map((entry, index) =>
          // console.log(index, entry);
            (
              <Cell
                cursor="pointer"
                fill={entry['Funding Source'] === 'Measure O' ? '#8EC583' : '#BABABA'}
                key={`cell-${index}`}
                onClick={() => {
                  if (Object.keys(measureDescriptions).includes(entry['Funding Source'])) {
                    setCurrentMeasure(entry['Funding Source']);
                  } else {
                    setCurrentMeasure('');
                  }
                }}
              />
            ))}
        </Bar>
        {/* <Brush dataKey="count" height={30} stroke="#BABABA" /> */}
      </BarChart>
      <div className="fund-data-note-div">
        <b>About the data:</b>
        <p style={{ marginTop: 0 }}>
          This visualization includes projects with permits that were approved between Jan. 2019 and Dec. 2022. It does not include permits for additions or modifications.
        </p>
      </div>
    </div>
  );
}
