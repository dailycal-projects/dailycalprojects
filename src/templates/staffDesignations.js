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

];

export const staffTitles = {
  titles: [
    { name: 'Paloma Torres', title: 'the projects editor' },
    { name: 'Arfa Momin', title: 'a deputy projects editor' },
    { name: 'Cameron Fozi', title: 'a projects developer and the projects training manager. He was the spring, summer and fall 2022 projects editor' },
    { name: 'Nibras Suliman', title: 'a projects developer and former deputy projects editor' },
    { name: 'Isabella Borkovic', title: 'a projects developer and former deputy projects editor' },
    { name: 'Veronica Roseborough', title: 'a projects developer and former deputy projects editor' },
    { name: 'Erica Jean', title: 'a projects developer' },
    { name: 'Tyler Wu', title: 'a projects developer' },
    { name: 'Lydia Sidhom', title: 'a projects developer' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Rayan Taghizadeh', title: 'a projects developer' },
    { name: 'Anishi Patel', title: 'a projects developer' },
    { name: 'Annie Lin', title: 'a projects developer' },
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
