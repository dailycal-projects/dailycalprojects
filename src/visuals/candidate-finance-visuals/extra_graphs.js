import React from 'react';
import DatawrapperChart from '../../components/dataWrapper';
import { WIDTH } from './treemap';

export function FinanaceVizElement({ children, maxWidth = WIDTH }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box',
        padding: '0 10px',
        margin: '20px 0',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: `${maxWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function FinanceDatawrapperCharts() {
  return (
    <FinanaceVizElement>
      <DatawrapperChart chartId="ZBnI6" />
    </FinanaceVizElement>
  );
}
