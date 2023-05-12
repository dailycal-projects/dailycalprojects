const staffDesignations = {
  'Cameron Fozi': 'Senior Staff',
  'Paloma Torres': 'Senior Staff',
  'Annie Lin': 'Senior Staff',
  'Veronica Roseborough': 'Senior Staff',
  'Michelle Li': 'Senior Staff',
  'Shannon Bonet': 'Senior Staff',
  'Nibras Suliman': 'Senior Staff',
  'Isabella Borkovic': 'Senior Staff',
  'Ananya Rupanagunta': 'Senior Staff',
  'Aditya Katewa': 'Senior Staff',
  'Saamya Mungamuru': 'Senior Staff',
  'Jocelyn Huang': 'Senior Staff',
  'Mia Wachtel': 'Senior Staff',
  'Riley Cooke': 'Senior Staff',
  'Jenny Kwon': 'Staff',
  'Sanjana Fernando': 'Staff',
  'Arfa Momin': 'Staff',
  'Stephen Young': 'Staff',
  'Erica Jean': 'Staff',
  'Ekansh Agrawal': 'Senior Staff',
  'Tyler Wu': 'Staff',
};

const StaffDesignations = (bylineNames, author) => {
  if (bylineNames.length !== 1) {
    return ' ';
  }
  const designation = staffDesignations[author];
  if (designation !== undefined) {
    return ` | ${staffDesignations[author]}`;
  }

  return ' | Staff';
};

export default StaffDesignations;
