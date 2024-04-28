const age = [
  {
    name: '<18',
    PercentFa: 1.1,
    PercentSp: 1.1,
    color: '#fba93d',
    colorLight: '#fedaaa',
  },
  {
    name: '18-25',
    PercentFa: 21.1,
    PercentSp: 18.9,
  },
  {
    name: '25-50',
    PercentFa: 40,
    PercentSp: 51.8,
  },
  {
    name: '50-65',
    PercentFa: 21.1,
    PercentSp: 8.2,

  },
  {
    name: '65+',
    PercentFa: 10.5,
    PercentSp: 18.2,
  },
  {
    name: 'PND',
    PercentFa: 6.3,
    PercentSp: 11.4,
  },
];

const storyCategory = [
  {
    name: 'Campus',
    PercentFa: 47.4,
    PercentSp: 47.4,
    color: '#95C361',
    colorLight: '#D2E2BB',
  },
  {
    name: 'City',
    PercentFa: 27.4,
    PercentSp: 27.4,
  },
  {
    name: 'Arts',
    PercentFa: 1.1,
    PercentSp: 1.1,
  },
  {
    name: 'Sports',
    PercentFa: 1.1,
    PercentSp: 1.1,
  },
  {
    name: 'Blog',
    PercentFa: 1.1,
    PercentSp: 1.1,
  },
  {
    name: 'Multimedia',
    PercentFa: 1.1,
    PercentSp: 1.1,
  },
  {
    name: 'Obituary',
    PercentFa: 3.2,
    PercentSp: 3.2,
  },
  {
    name: 'Weekender',
    PercentFa: 2.1,
    PercentSp: 2.1,
  },
  {
    name: 'Law and justice',
    PercentFa: 1.1,
    PercentSp: 1.1,
  },
];

const primaryRole = [
  {
    name: 'Goverment official',
    PercentFa: 11.6,
    PercentSp: 11.6,
    color: '#489BD1',
    colorLight: '#B5CFEA',
  },
  {
    name: 'Subject matter expert',
    PercentFa: 32.6,
    PercentSp: 32.6,
  },
  {
    name: 'First-person account',
    PercentFa: 11.6,
    PercentSp: 11.6,
  },
  {
    name: 'Activist',
    PercentFa: 13.7,
    PercentSp: 13.7,
  },
  {
    name: 'Campus authority',
    PercentFa: 17.9,
    PercentSp: 17.9,
  },
  {
    name: 'Worker at a Business',
    PercentFa: 3.2,
    PercentSp: 3.2,
  },
];

const pronouns = [
  {
    name: 'She/her',
    PercentFa: 36.8,
    PercentSp: 37.9,
    color: '#61699A',
    colorLight: '#B4B4CE',

  },
  {
    name: 'He/him',
    PercentFa: 55.8,
    PercentSp: 53.6,
  },
  {
    name: 'They/them',
    PercentFa: 5.3,
    PercentSp: 1.8,
  },
  {
    name: 'They/she',
    PercentFa: 1.1,
    PercentSp: 2.5,
  },
  {
    name: 'They/he',
    PercentFa: 0,
    PercentSp: 1.1,
  },
  {
    name: 'Multiple identities',
    PercentFa: 0,
    PercentSp: 0.4,
  },
  {
    name: 'PND',
    PercentFa: 1.1,
    PercentSp: 2.9,
  },
];

const race = [
  {
    name: 'White',
    PercentFa: 43.2,
    PercentSp: 38.9,
    color: '#BA5F7E',
    colorLight: '#DEB6BF',
  },

  {
    name: 'Asian',
    PercentFa: 13.8,
    PercentSp: 14.3,
  },

  {
    name: 'Latine/Hispanic',
    PercentFa: 16.8,
    PercentSp: 12.1,
  },
  {
    name: 'Indigenous',
    PercentFa: 0,
    PercentSp: 1.1,
  },
  {
    name: 'Middle Eastern',
    PercentFa: 1.1,
    PercentSp: 2.5,
  },
  {
    name: 'Black',
    PercentFa: 0.9,
    PercentSp: 13.6,
  },
  {
    name: 'Mixed',
    PercentFa: 9.5,
    PercentSp: 2.1,
  },
  {
    name: 'Unknown',
    PercentFa: 6.3,
    PercentSp: 17.9,
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
