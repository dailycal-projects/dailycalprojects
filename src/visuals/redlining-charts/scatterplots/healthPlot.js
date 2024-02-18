import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import ButtonList from '../../../components/buttonList';
import Key from '../dataKey';
import allData from '../data';
import ScatterPlot from '../scatterPlot';

const HealthPlot = () => {
  const data = allData;

  const [healthKey, setHealthKey] = useState('Cardiovascular disease');
  const healthLabels = ['Cardiovascular disease', 'Low birth weight', 'Asthma'];

  const createData = (indicator, description) => ({ indicator, description });
  const key = [
    createData(
      'Cardiovascular disease',
      'Rate of emergency room visits for heart attacks in every 10,000 people adjusted for age',
    ),
    createData(
      'Low birth weight',
      'Babies born weighing less than 5 pounds and 8 ounces',
    ),
    createData(
      'Asthma',
      'Rate of emergency room visits for asthma',
    ),
  ];

  const buttonToData = (label) => {
    if (healthLabels.includes(label)) {
      setHealthKey(label);
    }
  };

  if (isMobile) {
    return (
      <div>
        <Key rows={key} />
        <ButtonList list={healthLabels} handleClick={buttonToData} />
        <ScatterPlot data={data} xDataKey="ZIP code" yDataKey={healthKey} />
        <p style={{
          marginTop: '15px',
          textAlign: 'center',
          fontWeight: '500',
        }}
        >
          Housing burden
          <br />
          percentile key
        </p>
      </div>
    );
  } return (
    <div>
      <Key rows={key} />
      <ButtonList list={healthLabels} handleClick={buttonToData} />
      <p style={{
        display: 'flex', flexDirection: 'row-reverse', textAlign: 'center', fontWeight: '500',
      }}
      >
        Housing burden
        <br />
        percentile
      </p>
      <ScatterPlot data={data} xDataKey="ZIP code" yDataKey={healthKey} />
    </div>
  );
};

export default HealthPlot;
