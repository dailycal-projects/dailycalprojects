// Put the name of anyone who has ever been senior staff and has a projects byline
const seniorStaff = [
  'Paloma Torres',
  'Annie Lin',
  'Veronica Roseborough',
  'Michelle Li',
  'Shannon Bonet',
  'Nibras Suliman',
  'Isabella Borkovic',
  'Ekansh Agrawal',
  'Lydia Sidhom',
  'Cameron Fozi',
  'Clara Brownstein',
  'Angela Bi',
  'Arfa Momin',
  'Riya Chopra',

];

export const staffTitles = {
  titles: [
    { name: 'Paloma Torres', title: 'the projects editor' },
    { name: 'Arfa Momin', title: 'the deputy projects editor' },
    { name: 'Lydia Sidhom', title: 'the deputy projects editor' },
    { name: 'Cameron Fozi', title: 'a projects developer and the projects training manager. He was the spring, summer and fall 2022 projects editor.' },
    { name: 'Nibras Suliman', title: 'a projects developer. She was a spring 2023 deputy projects editor.' },
    { name: 'Isabella Borkovic', title: 'a projects developer. She was a spring 2023 deputy projects editor.' },
    { name: 'Tyler Wu', title: 'a projects developer' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Rayan Taghizadeh', title: 'a projects developer' },
    { name: 'Mark Verzhbinsky', title: 'a projects developer' },
    { name: 'Lauren Lee', title: 'a projects developer' },
    { name: 'Clara Brownstein', title: 'a projects developer' },
    { name: 'Emile Shah', title: 'a projects developer' },
    { name: 'Anika Sikka', title: 'a projects developer' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Riya Chopra', title: 'a projects developer' },
    { name: 'Claire Roach', title: 'a projects developer' },
  ],
};

export const StaffDesignations = (bylineNames, author) => {
  if (bylineNames.length !== 1) {
    return ' ';
  }
  const seniorstaff = seniorStaff.includes(author);
  if (seniorstaff) {
    return ' | Senior Staff';
  }

  return ' | Staff';
};
