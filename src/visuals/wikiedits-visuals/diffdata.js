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

  bread_dildo: {

  },

  fuck_estonia: {
    old: `==Pre-history==
Human settlement in what is now [[Estonia]] became possible when … (in Estonia from the beginning of the 9th millennium to the 5th millennium BC). 
[[Estonian language|Estonian]] is a [[Finno-Ugric languages|Finno-Ugric language]] and … branch of the larger [[Finno-Ugric languages|Finno-Ugric language]] family.`,
    new: `fuck estonia in the ass 
The fucking nazis
They will burn in fucking hell
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa
3.1415926535...`,
    name: 'History of Estonia',
    article: 'https://en.wikipedia.org/w/index.php?title=History_of_Estonia&diff=prev&oldid=128149041',
    time: 'May 3rd, 2007',
  },

  yudof_palpatine: {
    // intro: true, // only for the first one
    refs_hidden: true,
    "old": `On 26 August, 2009 employment unions of the UC called a vote of [[no confidence]] in President Yudof. If the vote passes, it would have no tangible effect, but would serve as a recommendation that Yudof be fired from his position.

==References==`,
    "new": `On 26 August, 2009 employment unions of the UC called a vote of [[no confidence]] in President Yudof. If the vote passes, it would have no tangible effect, but would serve as a recommendation that Yudof be fired from his position.

In addition, it would appear that Mark Yudof is the son of the Devil and Emperor Palpatine. 

==References==`,
    "name": "Mark Yudof",
    "article": "https://en.wikipedia.org/w/index.php?title=Mark_Yudof&diff=prev&oldid=316075494",
    "time": "September 24th, 2009"
},

yudof_ode: {
  raw: true,
 "new": `Ode to Mark yudof<br />
<br />
Who desecrates the sacrament of Knowledge!<br />
Who seeks to rape the Academy!<br />
Who lusts after shiny rocks and paper!<br />
You have transgressed<br />
With temporal schemes<br />
That endanger us all<br />
<br />
The University is in peril<br />
You tear it to the foundation<br />
And erect an Education Factory<br />
What is it's its product?<br />
<br />
Meek minds<br />
Children of Industry<br />
Lost and loveless in logic<br />
Paying any fee<br />
Tithing to your vanity<br />
Worshiping your arrogance<br />
<br />
The foundation will not hold<br />
Know this! Any house you build<br />
Will transform into labyrinth<br />
And swallow you whole!<br />
<br />
Because you censor Criticism:<br />
You have transgressed<br />
You have transgressed the Hacker's Ethic<br />
<br />
Information wants to be free<br />
Never forget this<br />
<br />
Hence forth you loose this privilege<br />
I smash your digital fortress<br />
I erase your epitaph<br />
I piss on your fresco<br />
I shit on the idea of your head<br />
Breaking asunder this false construct<br />
Here there shall be no knowledge!<br />
<br />
Listen, oh listen<br />
Listen to the trees<br />
Listen to the people<br />
We hate the fees!<br />
<br />
Remember Yudof, dear seeker,<br />
Embrace Compassion<br />
Shun Hubris<br />
You too shall pass<br />
To nothing.<br />
<br />
- /|nt|\/1ru$ -`,
  "name": "Mark_Yudof",
  "article": "https://en.wikipedia.org/w/index.php?title=Mark_Yudof&diff=next&oldid=316707479",
  "time": "September 28th, 2009"
}


};

export default diffs;
