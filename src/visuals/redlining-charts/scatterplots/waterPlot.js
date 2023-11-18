import React, { useState } from 'react';
import ButtonList from '../../../components/buttonList';
import Key from '../dataKey';
import allData from '../data';
import ScatterPlot from '../scatterPlot';

const WaterPlot = () => {
  const data = allData;

  const [waterKey, setWaterKey] = useState('groundwater_threats');
  const waterLabels = ['groundwater threats', 'impaired bodies of water'];

  const createData = (indicator, description) => ({ indicator, description });
  const key = [
    createData(
      'Groundwater threats',
      'Underground storage tank site leaks near populated streets in specified census tract',
    ),
    createData(
      'Impaired waterbodies',
      'Pollutants in all impaired bodies of water near populated streets in specified census tract',
    ),
  ];

  const buttonToData = (label) => {
    if (waterLabels.includes(label)) {
      setWaterKey(label.replaceAll(' ', '_'));
    }
  };

  return (
    <div>
      <Key rows={key} />
      <ButtonList list={waterLabels} handleClick={buttonToData} />
      <p style={{
        display: 'flex', flexDirection: 'row-reverse', textAlign: 'center', fontWeight: '500',
      }}
      >
        Housing burden
        <br />
        percentile
      </p>
      <ScatterPlot data={data} xDataKey="zip" yDataKey={waterKey} />
    </div>
  );
};

export default WaterPlot;
