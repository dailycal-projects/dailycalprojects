


//   {name}            value the application fills in.
//   <num>…</num>      large accent number
//   <word>…</word>    a highlighted word in a box
//   <b>…</b>          bold
//  <em>…</em>         highlighted
//   { one, other }    singular / plural: "one" is used when the count {n} is exactly 1


export const strings = {
 // ---- the page itself (browser tab title and link previews) -------------------------------------
 site: {
   title: "Paying too much for rent? See how it stacks up against Berkeley",
   description:
     "Look up your Berkeley apartment and see how your rent compares to people in your building, your neighborhood and tenants in the city like you.",
 },


 // ---- links ---------------------------------------------------------------------------------------
 links: {
   story: "", // what the share button shares
   reportError: "https://forms.gle/C3t4pejTR2vZRiYU8", // the "report an error" link under the finder
 },


 // ---- small words used all over -------------------------------------------------------------------
 words: { more: "more", less: "less", same: "same" },
 you: "you", // the red "you" marker on charts and maps
 none: "—", // shown where there is no number


 bedrooms: {
   studio: "studio",
   studios: "studios",
   bed: "{n} bed",
   beds: "{n} beds",
   fourPlus: "4+ bed",
   fourPlusPlural: "4+ beds",
spelled: ["studio", "one bed", "two bed", "three bed", "four bed", "five bed", "six bed", "seven bed", "eight bed", "nine bed", "ten bed"],


 },


 tenure: {
   unknown: "move-in date unknown",
   orMore: "moved in {years}+ years ago", // placeholder for a 1980 move-in or earlier
   new: "moved in less than a year ago",
   years: "moved in {years} years ago",
 },
 years: { one: "{n} year", other: "{n} years" },


 unit: {
   noNumber: "no unit #",
   title: "unit {label}",
 },


 building: {
   sizeOne: "1 unit",
   sizeRange: "{lo}–{hi} units",
   sizeOpen: "{lo}+ units",
   // one per band in scripts/paths.py ERA_EDGES
   eras: [
     "built before 1920",
     "built 1920–1939",
     "built 1940–1959",
     "built 1960–1979",
     "built 1980–1999",
     "built 2000–2014",
     "built 2015 or later",
   ],
   rentControlled: "rent-controlled (built before 1980)",
   notRentControlled: "not rent-controlled",
 },


 // ---- the banner at the top ----------------------------------------------------------------------- // CHANGED: the fake article is gone
 banner: {
   masthead: "The Daily Californian",
   home: "https://data.dailycal.org/", // NEW: where the wordmark links
 },


 // ---- the address form ----------------------------------------------------------------------------
 finder: {
   headline: "how does your rent stack up?",
   byline: "By John Schultz", // NEW
   loading: "loading the rent registry…",
   broke: "something broke: {error}",
   addressLabel: "enter your berkeley address:",
   addressPlaceholder: "2020 channing way",
   notFound: "we couldn't find that one. enter the number and street.",
   unitLabel: "and unit:",
   unitPick: "pick your unit",
   duplicateUnit: "{name} ({n})", // two units with the same name in one building
   missingFlagged:
     "the registry lists {rent} a month for this unit, which looks like a typo. fill in yours:",
   missingRent: "the registry doesn't list a rent for this unit. fill in yours:",
   missingMoveIn: "the registry doesn't say when you moved in:",
   rentPlaceholder: "monthly rent, e.g. 2400",
   bedroomsPlaceholder: "bedrooms",
   yearPlaceholder: "year you moved in (optional)",
   pickerCancel: "cancel", // closes the full-screen picker on phones
   addressPickerAria: "choose your address",
   addressPickerHint: "start typing your street number and name",
   unitPickerAria: "choose your unit",
   unitPickerPlaceholder: "unit number",
   unitPickerNone: "no unit matches that.",
   go: "see how your rent compares",
   mapLink: "or explore rent on a map",
   reportError: "report an error",
 },


 // ---- the story -----------------------------------------------------------------------------------
 story: {
   next: "tap to keep going →",
   backToStart: "back to the start",
   previous: "previous",
   nextButton: "next",
 },


 screens: {
   // 3. your building
   building: {
     only: "you're the only <word>{kind}</word> in your building with a rent on file.",
     onlySub: "so there's no one here to compare you to.",
     same: "you pay <num>{rent}</num>, the same as every other {kind} in your building.",
     verdict:
       "your unit costs <num>{rent}</num>, which is <word>{word}</word> than <num>{compare_room_num}</num>/{room_count} {kind} units in your building.",
     highest: "highest {kind}", // e.g. "highest 2 beds"
     lowest: "lowest {kind}",
     rankTenure: "– {tenure}",
     notMine: "not what you pay?",
     notMineAria: "your monthly rent",
     notMineGo: "use this rent",
     notMineBeds: "not your {n} bedrooms?", // NEW: {n} is their bedroom count now
     notMineBedsPlaceholder: "bedrooms (0 for a studio)", // NEW
     notMineBedsAria: "your bedrooms", // NEW
     notMineBedsGo: "use these bedrooms", // NEW
   },


   // 4. the cheapest unit
   cheapest: {
     nobody: "nobody else in your building has a {kind} with a rent on file.",
     least: "you pay <word>the least</word> of any {kind} in your building.",
     more: "you pay <num>{amount}</num> more than the cheapest {kind} in your building.",
     seeAll: "see all units ↓",
   },


   // 1. your neighborhood
   hood: {
     eyebrow: "within a quarter mile · {kind}",
     verdict: "in your neighborhood, you pay <word>{word}</word> than <num>{pct}%</num> of residents.",
     avgRent: "average rent",
     vsCity: "than berkeley",
     vsBuilding: "than your building's average",
     statValue: "{pct}% {word}",
     none: "no other {kind} near you have a rent on file.",
     hint: "",
   },


   // 2. buildings like yours
   match: {
     eyebrow: "buildings like yours",
     lede: "we matched <num>{buildings}</num> buildings that are the same age and size as yours. then, we selected tenants {who}",
     ledeDistrict:
       "we matched <num>{buildings}</num> buildings in {district} that are the same age and size as yours. then, we selected tenants {who}",
     whoMovedIn: "who moved in when you did.",
     whoUnknownMoveIn: "with the same bedrooms.",
     fallback:
       "there weren't enough buildings like yours in {district}, so we looked across all of berkeley.",
     allOfBerkeley: "all of berkeley",
     movedIn: "moved in {from}–{to}",
     tenants: "{n} tenants",
     verdict: "you pay <word>{word}</word> than <num>{pct}%</num> of them.",
     none: "there are no units like yours in your neighborhood.",
     hint: "",
     hintDistrict: "",
   },


   // 5. the rent-o-meter
   meterIntro:
     "we developed the daily cal <word>rent-o-meter</word>, which calculates your apartment's expected rent given its location and age.",
   meter: {
     eyebrow: "",
     range: "our model estimated your rent to be between <num>{lo}</num> and <num>{hi}</num>.",
     outside: "you pay <b>{amount}</b> {word} than expected.",
     chartLabel: "expected rent range",
     accurateQuestion: "is this accurate?",
     accurateAnswer: [
       "the rent-o-meter's estimate is based on your building's size, approximate age, owner, location, and number of units, plus what rental listings show about apartments in your building with your number of bedrooms: their typical size and amenities, like an garage. it doesn't know your own apartment's size or condition, or whether it has a balcony or a good view.",
       "however, your apartment isn't the only one with amenities. this should be taken as your rent compared to an average berkeley apartment.",
       "about half of berkeley residents pay what the rent-o-meter expects",
     ],
   },


   // 6. your landlord
   owner: {
     unknown: "the rent registry doesn't list who owns your apartment.",
     owns: "<word>{name}</word> owns your apartment.",
     premiumNone: "their apartments rent about where the rent-o-meter would expect.",
     premiumMore:
       "their apartments are <b>{amount}</b> a month more expensive than the rent-o-meter would expect.",
     premiumLess: "their apartments are <b>{amount}</b> a month cheaper than the rent-o-meter would expect.",
     onlyOne: "yours is the only apartment they own in berkeley.",
     ownsMany: "they own <b>{n}</b> apartments in berkeley.",
     seeMap: "see their buildings on the map →",
   },


   // 7. share
   share: {
     headline: "share this with your friends!",
     shareTitle: "how does your rent stack up?",
     shareText: "see how your rent compares to the rest of berkeley",
     button: "share",
     copied: "link copied",
     mapButton: "see rent on a map",
     records: "this data was obtained through a public records request.",
     methodSummary: "how it works",
     method: [ // CHANGED: no blank entries (they made double spaces), "age,," and "model to fit to" fixed, period after "can charge"
       "berkeley keeps a registry of rents paid, which we obtained through a public records request. the data is from october 13, 2026.",
       "for rent-controlled units, the registry doesn’t keep a current amount. instead, we use the maximum rent a landlord can charge.",
       "the rent-o-meter is a statistical model fit to every rented unit. it predicts rent from bedrooms, council district, distance to campus, building size and age, the owner, and move-in year, then asks what your apartment would rent for to someone who moved in when you did.",
       "building age is the year built from alameda county assessor records (via attom data, licensed through dewey data), grouped into 20-year periods; where it's missing, we use rent-controlled status which tells us if a building was constructed before 1980.",
       "listing details come from renthub rental listings for berkeley, 2014 to 2026, also licensed through dewey data; we use what the listings say about the apartments, not their asking rents."
     ].join(" "),
   },
 },


 // ---- lists of units (in the story and on the map) ------------------------------------------------
 unitList: {
   rowNamed: "unit {name}, {beds}",
   rowUnnamed: "{name}, {beds}",
   empty: "no units here",
 },
 panel: {
   units: "{n} units",
   rentsAt: "rents at {address}",
   close: "close",
 },


 // ---- the maps in the story -----------------------------------------------------------------------


 storyMaps: {
   parcelAria: "map of parcels near you",
   parcelLoading: "drawing your blocks…",
   parcelTag: "{n} units",
   cityAria: "map of matched buildings across berkeley",
   cityAriaDistrict: "map of matched buildings in {district}",
   cityLoading: "drawing berkeley…",
 },
 chart: {
   spreadLabel: "spread of rents, with yours marked in red",
 },


 // ---- the "every rent in berkeley" map ------------------------------------------------------------
 map: {
   title: "every rent in berkeley",
   back: "back",
   countAll: "{n} buildings with rents on file",
   countFiltered: "{shown} of {total} buildings match",
   filters: "filters",
   canvasAria: "map of berkeley, blocks and rental buildings colored by rent",
   zoomIn: "zoom in",
   zoomOut: "zoom out",
   showAll: "show all of berkeley",


   // what the colors compare each rent to: the berkeley median for its bedrooms, or the rent-o-meter
   basis: {
     label: "compare rents to",
     typical: "average rent",
     meter: "rent-o-meter",
   },
   // the words that change with the comparison. {count}: "12 units" or "3 rental buildings"
   vs: {
     typical: {
       legendBlocks: "each block's rents vs. average berkeley rent, for units with the same number of bedrooms",
       legendBuildings: "rents vs. average berkeley rent, for units with the same number of bedrooms",
       legendMid: "average",
       tipNear: "{count} · about average",
       tipRelative: "{count} · {pct}% {word} than average",
       verdictNear: "rents here are about average for berkeley, bedroom for bedroom.",
       verdictRelative: "rents here are <b>{pct}% {word}</b> than average for berkeley, bedroom for bedroom.",
       barNear: "rents about average",
       barRelative: "rents {pct}% {word} than average",
     },
     meter: {
       legendBlocks: "each block's rents vs. the rent-o-meter's estimate",
       legendBuildings: "rents vs. the rent-o-meter's estimate",
       legendMid: "as expected",
       tipNear: "{count} · about what the rent-o-meter expects",
       tipRelative: "{count} · {pct}% {word} than the rent-o-meter expects",
       verdictNear: "rents here are about what the rent-o-meter expects for a new tenant.",
       verdictRelative: "rents here are <b>{pct}% {word}</b> than the rent-o-meter expects for a new tenant.",
       barNear: "rents about what the rent-o-meter expects",
       barRelative: "rents {pct}% {word} than the rent-o-meter expects",
     },
   },


   legend: {
     aria: "color key",
     // the seven colors, blue (cheaper) to red (pricier)
     steps: ["30%+ less", "15–30% less", "5–15% less", "average", "5–15% more", "15–30% more", "30%+ more"],
     endLess: "30%+ less",
     endMore: "30%+ more",
     noRent: "rental, no rent on file",
     notRentalBlocks: "no rentals",
     notRentalBuildings: "not a rental",
     hint: "tap a block or zoom in to see buildings",
   },


   // "12% more than typical" and friends
   typical: "about typical",
   relative: "{pct}% {word}",


   tip: {
     block: "this block",
     blockBuildings: { one: "{n} rental building", other: "{n} rental buildings" },
     units: { one: "{n} unit", other: "{n} units" },
     avg: "avg {rent}",
     avgAcross: { one: "avg {rent} across {n} unit", other: "avg {rent} across {n} units" },
     zoomIn: "click to zoom in",
   },


   filter: {
     title: "filter buildings",
     aria: "filters",
     reset: "reset",
     close: "close filters",
     any: "any",
     range: "{lo} – {hi}",
     atLeast: "{label}, at least",
     atMost: "{label}, at most",
     units: "",
     unitsTop: "",
     avgRent: "average rent",
     avgRentTop: "$6,000+",
     note: "colors compare each unit's rent to the berkeley median for its bedroom count, aggregated by building and block.", // CHANGED: every owner is named now
   },


   landlord: {
     label: "landlord",
     buildings: "{n} buildings",
     search: "search {n} landlords",
     noMatch: "no landlord matches", // CHANGED: was "no landlord with 3+ parcels matches"
     clear: "clear landlord",
     barCounts: "{buildings} buildings · {units} units",
     barPremiumNone: "rents about what the rent-o-meter expects",
     barPremiumMore: "{amount}/mo more than the rent-o-meter expects",
     barPremiumLess: "{amount}/mo less than the rent-o-meter expects",
   },


   // "similar buildings": the same size and age as one you picked on the map // NEW
   like: {
     label: "similar buildings",
     show: "show similar buildings →",
     hint: "pick a building on the map, then tap \"show similar buildings\".",
     bar: "buildings like {address}",
     barCounts: "{n} with rents on file · {size} · {era}",
     clear: "clear similar buildings",
   },


   building: {
     kicker: { one: "{n} unit · {control}", other: "{n} units · {control}" },
     rentControlled: "rent-controlled",
     notRentControlled: "not rent-controlled",
     verdictNone: "no rents on file for this building.",
     ownedBy: "owned by <b>{name}</b>",
     seeTheirs: "see their {n} buildings →",
     notNamed: "owner not on file", // CHANGED: was two versions run together; shows as plain text, only for the 37 buildings with no owner
   },
 },


 // ---- errors --------------------------------------------------------------------------------------
 errors: {
   data: "could not load data ({status})",
 },


 // ---- the #debug page: every story screen for 8 random apartments --------------------------------- // NEW
 debug: {
   title: "debug: every screen",
   refresh: "new apartments",
   back: "back to the app",
 },
};
