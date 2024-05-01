const age = [
  {
    name: '<18',
    'Percent in Fall 2022': 1.1,
    'Percent in Spring 2023': 1.1,
    color: '#fba93d',
    colorLight: '#fedaaa',
  },
  {
    name: '18-25',
    'Percent in Fall 2022': 21.1,
    'Percent in Spring 2023': 18.9,
  },
  {
    name: '25-50',
    'Percent in Fall 2022': 40,
    'Percent in Spring 2023': 51.8,
  },
  {
    name: '50-65',
    'Percent in Fall 2022': 21.1,
    'Percent in Spring 2023': 8.2,

  },
  {
    name: '65+',
    'Percent in Fall 2022': 10.5,
    'Percent in Spring 2023': 18.2,
  },
  {
    name: 'PND',
    'Percent in Fall 2022': 6.3,
    'Percent in Spring 2023': 11.4,
  },
];

const storyCategory = [
  {
    name: 'Campus',
    'Percent in Fall 2022': 60,
    'Percent in Spring 2023': 50.7,
    color: '#95C361',
    colorLight: '#D2E2BB',
  },
  {
    name: 'City',
    'Percent in Fall 2022': 31.6,
    'Percent in Spring 2023': 39.3,
  },
  {
    name: 'State/National',
    'Percent in Fall 2022': 2.1,
    'Percent in Spring 2023': 8.6,
  },
  {
    name: 'Obituary',
    'Percent in Fall 2022': 6.3,
    'Percent in Spring 2023': 1.4,
  },
];

const primaryRole = [
  {
    name: 'Subject matter expert',
    'Percent in Fall 2022': 32.6,
    'Percent in Spring 2023': 21.3,
    color: '#489BD1',
    colorLight: '#B5CFEA',
  },
  {
    name: 'First-person account',
    'Percent in Fall 2022': 12.7,
    'Percent in Spring 2023': 21.4,
  },
  {
    name: 'Goverment official or politician',
    'Percent in Fall 2022': 13.8,
    'Percent in Spring 2023': 12.1,
  },
  {
    name: 'Activist or advocate',
    'Percent in Fall 2022': 15.9,
    'Percent in Spring 2023': 13.6,
  },
  {
    name: 'Campus authority',
    'Percent in Fall 2022': 19,
    'Percent in Spring 2023': 15.4,
  },
  {
    name: 'Business owner',
    'Percent in Fall 2022': 1.2,
    'Percent in Spring 2023': 11.5,
  },
  {
    name: 'Worker at a business',
    'Percent in Fall 2022': 3.2,
    'Percent in Spring 2023': 0,
  },
  {
    name: 'Cultural figure',
    'Percent in Fall 2022': 1.1,
    'Percent in Spring 2023': 7.3,
  },
  {
    name: 'Relation to person in obituary',
    'Percent in Fall 2022': 3.2,
    'Percent in Spring 2023': 0,
  },
  {
    name: 'Formerly in media',
    'Percent in Fall 2022': 3.3,
    'Percent in Spring 2023': 0,
  },
  {
    name: 'Professor, lecturer, researcher',
    'Percent in Fall 2022': 1.1,
    'Percent in Spring 2023': 10.9,
  },
  {
    name: 'UCPD or BPD',
    'Percent in Fall 2022': 0,
    'Percent in Spring 2023': 3.3,
  },
  {
    name: 'Student athlete',
    'Percent in Fall 2022': 0,
    'Percent in Spring 2023': 1.1,
  },
];

const pronouns = [
  {
    name: 'She/her',
    'Percent in Fall 2022': 36.8,
    'Percent in Spring 2023': 37.9,
    color: '#61699A',
    colorLight: '#B4B4CE',

  },
  {
    name: 'He/him',
    'Percent in Fall 2022': 55.8,
    'Percent in Spring 2023': 53.6,
  },
  {
    name: 'They/them',
    'Percent in Fall 2022': 5.3,
    'Percent in Spring 2023': 1.8,
  },
  {
    name: 'They/she',
    'Percent in Fall 2022': 1.1,
    'Percent in Spring 2023': 2.5,
  },
  {
    name: 'They/he',
    'Percent in Fall 2022': 0,
    'Percent in Spring 2023': 1.1,
  },
  {
    name: 'Multiple identities',
    'Percent in Fall 2022': 0,
    'Percent in Spring 2023': 0.4,
  },
  {
    name: 'PND',
    'Percent in Fall 2022': 1.1,
    'Percent in Spring 2023': 2.9,
  },
];

const race = [
  {
    name: 'White',
    'Percent in Fall 2022': 43.2,
    'Percent in Spring 2023': 38.9,
    color: '#BA5F7E',
    colorLight: '#DEB6BF',
  },

  {
    name: 'Asian',
    'Percent in Fall 2022': 13.8,
    'Percent in Spring 2023': 14.3,
  },

  {
    name: 'Latine / Hispanic',
    'Percent in Fall 2022': 16.8,
    'Percent in Spring 2023': 12.1,
  },
  {
    name: 'Indigenous',
    'Percent in Fall 2022': 0,
    'Percent in Spring 2023': 1.1,
  },
  {
    name: 'Middle Eastern',
    'Percent in Fall 2022': 1.1,
    'Percent in Spring 2023': 2.5,
  },
  {
    name: 'Black',
    'Percent in Fall 2022': 0.9,
    'Percent in Spring 2023': 13.6,
  },
  {
    name: 'Mixed',
    'Percent in Fall 2022': 9.5,
    'Percent in Spring 2023': 2.1,
  },
  {
    name: 'Unknown',
    'Percent in Fall 2022': 6.3,
    'Percent in Spring 2023': 17.9,
  },
];

const accessData = {
  Age: age,
  'Primary role': primaryRole,
  'Story category': storyCategory,
  'Race and ethnicity': race,
  Pronouns: pronouns,
};

export default accessData;
