export default {
  name: '2020 UC Berkeley Budget',
  children: [
    {
      name: 'Campus',
      children: [
        {
          name: 'Liabilities',
          children: [
            {
              name: 'Current Liabilities',
              children: [
                { name: 'Accounts payable', size: 53010 },
                { name: 'Accrued salaries', size: 23554 },
                { name: 'Unearned revenue', size: 253322 },
                { name: 'Commercial paper', size: 326008 },
                { name: 'Current portion of long-term debt', size: 112431 },
                { name: 'Funds held for others', size: 2500 },
                { name: 'Other current liabilities', size: 71036 },
              ],
            },
            {
              name: 'Noncurrent Liabilities',
              children: [
                { name: 'Federal refundable loans', size: 14097 },
                { name: 'Long-term debt', size: 2056729 },
                { name: 'Net pension liability', size: 1545394 },
                { name: 'Pension payable to University', size: 368399 },
                {
                  name: 'Net retiree health benefits liability',
                  size: 1706807,
                },
                { name: 'Other noncurrent liabilities', size: 75007 },
              ],
            },
          ],
        },
        {
          name: 'Operating Revenues',
          children: [
            { name: 'Student tuition and fees, net', size: 1011824 },
            {
              name: 'Grants and contracts, net',
              children: [
                { name: 'Federal', size: 422742 },
                { name: 'State', size: 51661 },
                { name: 'Private', size: 194472 },
                { name: 'Local', size: 8536 },
              ],
            },
            { name: 'Educational activities, net', size: 76553 },
            { name: 'Auxiliary enterprises, net', size: 186815 },
            { name: 'Other operating revenues, net', size: 117072 },
          ],
        },
        {
          name: 'Operating Expenses',
          children: [
            { name: 'Salaries and wages', size: 1388250 },
            { name: 'Pension benefits', size: 375669 },
            { name: 'Retiree health benefits', size: 61488 },
            { name: 'Other employee benefits', size: 333931 },
            { name: 'Supplies and materials', size: 151269 },
            { name: 'Depreciation and amortization', size: 235160 },
            { name: 'Scholarships and fellowships', size: 185427 },
            { name: 'Utilities', size: 36364 },
            { name: 'Other operating expenses', size: 461923 },
          ],
        },
      ],
    },
    {
      name: 'Foundation',
      children: [
        {
          name: 'Liabilities',
          children: [
            {
              name: 'Current Liabilities',
              children: [
                { name: 'Accounts payable', size: 1201 },
                { name: 'Funds held for others', size: 2017 },
                { name: 'Other current liabilities', size: 7513 },
              ],
            },
            {
              name: 'Noncurrent Liabilities',
              children: [{ name: 'Other noncurrent liabilities', size: 74678 }],
            },
          ],
        },
        {
          name: 'Operating Revenues',
          children: [
            { name: 'Campus foundation private gifts', size: 205406 },
            { name: 'Other operating revenues, net', size: 71 },
          ],
        },
        {
          name: 'Operating Expenses',
          children: [
            { name: 'Campus foundation grants', size: 247667 },
            { name: 'Other operating expenses', size: 9519 },
          ],
        },
      ],
    },
  ],
};
