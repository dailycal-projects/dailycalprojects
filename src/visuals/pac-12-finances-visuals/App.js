import './App.css';
import React from 'react';

import DebtBarChart from './visuals/DebtBarChart';
import DropdownBudgetOverTime from './visuals/DropdownBudgetOverTime';
import Map from './visuals/Map';
import AreaCharts from './visuals/AreaCharts';
import ConferenceBarChart from './visuals/ConferenceBarChart';

function financeVisuals() {
  return (
    <div>
      <h1>Visuals for Cal's finances as part of the Pac-12</h1>

      <div>
        <h2>The dissolution of the Pac-12 conference</h2>
        <Map />
      </div>

      <div>
        <AreaCharts />
      </div>

      <div>
        <h2>Revenue affiliated with the Pac-12 and NCAA over time</h2>
        <ConferenceBarChart />
      </div>

      <div>
        <h2>Overall debt compared to that of football</h2>
        <DebtBarChart />
      </div>

      <div>
        <h2>Overall budget over time</h2>
        <h3>Computed as the difference between revenue and expenses</h3>
        <DropdownBudgetOverTime />
      </div>
    </div>
  );
}

export default financeVisuals;
