import React, { useState } from 'react';
import {
  MapContainer,
  CircleMarker,
  TileLayer,
  // Tooltip,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import valuationData from './data/permit_data.json';

import './projectsByValuationMap.css';

// add color (based on valuation) to map
const valuationColorDict = {
  Residential: {
    100: '#EAEEF0',
    1000: '#CEDFE6',
    10000: '#B2CFDB',
    100000: '#79AFC5',
    1000000: '#418FB0',
    10000000: '#257FA5',
    999999999999: '#086F9A',
  },
  'Affordable Housing': {
    100: '#E2E7E1',
    1000: '#B2D4AB',
    10000: '#9ACA90',
    100000: '#8EC583',
    1000000: '#82C075',
    10000000: '#52AD3F',
    999999999999: '#229908',
  },
  Commercial: {
    100: '#F0EEE9',
    1000: '#DBC5B1',
    10000: '#D0B095',
    100000: '#C59B79',
    1000000: '#BA865D',
    10000000: '#AF7141',
    999999999999: '#994708',
  },
  'Mixed Use': {
    100: '#E4E4E4',
    1000: '#CFCFCF',
    10000: '#C5C5C5',
    100000: '#BABABA',
    1000000: '#B0B0B0',
    10000000: '#A5A5A5',
    999999999999: '#909090',
  },
};

const valuationOpacityDict = {
  100: 0.1,
  1000: 0.2,
  10000: 0.3,
  100000: 0.4,
  1000000: 0.5,
  10000000: 0.6,
  999999999999: 0.7,
};

const valuationRangesList = [
  '0-100',
  '100-1,000',
  '1,000-10,000',
  '10,000-100,000',
  '100,000-1,000,000',
  '1,000,000-10,000,000',
  '10,000,000+',
];

const valuationToColor = (valuation, type) => {
  const color_dict_by_type = valuationColorDict[type];
  let color;
  for (const value_threshold in color_dict_by_type) {
    if (valuation <= value_threshold) {
      color = color_dict_by_type[value_threshold];
      break;
    }
  }
  return color;
};

const valuationToOpacity = (valuation) => {
  let opacity;
  for (const value_threshold in valuationOpacityDict) {
    if (valuation <= value_threshold) {
      opacity = valuationOpacityDict[value_threshold];
      break;
    }
  }
  return opacity;
};

// const valuation_to_size = (valuation) => {
//   const size = Math.min(Math.max(5, Math.pow(valuation, 0.15)), 25);
//   return size;
// };

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const valuation_format = (valuation) => formatter.format(valuation);

export default function ProjectsByValuation() {
  const [filterSelected, setFilterSelected] = useState(false);
  const [currentSelectedCategory, setCurrentSelectedCategory] = useState('');
  // const [isMobile, setIsMobile] = useState(false);

  // let window = undefined;
  // updates window width on page load/resize
  // useEffect(() => {
  //     const handleResize = () => {
  //         if (typeof window !== 'undefined') {
  //             setIsMobile(window.innerWidth < 1024);
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

  // let centerLat; let distanceLat; let bufferLat; let centerLong; let distanceLong; let
  //   bufferLong;

  // longitude/latitude info
  const centerLat = (valuationData.minLat + valuationData.maxLat) / 2;
  const distanceLat = valuationData.maxLat - valuationData.minLat;
  const bufferLat = distanceLat * 0.05;
  const centerLong = (valuationData.minLong + valuationData.maxLong) / 2;
  const distanceLong = valuationData.maxLong - valuationData.minLong;
  const bufferLong = distanceLong * 0.05;

  // deriving color & opacity info
  valuationData.info = valuationData.info.map((d) => {
    d.color = valuationToColor(d.Valuation, d['Building Type']);
    d.opacity = valuationToOpacity(d.Valuation);
    // d.size = valuation_to_size(d.Valuation);
    return d;
  });

  // reset legend items to all
  const resetItems = () => {
    const allPaths = document.querySelectorAll('.leaflet-interactive');
    allPaths.forEach((path) => {
      path.classList.remove('fade-out');
    });
    setFilterSelected(false);
    setCurrentSelectedCategory('');
  };

  // legend-item: on-click --> toggle visibility of corresponding points on map
  const toggleLegendItem = (category) => {
    const project_types = Object.keys(valuationColorDict);
    let matchedHues; let
      otherHues; // set based on clicked legend item

    // if clicking same item, (second consecutive click) reset map
    // also make reset button visible via filterSelected state
    if (currentSelectedCategory === category) {
      // console.log('reset map');
      resetItems();
    }
    // initial click or click after reset --> filter for category
    // else if(currentSelectedCategory == "") {
    else {
      // first reset any previous classes
      resetItems();
      // if category type is project type, match all fills in that project type
      if (project_types.includes(category)) {
        // console.log('TYPE');
        otherHues = Object.values(valuationColorDict[category]);
      }
      // if category type is valuation, match fills for valuation within each project type
      else {
        // console.log('VALUATION');
        otherHues = Object.keys(valuationColorDict).map((c) => valuationColorDict[c][category]);
      }
      matchedHues = Object.values(valuationColorDict).map((innerObj) => Object.values(innerObj)).flat().filter((item) => !otherHues.includes(item));
      const selector = `.leaflet-interactive[fill="${matchedHues.join('"], .leaflet-interactive[fill="')}"]`;
      const matchingPaths = document.querySelectorAll(selector);
      matchingPaths.forEach((path) => {
        path.classList.add('fade-out');
      });
      setFilterSelected(true);
      setCurrentSelectedCategory(category);
    }
  };

  return (
    <div>
      {valuationData
                && (
                <div className="valuation-map-div">
                  {/* TITLE [ROW1, COL1 & COL2] */}
                  <div className="vm-title-div">
                    <h4>
                      Berkeley Construction Projects by Valuation
                    </h4>
                  </div>
                  {/* LEGEND + DESCRIPTION [R2, C1] */}
                  {/* <div className='vm-legend-note-div'> */}
                  {/* LEGEND */}

                    {/* DESCRIPTION */}
                  <div className="vm-note-div">
                    <p>
                      <b>How to use this visualization:</b>
                      <li>Click an item in the legend to filter projects by building type or valuation.</li>
                      <li>Click a point on the map to view project details and a link to the location on Google Maps.</li>
                    </p>

                  </div>

                    {/* </div> */}
                  {/* VIZ [R2, C2] */}
                  <div className="vm-map-div">
                    {/* MAP VIZ */}
                    {
                      <MapContainer
                        scrollWheelZoom={false}
                        minZoom={12}
                        zoom={13}
                        center={[centerLat, centerLong]}
                        bounds={[
                          [
                            valuationData.minLat - bufferLat,
                            valuationData.minLong - bufferLong,
                          ],
                          [
                            valuationData.maxLat + bufferLat,
                            valuationData.maxLong + bufferLong,
                          ],
                        ]}
                      >
                        {/* create plot for points to appear on */}
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png"
                        />

                        {/* scatter plot points */}
                        {valuationData.info.map((info, k) => (
                          <g className={`${k}-circle`}>
                            <CircleMarker
                              // key={k}
                              center={[info.Coordinates[0], info.Coordinates[1]]}
                                            // radius={info.size}
                              radius={6}
                              stroke
                              weight={1}
                              fill
                              color="#000"
                              opacity={info.opacity}
                              fillColor={info.color}
                              fillOpacity={info.opacity}
                              data={k}
                            >

                              {/* point hover popup */}
                              <Popup>
                                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                                  <p>
                                    {'Address: '}
                                    <a href={`https://www.google.com/maps/place/${info.Address}`} target="_blank" rel="noreferrer">{info.Address}</a>
                                  </p>
                                  <p>
                                    {'Type: '}
                                    <span style={{ color: valuationColorDict[info['Building Type']][100000] }}>{info['Building Type']}</span>
                                  </p>
                                  <p>
                                    {'Permit Issued: '}
                                    {info['Date Issued']}
                                  </p>
                                  <p>
                                    {'Valuation: '}
                                    {valuation_format(info.Valuation)}
                                  </p>
                                  <p className="popup-description">
                                    {'Description: '}
                                    {info['Work Description']}
                                  </p>
                                </div>
                              </Popup>
                            </CircleMarker>
                          </g>
                        ))}
                      </MapContainer>
                        }
                  </div>
                  <div className="vm-legend-div">
                    <svg className="vm-legend-svg">
                      <text
                        className="svg-text legend-title"
                                // x={isMobile ? '5vw' : '0vw'}
                        x="0vw"
                      >
                        Building Type
                      </text>
                      {
                                Object.keys(valuationColorDict).map((k, i) =>
                                // console.log(i, k);
                                  (
                                    <g
                                      className="legend-item"
                                      id={`${k}-legend-item`}
                                      onClick={() => {
                                        toggleLegendItem(k);
                                      }}
                                      style={{ pointerEvents: 'bounding-box' }}
                                    >
                                      <circle
                                        className="svg-circle"
                                        stroke="#000"
                                        fill={valuationColorDict[k][100000]}
                                        fillOpacity={1}
                                        cx="5vw"
                                                // cy={isMobile ? `${2.5 * (i + 1)}vh` : `${15 + 2.5 * (i + 1)}vh`}
                                        cy={`${2.5 * (i + 1)}vh`}
                                        r={6}
                                      />
                                      <text
                                        className="svg-text"
                                        x="8vw"
                                                // y={isMobile ? `${2.5 * (i + 1) + 0.5}vh` : `${15 + 2.5 * (i + 1) + 0.5}vh`}
                                        y={`${2.5 * (i + 1) + 0.5}vh`}
                                        style={{ fontWeight: currentSelectedCategory === k ? 400 : 300 }}
                                      >
                                        {Object.keys(valuationColorDict)[i]}
                                      </text>
                                    </g>
                                  ))
                            }
                      <text
                        className="svg-text legend-title"
                                // x={isMobile ? '50vw' : '0vw'} // right on mobile
                        x="0vw" // right on mobile
                                // y={isMobile ? '0vh' : '30vh'} // below on desktop
                        y="15vh"
                      >
                        Valuation in Dollars
                      </text>
                      {
                                Object.keys(valuationColorDict.Residential).map((k, i) =>
                                // console.log(i, k);
                                  (
                                    <g
                                      className="legend-item"
                                      id={`${k}-legend-item`}
                                      onClick={() => {
                                        toggleLegendItem(k);
                                      }}
                                      style={{ pointerEvents: 'bounding-box' }}
                                    >
                                      <circle
                                        className="svg-circle"
                                        stroke="#000"
                                        fill={valuationColorDict.Residential[k]}
                                        fillOpacity={valuationOpacityDict[k]}
                                        strokeOpacity={valuationOpacityDict[k]}
                                                // cx={isMobile ? '50vw' : '5vw'}
                                        cx="5vw"
                                                // cy={isMobile ? `${2.5 * (i + 1)}vh` : `${30 + 2.5 * (i + 1)}vh`}
                                        cy={`${15 + 2.5 * (i + 1)}vh`}
                                        r={6}
                                      />
                                      <text
                                        className="svg-text"
                                                // x={isMobile ? '53vw' : '8vw'}
                                        x="8vw"
                                                // y={isMobile ? `${2.5 * (i + 1) + 0.5}vh` : `${30 + 2.5 * (i + 1) + 0.5}vh`}
                                        y={`${15 + 2.5 * (i + 1) + 0.5}vh`}
                                        style={{ fontWeight: currentSelectedCategory === k ? 400 : 300 }}
                                      >
                                        {valuationRangesList[i]}
                                      </text>
                                    </g>
                                  ))
                            }
                    </svg>
                    <input
                      id="reset-button"
                      type="button"
                      value="reset"
                      style={{ visibility: filterSelected ? 'visible' : 'hidden' }}
                      onClick={() => { resetItems(); }}
                    />
                  </div>

                  <div className="data-note-div">
                    <p style={{ marginTop: 0 }}>
                      <b>About the data:</b>
                      {' '}
                      This visualization includes construction projects that received permits between Jan. 2019 and Dec. 2022 in Berkeley. It does not include permits for additions or modifications to existing projects.
                    </p>
                  </div>
                </div>
                )}
    </div>
  );
}
