const diffs = {
  yudof: {
    // who: "",
    intro: true, // only for the first one
    article: 'https://en.wikipedia.org/w/index.php?title=Mark_Yudof&diff=prev&oldid=520039488',
    name: 'Mark Yudof',
    time: 'October 26th, 2012',

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

  "bread_dildo": {

  },

  "fuck_estonia": {
    "old": `==Pre-history==
Human settlement in what is now [[Estonia]] became possible when … (in Estonia from the beginning of the 9th millennium to the 5th millennium BC). 
[[Estonian language|Estonian]] is a [[Finno-Ugric languages|Finno-Ugric language]] and … branch of the larger [[Finno-Ugric languages|Finno-Ugric language]] family.`,
    "new": `fuck estonia in the ass 
The fucking nazis
They will burn in fucking hell
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa
3.1415926535...`,
    "name": "History of Estonia",
    "article": "https://en.wikipedia.org/w/index.php?title=History_of_Estonia&diff=prev&oldid=128149041",
    "time": "May 3rd, 2007"
  }
};

export default diffs;
