const diffs = {
  yudof: {
    old: `Also in 2009, Yudof came under criticism for an interview that he gave to Deborah Solomon of the [[New York Times]], [http://www.nytimes.com/2009/09/27/magazine/27fob-q4-t.html Big Man on Campus], in which he joked about taking a pay cut from his salary of over $800,000 to $400,000 in exchange for the White House and Air Force One.  

Despite his opposition to increasing pension benefits to other UC executives, Yudof himself is likely to get the highest-ever pension in UC history, with $350,000 per year for the rest of his life if he stays at UC until 2015.<ref>http://www.ucop.edu/atyourservice/administrators/docs/ucrs-ucrp-plan_2009.pdf - Appendix O, page 337</ref>

=`,

    new: `Also in 2009, Yudof came under criticism for an interview that he gave to Deborah Solomon of the [[New York Times]], [http://www.nytimes.com/2009/09/27/magazine/27fob-q4-t.html Big Man on Campus], in which he joked about taking a pay cut from his salary of over $800,000 to $400,000 in exchange for the White House and Air Force One.  

=`,
  },

  test: {
    old: `const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`,

    new: `const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`,
  },
};

export default diffs;
