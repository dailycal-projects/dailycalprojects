import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Text, ResponsiveContainer,
} from 'recharts';
import RHNA from './data/RHNA_data.json';

import './RHNABarChart.css';

// const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

// const getPercent = (value, total) => {
//   const ratio = total > 0 ? value / total : 0;

//   return toPercent(ratio, 2);
// };

const reverseTooltipContent = (o) => {
  const { payload } = o;

  return (
    <div className="customized-tooltip-content">
      <ul className="list">
        {payload.reverse().map((entry) => (
          <li
            // key={`item-${index}`}
            style={{ color: entry.color }}
          >
            {`${entry.name}: ${entry.value}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

// const renderTooltipContent = (o) => {
//   const { payload, label } = o;
//   const total = payload.reduce((result, entry) => result + entry.value, 0); // calculate total

//   return (
//     <div className="customized-tooltip-content">

//       <ul className="list">
//         {payload.reverse().map((entry, index) => (
//           <li key={`item-${index}`} style={{ color: entry.color }}>
//             {`${entry.name}: ${entry.value} (${getPercent(entry.value, total)})`}
//           </li>
//         ))}
//         <li className="total">{`${label} (Total: ${total})`}</li>
//       </ul>

//     </div>
//   );
// };

function RHNABarChart() {
  // const [isMobile, setIsMobile] = useState(false);

  // let window = undefined;
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (typeof window !== 'undefined') {
  //       setIsMobile(window.innerWidth < 1024);
  //     }
  //   };
  //   // Initial check on mount
  //   handleResize();

  //   // Event listener for window resize
  //   if (typeof window !== 'undefined') {
  //     window.addEventListener('resize', handleResize);
  //   }

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     if (typeof window !== 'undefined') {
  //       window.removeEventListener('resize', handleResize);
  //     }
  //   };
  // }, []);

  const containerStyle = {
    // height: isMobile ? 400 : 500,
    height: 500,
    margin: {
      top: 20,
      right: 20,
      left: 20,
      bottom: 50,
    },
  };

  // y-label
  const CustomizedLabelY = () => (
    <Text
      x={containerStyle.margin.left}
      y={(containerStyle.height * 2) / 5}
      textAnchor="middle"
      angle={-90}
    >
      # of Projects Funded by Source
    </Text>
  );

  return (
    <div>
      {RHNA
        && (
          <div>
            <div className="rhna-title-div">
              <h4>
                Berkeley Regional Housing Needs Allocation (RHNA) by income level
              </h4>
              <p>Affordable housing quotas for the 2015-2023 and 2023-2031 periods</p>
            </div>
            <div
              className="rhna-chart-div"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <ResponsiveContainer
                height={containerStyle.height}
              >
                <BarChart
                  label={<p>&quot; Regional Housing Needs Allocation (RHNA) Units &quot;</p>}
                  data={RHNA}
                  margin={containerStyle.margin}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time period" />
                  <YAxis label={CustomizedLabelY} />
                  <Tooltip content={reverseTooltipContent} />
                  <Legend
                    formatter={(value) => <span className="legend-text-color">{value}</span>}
                  />
                  {/* <Bar dataKey="very low" stackId="a" fill="#DC5B3F" />
                <Bar dataKey="low" stackId="a" fill="#DC8D40" />
                <Bar dataKey="moderate" stackId="a" fill="#DCA640" />
                <Bar dataKey="above moderate" stackId="a" fill="#DBBF40" /> */}
                  <Bar dataKey="very low" stackId="a" fill="#E3555F" />
                  <Bar dataKey="low" stackId="a" fill="#F3803F" />
                  <Bar dataKey="moderate" stackId="a" fill="#FBA83D" />
                  <Bar dataKey="above moderate" stackId="a" fill="#FED23B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
    </div>
  );
}

export default RHNABarChart;
