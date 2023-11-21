import React, { useState } from 'react';
import ButtonList from '../../../components/buttonList';
import Key from '../dataKey';
import allData from '../data';
import ScatterPlot from '../scatterPlot';

const WaterPlot = () => {
  const data = allData;

  const [waterKey, setWaterKey] = useState('Groundwater threats');
  const waterLabels = ['Groundwater threats', 'Impaired bodies of water'];

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
      setWaterKey(label);
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
      <ScatterPlot data={data} xDataKey="ZIP code" yDataKey={waterKey} />
    </div>
  );
};

export default WaterPlot;
