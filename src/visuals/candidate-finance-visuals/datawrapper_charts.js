import React from 'react';
import DatawrapperChart from '../../components/dataWrapper';
import { WIDTH } from './treemap';

function FinanceDWChart({ chartId }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: `${WIDTH}px`,
        }}
      >
        <DatawrapperChart chartId={chartId} />
      </div>
    </div>
  );
}

export function FinanceDatawrapperCharts() {
  return (
    <>
      <FinanceDWChart chartId="ZBnI6" />
    </>
  );
}
