import React, { useState } from 'react';
import * as dfd from 'danfojs';
import {
  Legend,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

function InteractiveLineChart() {
  const data = [{ date: '1-10-2022', count: 10 }];
  const [csvdata, setCsvdata] = useState(data);
  const [input, setInput] = useState('');
  const [word, setWord] = useState(' ');
  //   const [loading, setLoading] = useState('Done loading');

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  function wordUsageOverTime(word) {
    const allData = [];
    dfd
      .readCSV(
        'https://raw.githubusercontent.com/shoehair/data/main/10-10-csv.csv',
      )
      .then((df) => {
        const dfDrop = df.dropNa({ axis: 0 });
        dfDrop.print();
        const condition = dfDrop.title.str
          .includes(word)
          .or(dfDrop.text.str.includes(word));

        let subDF = dfDrop.loc({ rows: condition });
        subDF = subDF.groupby(['period']).count();
        subDF.sortValues('period', { inplace: true });
        subDF.resetIndex({ inplace: true });
        for (let i = 0; i < subDF.shape[0]; i += 1) {
          const seriesX = subDF.loc({ rows: [i] }).period;
          const seriesY = subDF.loc({ rows: [i] }).title_count;
          allData.push({
            data: seriesX.values[0],
            count: seriesY.values[0],
          });
        }
        console.log('Changed data');
        console.log(allData);
        changeMyData(allData);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleClick = (event) => {
    event.preventDefault();
    setWord(input);
    console.log(typeof input);
    wordUsageOverTime(input);
  };

  const changeMyData = (x) => {
    setCsvdata(x);
  };

  return (
    <div>
      <div>
        {' '}
        Graph of
        {' '}
        {word}
        {' '}
        usage over time
      </div>
      <input
        type="text"
        id="message"
        name="message"
        onChange={handleChange}
        value={input}
      />
      <button onClick={handleClick}>Click</button>
      <br />
      <ResponsiveContainer height={600}>
        <BarChart width={400} height={600} data={csvdata}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Bar dataKey="count" fill="#4d7da3" />
          <Tooltip />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default InteractiveLineChart;
