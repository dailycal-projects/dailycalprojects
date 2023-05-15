import React, { useState } from 'react';
import allData from '../data';
import ScatterPlot from '../scatterPlot';
import Key from '../dataKey';
import ButtonList from '../../../components/buttonList';

const ChemPlot = () => {
  const data = allData;

  const [chemKey, setChemKey] = useState('pollution');
  const chemicalLabels = [
    'pollution',
    'lead risk',
    'cleanup sites',
    'toxic release',
    'hazardous waste',
  ];

  const createData = (indicator, description) => ({ indicator, description });
  const key = [
    createData(
      'Pollution',
      'Pollution burden indicators from 0 to 10 as determined by environmental effects and exposures',
    ),
    createData(
      'Lead risk',
      'Children’s potential risk for lead exposure in low-income communities with older houses',
    ),
    createData(
      'Cleanup sites',
      'Hazardous waste cleanup sites near populated blocks in specified census tract',
    ),
    createData(
      'Toxic release',
      'Toxin concentrations in emissions from both on and off-site facilities as determined by risk-screening environmental indicators',
    ),
    createData(
      'Hazardous waste',
      'Hazardous waste facilities and large quantity generators near populated blocks in specified census tract',
    ),
  ];

  const buttonToData = (label) => {
    if (chemicalLabels.includes(label)) {
      setChemKey(label.replaceAll(' ', '_'));
    }
  };

  return (
    <div>
      <Key rows={key} />
      <ButtonList list={chemicalLabels} handleClick={buttonToData} />
      <p style={{
        display: 'flex', flexDirection: 'row-reverse', textAlign: 'center', fontWeight: '500',
      }}
      >
        Housing burden
        <br />
        percentile
      </p>
      <ScatterPlot data={data} xDataKey="zip" yDataKey={chemKey} />
    </div>
  );
};

export default ChemPlot;
