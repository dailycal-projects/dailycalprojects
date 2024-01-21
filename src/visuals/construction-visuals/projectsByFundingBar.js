import React, { useState } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Text, ResponsiveContainer,
} from 'recharts';
import fundData from './data/berk_construction_by_fund.json';

import './projectsByFundingBar.css';

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

  // "Measure O": <p style={{ color: '#8EC583' }}>Measure O provides $135 million of funding from bond revenue to pay for <b>affordable housing</b> projects.</p>,
  'Measure O': <p style={{ color: '#215775' }}>
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
  const fundDataDynamic = fundData.slice(0, 13);
  // const [fundDataDynamic, setFundDataDynamic] = useState(fundData.slice(0, 13));
  // const [isMobile, setIsMobile] = useState(false);

  // let window = undefined;
  // truncate bars to first 10 for mobile
  // useEffect(() => {
  //     const handleResize = () => {
  //         if (typeof window !== 'undefined') {
  //             setIsMobile(window.innerWidth < 1024);
  //             if (window.innerWidth < 1024) {
  //                 setFundDataDynamic(fundData.slice(0, 13));
  //             }
  //         }
  //     };
  //     // Initial check on mount
  //     handleResize();

  //     // Event listener for window resize
  //     if (typeof window !== 'undefined') {
  //         window.addEventListener('resize', handleResize);
  //     }

  //     // Cleanup the event listener on component unmount
  //     return () => {
  //         if (typeof window !== 'undefined') {
  //             window.removeEventListener('resize', handleResize);
  //         }
  //     };
  // }, []);

  const containerStyle = {
    // height: isMobile ? 500 : 800,
    height: 600,
    margin: {
      top: 20,
      // right: isMobile ? 20 : 120,
      right: 20,
      left: 20,
      // bottom: isMobile ? 130 : 120
      bottom: 130,
    },
  };

  // y-label
  const CustomizedLabelY = () => (
    <Text
      x={containerStyle.margin.left}
      y={containerStyle.height / 2}
      textAnchor="middle"
      angle={-90}
    >
      Number of projects
    </Text>
  );

  // x-label
  const CustomizedLabelX = () => (
    <Text
      x={containerStyle.width / 2}
      y={containerStyle.height - containerStyle.margin.top}
      textAnchor="middle"
      // dx={isMobile ? 0 : containerStyle.width / 2 - containerStyle.margin.right / 2}
      dx={containerStyle.width / 2 - containerStyle.margin.right / 2}
      // dy={isMobile ? 0 : -containerStyle.margin.bottom}
      dy={-containerStyle.margin.bottom}
    >
      Funding Source
    </Text>
  );

  return (
    <div>
      <div className="fund-title-div">
        <h4>
          Funding sources for Berkeley Capital Projects
        </h4>
      </div>
      <div className="fund-desc-div">
        <p>Click a bar to learn more about the funding source</p>
      </div>

      <div id="measure-explainer-container-div">
        <div id="measure-explainer-div">
          <b
            style={{ color: currentMeasure === 'Measure O' ? '#215775' : '#888' }}
          >
            {currentMeasure}
          </b>
          <p style={{ color: currentMeasure === 'Measure O' ? '#215775' : '#888' }}>{measureDescriptions[currentMeasure]}</p>
        </div>
      </div>
      <div
        className="fund-chart-div"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <ResponsiveContainer
          // width={isMobile ? "95%" : "80%"}
          height={containerStyle.height}
        >
          <BarChart
            // width={containerStyle.width}
            // height={containerStyle.height}
            data={fundDataDynamic}
            margin={containerStyle.margin}
          >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            {/* <XAxis dataKey="Funding Source" label={CustomizedLabelX} tick={CustomizedAxisTick} /> */}
            <XAxis
              dataKey="Funding Source"
              label={CustomizedLabelX}
              // angle={isMobile ? -40 : -30}
              angle={-40}
              interval={0}
              // tick={{ fontSize: isMobile ? 12 : 10, fill: '#000' }}
              tick={{ fontSize: 10, fill: '#000' }}
              textAnchor="end"
            />
            <YAxis
              label={CustomizedLabelY}
              domain={[0, 53]}
              ticks={[0, 10, 20, 30, 40, 50]}
            />
            <Tooltip cursor={false} />
            {/* <Legend /> */}
            <Bar dataKey="count" fill="#BABABA">
              {fundData.map((entry, index) =>
              // console.log(index, entry);
              (
                <Cell
                  cursor="pointer"
                  fill={entry['Funding Source'] === 'Measure O' ? '#215775' : '#BABABA'}
                  // key={`cell-${index}`}
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
        </ResponsiveContainer>
      </div>
      <div className="fund-data-note-div">
        <b>About the data:</b>
        <p style={{ marginTop: 0 }}>
          This visualization includes projects with permits that were approved between Jan. 2019 and Dec. 2022. It does not include permits for additions or modifications.
        </p>
      </div>
    </div>
  );
}
