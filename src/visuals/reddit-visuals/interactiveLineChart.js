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
  const dates = ['2009-04', '2009-05', '2009-06', '2009-07', '2009-08', '2009-09', '2009-10', '2009-11', '2009-12', '2010-01', '2010-02', '2010-03', '2010-04', '2010-05', '2010-06', '2010-07', '2010-08', '2010-09', '2010-10', '2010-11', '2010-12', '2011-01', '2011-02', '2011-03', '2011-04', '2011-05', '2011-06', '2011-07', '2011-08', '2011-09', '2011-10', '2011-11', '2011-12', '2012-01', '2012-02', '2012-03', '2012-04', '2012-05', '2012-06', '2012-07', '2012-08', '2012-09', '2012-10', '2012-11', '2012-12', '2013-01', '2013-02', '2013-03', '2013-04', '2013-05', '2013-06', '2013-07', '2013-08', '2013-09', '2013-10', '2013-11', '2013-12', '2014-01', '2014-02', '2014-03', '2014-04', '2014-05', '2014-06', '2014-07', '2014-08', '2014-09', '2014-10', '2014-11', '2014-12', '2015-01', '2015-02', '2015-03', '2015-04', '2015-05', '2015-06', '2015-07', '2015-08', '2015-09', '2015-10', '2015-11', '2015-12', '2016-01', '2016-02', '2016-03', '2016-04', '2016-05', '2016-06', '2016-07', '2016-08', '2016-09', '2016-10', '2016-11', '2016-12', '2017-01', '2017-02', '2017-03', '2017-04', '2017-05', '2017-06', '2017-07', '2017-08', '2017-09', '2017-10', '2017-11', '2017-12', '2018-01', '2018-02', '2018-03', '2018-04', '2018-05', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12', '2019-01', '2019-02', '2019-03', '2019-04', '2019-05', '2019-06', '2019-07', '2019-08', '2019-09', '2019-10', '2019-11', '2019-12', '2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06', '2020-07', '2020-08', '2020-09', '2020-10', '2020-11', '2020-12', '2021-01', '2021-02', '2021-03', '2021-04', '2021-05', '2021-06', '2021-07', '2021-08', '2021-09', '2021-10', '2021-11', '2021-12', '2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06', '2022-07', '2022-08', '2022-09', '2022-10'];
  const [csvdata, setCsvdata] = useState(data);
  const [input, setInput] = useState('');
  const [word, setWord] = useState(' ');
  //   const [loading, setLoading] = useState('Done loading');

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const changeMyData = (x) => {
    setCsvdata(x);
  };

  function wordUsageOverTime(inputWord) {
    const allData = [];
    dfd
      .readCSV(
        'https://raw.githubusercontent.com/shoehair/data/main/11-21-csv%20(1).csv',
      )
      .then((df) => {
        const dfDrop = df.dropNa({ axis: 0 });
        dfDrop.print();
        const condition = dfDrop.title.str
          .includes(inputWord)
          .or(dfDrop.text.str.includes(inputWord));

        let subDF = dfDrop.loc({ rows: condition });
        subDF = subDF.groupby(['period']).count();
        subDF.sortValues('period', { inplace: true });
        subDF.resetIndex({ inplace: true });
        let j = 0;
        for (let i = 0; i < dates.length; i += 1) {
          if (j < subDF.shape[0]) {
            var seriesX = subDF.loc({ rows: [j] }).period;
            var seriesY = subDF.loc({ rows: [j] }).title_count;
          }
          if (j < subDF.shape[0] && seriesX.values[0] == dates[i]) {
            allData.push({
              data: seriesX.values[0],
              count: seriesY.values[0],
            });
            j += 1;
          } else {
            allData.push({
              data: dates[i],
              count: 0,
            });
          }
        }
        // for (let i = 0; i < subDF.shape[0]; i += 1) {
        //   const seriesX = subDF.loc({ rows: [i] }).period;
        //   const seriesY = subDF.loc({ rows: [i] }).title_count;
        //   allData.push({
        //     data: seriesX.values[0],
        //     count: seriesY.values[0],
        //   });
        // }

        changeMyData(allData);
      })
      .catch((err) => {
        // console.log(err);
      });
  }

  const handleClick = (event) => {
    event.preventDefault();
    setWord(input);
    wordUsageOverTime(input);
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
      <button type="button" onClick={handleClick}>Click</button>
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
