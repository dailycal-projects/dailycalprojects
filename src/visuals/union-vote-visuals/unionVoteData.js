const numSR = [
  {
    campus: 'UC Berkeley',
    'SRU-UAW "yes" votes': 2166,
    'SRU-UAW "no" votes': 843,
  },
  {
    campus: 'UCSD',
    'SRU-UAW "yes" votes': 1967,
    'SRU-UAW "no" votes': 443,
  },
  {
    campus: 'UCLA',
    'SRU-UAW "yes" votes': 1540,
    'SRU-UAW "no" votes': 735,
  },
  {
    campus: 'UC Davis',
    'SRU-UAW "yes" votes': 1464,
    'SRU-UAW "no" votes': 511,
  },
  {
    campus: 'UC Irvine',
    'SRU-UAW "yes" votes': 948,
    'SRU-UAW "no" votes': 358,
  },
  {
    campus: 'UC Riverside',
    'SRU-UAW "yes" votes': 620,
    'SRU-UAW "no" votes': 236,
  },
  {
    campus: 'UCSB',
    'SRU-UAW "yes" votes': 595,
    'SRU-UAW "no" votes': 450,
  },
  {
    campus: 'UCSF',
    'SRU-UAW "yes" votes': 378,
    'SRU-UAW "no" votes': 242,
  },
  {
    campus: 'Berkeley Lab',
    'SRU-UAW "yes" votes': 176,
    'SRU-UAW "no" votes': 29,
  },
  {
    campus: 'UCSC',
    'SRU-UAW "yes" votes': 135,
    'SRU-UAW "no" votes': 586,
  },
  {
    campus: 'UC Merced',
    'SRU-UAW "yes" votes': 68,
    'SRU-UAW "no" votes': 207,
  },
];

const percSR = [
  {
    campus: 'Berkeley Lab',
    'SRU-UAW "yes" votes': 85.9,
    'SRU-UAW "no" votes': 14.1,
  },
  {
    campus: 'UCSD',
    'SRU-UAW "yes" votes': 81.6,
    'SRU-UAW "no" votes': 18.4,
  },
  {
    campus: 'UC Davis',
    'SRU-UAW "yes" votes': 74.1,
    'SRU-UAW "no" votes': 25.9,
  },
  {
    campus: 'UC Irvine',
    'SRU-UAW "yes" votes': 72.6,
    'SRU-UAW "no" votes': 27.4,
  },
  {
    campus: 'UC Riverside',
    'SRU-UAW "yes" votes': 72.4,
    'SRU-UAW "no" votes': 27.6,
  },
  {
    campus: 'UC Berkeley',
    'SRU-UAW "yes" votes': 72.0,
    'SRU-UAW "no" votes': 28.0,
  },
  {
    campus: 'All campuses',
    'SRU-UAW "yes" votes': 68.4,
    'SRU-UAW "no" votes': 31.6,
  },
  {
    campus: 'UCLA',
    'SRU-UAW "yes" votes': 67.7,
    'SRU-UAW "no" votes': 32.3,
  },
  {
    campus: 'UCSF',
    'SRU-UAW "yes" votes': 61.0,
    'SRU-UAW "no" votes': 39.0,
  },
  {
    campus: 'UCSB',
    'SRU-UAW "yes" votes': 56.9,
    'SRU-UAW "no" votes': 43.1,
  },
  {
    campus: 'UC Merced',
    'SRU-UAW "yes" votes': 24.7,
    'SRU-UAW "no" votes': 75.3,
  },
  {
    campus: 'UCSC',
    'SRU-UAW "yes" votes': 18.7,
    'SRU-UAW "no" votes': 81.3,
  },
];

const numASE = [
  {
    campus: 'UC Berkeley',
    'UAW 2865 "yes" votes': 3212,
    'UAW 2865 "no" votes': 1462,
  },
  {
    campus: 'UCSD',
    'UAW 2865 "yes" votes': 2154,
    'UAW 2865 "no" votes': 799,
  },
  {
    campus: 'UCLA',
    'UAW 2865 "yes" votes': 1892,
    'UAW 2865 "no" votes': 1089,
  },
  {
    campus: 'UC Davis',
    'UAW 2865 "yes" votes': 1470,
    'UAW 2865 "no" votes': 751,
  },
  {
    campus: 'UC Irvine',
    'UAW 2865 "yes" votes': 1065,
    'UAW 2865 "no" votes': 505,
  },
  {
    campus: 'UC Riverside',
    'UAW 2865 "yes" votes': 704,
    'UAW 2865 "no" votes': 407,
  },
  {
    campus: 'UCSB',
    'UAW 2865 "yes" votes': 505,
    'UAW 2865 "no" votes': 922,
  },
  {
    campus: 'UCSC',
    'UAW 2865 "yes" votes': 210,
    'UAW 2865 "no" votes': 844,
  },
  {
    campus: 'UC Merced',
    'UAW 2865 "yes" votes': 105,
    'UAW 2865 "no" votes': 288,
  },
  {
    campus: 'UCSF',
    'UAW 2865 "yes" votes': 69,
    'UAW 2865 "no" votes': 30,
  },
];

const percASE = [
  {
    campus: 'UCSD',
    'UAW 2865 "yes" votes': 72.9,
    'UAW 2865 "no" votes': 27.1,
  },
  {
    campus: 'UCSF',
    'UAW 2865 "yes" votes': 69.7,
    'UAW 2865 "no" votes': 30.3,
  },
  {
    campus: 'UC Berkeley',
    'UAW 2865 "yes" votes': 68.7,
    'UAW 2865 "no" votes': 31.3,
  },
  {
    campus: 'UC Irvine',
    'UAW 2865 "yes" votes': 67.8,
    'UAW 2865 "no" votes': 32.2,
  },
  {
    campus: 'UC Davis',
    'UAW 2865 "yes" votes': 66.2,
    'UAW 2865 "no" votes': 33.8,
  },
  {
    campus: 'UCLA',
    'UAW 2865 "yes" votes': 63.5,
    'UAW 2865 "no" votes': 36.5,
  },
  {
    campus: 'UC Riverside',
    'UAW 2865 "yes" votes': 63.4,
    'UAW 2865 "no" votes': 36.6,
  },
  {
    campus: 'All campuses',
    'UAW 2865 "yes" votes': 61.6,
    'UAW 2865 "no" votes': 38.4,
  },
  {
    campus: 'UCSB',
    'UAW 2865 "yes" votes': 35.4,
    'UAW 2865 "no" votes': 64.6,
  },
  {
    campus: 'UC Merced',
    'UAW 2865 "yes" votes': 24.7,
    'UAW 2865 "no" votes': 75.3,
  },
  {
    campus: 'UCSC',
    'UAW 2865 "yes" votes': 19.9,
    'UAW 2865 "no" votes': 80.1,
  },
];

const accessData = {
  'Student researchers Number of votes': numSR,
  'Student researchers Percent of votes': percSR,
  'Academic student employees Number of votes': numASE,
  'Academic student employees Percent of votes': percASE,
};

export default accessData;
