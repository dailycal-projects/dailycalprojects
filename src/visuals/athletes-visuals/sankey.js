import React from 'react';
import { Chart } from 'react-google-charts';

export const data = [
  ['From', 'To', 'Count'],
  ["Men's Baseball", 'Private', 20],
  ["Men's Baseball", 'Public', 29],
  ["Men's Basketball", 'Private', 14],
  ["Men's Basketball", 'Public', 4],
  ["Men's Cross Country", 'Private', 2],
  ["Men's Cross Country", 'Public', 11],
  ["Men's Football", 'Private', 36],
  ["Men's Football", 'Public', 60],
  ["Men's Golf", 'Private', 10],
  ["Men's Golf", 'Public', 4],
  ["Men's Gymnastics", 'Private', 10],
  ["Men's Gymnastics", 'Public', 12],
  ["Men's Rowing", 'Private', 31],
  ["Men's Rowing", 'Public', 31],
  ["Men's Rugby", 'Private', 30],
  ["Men's Rugby", 'Public', 23],
  ["Men's Soccer", 'Private', 6],
  ["Men's Soccer", 'Public', 19],
  ["Men's Swimming & Diving", 'Private', 14],
  ["Men's Swimming & Diving", 'Public', 24],
  ["Men's Tennis", 'Private', 4],
  ["Men's Tennis", 'Public', 5],
  ["Men's Track & Field", 'Private', 6],
  ["Men's Track & Field", 'Public', 51],
  ["Men's Water Polo", 'Private', 13],
  ["Men's Water Polo", 'Public', 20],
  ["Women's Basketball", 'Private', 7],
  ["Women's Basketball", 'Public', 5],
  ["Women's Beach Volleyball", 'Private', 9],
  ["Women's Beach Volleyball", 'Public', 9],
  ["Women's Cross Country", 'Private', 2],
  ["Women's Cross Country", 'Public', 14],
  ["Women's Field Hockey", 'Private', 11],
  ["Women's Field Hockey", 'Public', 16],
  ["Women's Golf", 'Private', 4],
  ["Women's Golf", 'Public', 5],
  ["Women's Gymnastics", 'Private', 3],
  ["Women's Gymnastics", 'Public', 11],
  ["Women's Lacrosse", 'Private', 13],
  ["Women's Lacrosse", 'Public', 20],
  ["Women's Rowing", 'Private', 18],
  ["Women's Rowing", 'Public', 35],
  ["Women's Soccer", 'Private', 7],
  ["Women's Soccer", 'Public', 27],
  ["Women's Softball", 'Private', 6],
  ["Women's Softball", 'Public', 18],
  ["Women's Swimming & Diving", 'Private', 10],
  ["Women's Swimming & Diving", 'Public', 19],
  ["Women's Swimming & Diving", 'Other/Unknown', 1],
  ["Women's Tennis", 'Private', 4],
  ["Women's Tennis", 'Public', 5],
  ["Women's Track & Field", 'Private', 13],
  ["Women's Track & Field", 'Public', 44],
  ["Women's Volleyball", 'Private', 5],
  ["Women's Volleyball", 'Public', 8],
  ["Women's Water Polo", 'Private', 8],
  ["Women's Water Polo", 'Public', 16],
];

export const options = {
  sankey: {
    link: { color: { fill: '#AAAEB5' } },
    node: {
      colors: [
        '#AAAEB5',
        '#e87876',
        '#70aada',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#000000',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
        '#AAAEB5',
      ],
      label: { color: '#000000' },
    },
  },
};

export function App() {
  return (
    <Chart
      chartType="Sankey"
      width="100%"
      height="800px"
      data={data}
      options={options}
    />
  );
}
