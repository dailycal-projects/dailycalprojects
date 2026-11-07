/* Every string the app puts on screen, in one place.

   Edit the text here; the components read it through `t()` and `<T>` in
   ./i18n.js. Nothing else in the app should contain display copy, so a copy
   pass or a translation is a pass over this file alone.

   Two conventions inside a string:

     <0>...</0>  inline markup -- a link, a bold run, a coloured term. The
                 number picks the component the caller passed in `c`, so the
                 sentence stays whole and the markup can move with the words.
     {name}      a value the caller passes in `vars`.

   Both are documented per-string below where they appear. Keys are grouped by
   where they show up, and within a group they run in reading order rather
   than alphabetically, so a key's neighbours are what the reader sees next.

   `npm run check:strings` verifies that every key here is referenced and that
   no component still holds a hard-coded string. */

export const strings = {
  /* ------------------------------------------------------------------ */
  /* Story: the scrollytelling article at /story                         */
  /* ------------------------------------------------------------------ */
  // The story's own text (the lede, each passage over the maps and the
  // headings between them) is written in the article's .mdx instead, so the
  // site's search can index it; see components/story/steps.js.
  story: {
    title: "See how AC Transit ridership recovered from the pandemic",
    // <0> links to the author's Daily Californian profile.
    byline: "By <0>John Schultz</0>",
    // {message} is the underlying fetch error.
    error: "The ridership data could not be loaded: {message}",

    seeData: "See the data →",
    seeMethodology: "See our methodology →",
    // Beside "See the data" at the foot of the story.
    seeMethodologyEnd: "See the methodology →",
    // Data credit at the foot of the story, which Transitland's terms require.
    // <0> links to those terms.
    transitland: "<0>Transitland</0> was used to obtain historical GTFS bus schedules",
  },

  /* ------------------------------------------------------------------ */
  /* Shared: units, states and errors used across views                  */
  /* ------------------------------------------------------------------ */
  units: {
    // {n} is already rounded/formatted by the caller.
    minutes: "{n} min",
    hours: "{n} h",
    mph: "{n} mph",
    noService: "no service",
    // Bare unit words, used where the legend composes its own label.
    minutesShort: "min",
    mphShort: "mph",
    noValue: "-",
  },

  errors: {
    // {name} is the pack file, {status} the HTTP status.
    loadFailed: "Could not load {name} ({status})",
  },

  /* ------------------------------------------------------------------ */
  /* Speed-vs-ridership scatter (explorer side panel)                    */
  /* ------------------------------------------------------------------ */
  speedChart: {
    loading: "Loading bus speeds\u2026",
    empty: "No bus speed data in this area.",
    axisSpeed: "Average bus speed, mph",
    axisRiders: "Riders per week",
    // <0> wraps the figure. {mph} / {riders} are preformatted.
    tooltipSpeed: "<0>{mph} mph</0> average bus speed",
    tooltipRiders: "<0>{riders}</0> riders a week",
  },

  /* ------------------------------------------------------------------ */
  /* Dates and number formats                                            */
  /* ------------------------------------------------------------------ */
  dates: {
    // Indexed by month - 1. Kept short because they label chart axes.
    monthsShort: ["Jan.", "Feb.", "March", "April", "May", "June",
      "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."],
    monthsFull: ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"],
    monthYear: "{month} {year}",
    // A full date, e.g. "Feb. 3, 2020".
    monthDayYear: "{month} {day}, {year}",
  },

  numbers: {
    // A percentage. {n} is already rounded by the caller.
    percentFlat: "{n}%",
    // Placeholder where a figure does not exist.
    missing: "\u2013",
  },

  /* ------------------------------------------------------------------ */
  /* Story map: the sticky map's legend, callouts and tooltips           */
  /* ------------------------------------------------------------------ */
  storyMap: {
    loading: "Loading ridership data…",

    // {month} is a full month name, e.g. "February".
    // Commute view
    // {month} is a full month name, e.g. "February".
    commuteTitle: "{month} {year}",
    commuteRampLow: "Fewer",
    commuteRampHigh: "More estimated riders",
    commuteMember: "Stops near UC Berkeley",

    // Recovery view
    recoveryTitle: "First month back to {pct}%",
    recoveryNever: "Not yet",
    recoverySmall: "No prepandemic service",

    weekOf: "Week of",

    // Speed view. <0> wraps each figure.
    speedNote: "Median Berkeley bus speeds: <0>{mph} mph</0>",
    speedRidership: " · Total Ridership: <0>{pct}%</0> of prepandemic",
    speedRamp: ["6 mph", "12 mph", "20 mph"],

    // Ridership view
    seriesSystem: "Systemwide",
    seriesBerkeley: "Berkeley",
    // <0> wraps the percentage.
    ridershipNote: "Ridership in {scope}: <0>{pct}</0> of prepandemic",
    ridershipRamp: ["0%", "100%", "200%"],

    dotScaleUnit: "riders/week",

    // Map callouts and hover tooltips.
    calloutPrePandemic: "{pct}% of prepandemic riders",
    calloutOfBaseline: "{pct}% of prepandemic",
    // A ringed tract's AC Transit commuters over all its commuters. {pct} is
    // already formatted, e.g. "5.2" or "0.43".
    calloutOfTraffic: "{pct}% of all traffic",
    tipCommuteMember: "Stop near UC Berkeley",
    tipInferredRiders: "{n} estimated riders/weekday",
    tipRidersThisWeek: "{n} riders this week",
    tipNoBaseline: "No prepandemic service",
    tipBlockGroup: "Block group {id}",
    tipRecoveredIn: "Reached prepandemic in {month}",
    tipNotYet: "Hasn't reached prepandemic",
    tipTooLittle: "No prepandemic service",
  },

  /* ------------------------------------------------------------------ */
  /* Methodology page (/methodology)                                     */
  /* ------------------------------------------------------------------ */
  /* Sentences here carry two kinds of placeholder. <0>, <1>... are the
     coloured terms (<C>) and the inline formulae (<M>) -- the formula's LaTeX
     stays in the component, because it is code, not copy. {n}-style values are
     figures resolved from the pipeline artifacts. */
  methodology: {
    title: "Methodology",
    linkExplore: "Explore the map",
    linkStory: "Read the story",
    linkExploreArrow: "Explore the map →",

    intro1:
      "At the core of this visualization is drop-offs and boardings per stop. This is collected by "
      + "physical sensors, known as APCs, on buses. However, this information isn’t reported "
      + "all time in the per-stop dataset. Importantly, the data loss is present in entire bus "
      + "trips, not just at specific stops.",
    // <0> is the publication name, set in italics.
    intro2:
      "To address this, <0>The Daily Californian</0> used an existing public records request that "
      + "collected ridership per route for each month. This ridership is derived from AC "
      + "Transit’s own estimation methods and is reported by the agency itself.",
    intro3:
      "The gap between the aforementioned dataset and the APC dataset is significant. Twenty-seven "
      + "percent of boardings do not exist in the APC dataset. Most of the missing data is before the "
      + "pandemic.",

    // The scrollytelling passages, in order.
    step: {
      intro:
        "This is an example of a bus route. Buses pick up and drop off people from each station. Some "
        + "bus trips don’t report sensor information. We can find trips that aren’t observed through "
        + "schedules published by AC Transit, known as General Transit Feed Specification, or GTFS, "
        + "feeds. These public schedules are how applications such as Google Maps calculate bus "
        + "arrival times.",
      // <0> is the coloured term "blue bars".
      observed:
        "The <0>blue bars</0> represent observed data from the trip-level public records request. "
        + "However, this is not a complete picture of ridership.",
      // <0> coloured term, <1> the coverage formula, <2> the N_present term.
      coverage:
        "First, we get a <0>coverage factor</0> of the line <1/>, where <2/> is the number of "
        + "trips for which we have data. This is the percentage of trips "
        + "that are covered by the route. This assumes that missing trips are similar to other "
        + "trips.",
      // <0> is the formula.
      coverageApplied:
        "Each stop’s ridership is divided by <0/>, leading to increased ridership. This keeps "
        + "the distribution of the line.",
      // <0> coloured term, <1> <2> formulae.
      calibration:
        "As a <0>calibration factor</0>, we use the existing public records request, which has an "
        + "accurate count for total ridership <1/> over the entire route. We collect <2/>, the "
        + "factor by which ridership differs from AC Transit’s published ridership. We then "
        + "multiply every stop by this factor.",
      sparse:
        "Some routes have significant data loss, like the routes introduced in 2025 under the "
        + "Realign program. For this profound data loss, we find other routes that cover the same "
        + "stops. As an example, the 27 and the 51B lines cover the same stops near UC Berkeley.",
      donors:
        "Using the existing public records request and the GTFS schedule for the number of trips "
        + "and the total ridership, the distribution of ridership over the stop is estimated.",
      weeks:
        "Our data is presented by week, not by month. Some weeks in a month may have 10 times the "
        + "sensors reporting with the same service. Because there is no calibration available, we "
        + "must use our public schedules.",
      // <0> is the formula for w.
      weightIntro: "We collect a percentage <0/> of trips that do not meet requirements for inclusion.",
      exclude1: "Under 40% of trips reported",
      exclude2: "Under 70% of average reported trips for that route",
      exclude3: "Under 70% of days have a single trip",
      // <0> is the coloured term.
      weightApplied:
        "Rides in this category are weighted out and replaced with a distribution based on the "
        + "level of service in the <0>published schedules</0>.",
      // <0> <1> <2> are all the formula for w.
      mix:
        "<0/> is the % imputed figure shown on the website. Ridership derived from <1/> is still "
        + "from monthly data, and <2/> is derived from the quality of the monthly data.",
      blend: "This is what is shown on the website.",
    },

    // Legend under the sticky figure.
    legendObserved: "observed",
    legendCoverage: "coverage factor",
    legendCalibration: "calibration",
    legendDonor: "estimated from other routes",
    legendSchedule: "from the schedule",

    closeTurn: "Most routes are unaffected by this imputation and are only calibrated.",
    colCase: "Case",
    colRouteMonths: "Ridership in route each month (e.g. Route 51B, January 2020)",
    colPercent: "%",
    case0: "No data estimated (w=0)",
    case1: "Some data estimated (w>0)",
    case2: "All data estimated (w=1)",
    case3: "No sensors at all",

    // {t} is a tick on the w axis, 0 to 1.
    histogramTick: "{t}",
    histogramAxisX: "w (share of ridership estimated)",
    histogramAxisY: "Route-months",
    histogramCaption: "The gold section of the bar refers to months in 2019",
  },

  /* ------------------------------------------------------------------ */
  /* Methodology figures (the sticky diagram and the standalone panels)  */
  /* ------------------------------------------------------------------ */
  /* `tex*` keys are LaTeX. They are here because the reader reads them as
     sentences, so a copy pass should reach them -- but the markup around the
     words is real LaTeX and has to survive an edit. Change only the prose
     inside \text{...}; pure formulae live in the component, not here. */
  figure: {
    braceReported: "reported",
    braceMissing: "missing",
    routeA: "Route A",
    routeB: "Route B",
    theMonth: "the month",
    // {n} is a week number; {pct} a percentage.
    weekN: "week {n}",
    pctOfMonth: "{pct}% of the month",
    pctOfWeek: "{pct}% of the week",
    // A week's share of the month before and after the blend, under the heading.
    pctShift: "{from}% → {to}%",
    pctOfMonthHeading: "% of month",
  },

  /* ------------------------------------------------------------------ */
  /* Explorer: the main map at /                                         */
  /* ------------------------------------------------------------------ */
  explorer: {
    title: "AC Transit Ridership",

    // Stat rows in the detail sidebar.
    rowBoardings: "Boardings",
    rowDropOffs: "Drop-offs",
    rowRidership: "Ridership",
    rowImputed: "Estimated",
    rowVsBaseline: "Versus prepandemic",
    rowAcShare: "AC Transit commuters as share of all commuters",
    rowAllRiders: "All riders per weekday",
    rowRecovered: "Recovered",
    rowOnboardLoad: "Onboard load per week",
    // {week} is the week's start date.
    rowBoardingsWeekOf: "Boardings per week, week of {week}",
    rowShareOfStreet: "Share of street boardings",
    rowSectionsPerRider: "Sections per rider",

    // {label} is the commute snapshot, e.g. "Feb 2024".
    commutersHeading: "Commuters · {label}",
    headingWeekly: "Weekly ridership 2019-26",
    headingRecovery: "Recovery to prepandemic",
    // {pct} is a threshold like 50.
    recoveryThreshold: "{pct}% of prepandemic",
    recoveryTooSmall: "no prepandemic service",
    recoveryNotYet: "not yet",
    headingRoutes: "Routes",
    noRouteGeometry: "No routes are mapped here this week.",
    // {n} stops in the clicked group.
    headingStopsOne: "{n} stop in group",
    headingStopsMany: "{n} stops in group",

    // Route detail
    modeOwn: "This route",
    modeStreet: "Streets it uses",
    headingRouteWeeklyOwn: "Weekly boardings on this route, 2019-26",
    headingRouteWeeklyStreet: "Total weekly boardings on a street for all lines, 2019-26",
    // <0> is a bold run.
    scheduleWarning:
      "0% of this line's buses reported, so these figures are reconstructed from known ridership " +
      "numbers.",

    // Level-of-service table
    headingService: "Level of service · {label}",
    colHeadway: "Headway",
    colTrips: "Trips",
    colSpeed: "Speed",

    // {id} is the route name.
    routeTitle: "Route {id}",
    closeMark: "X",

    // About modal
    aboutTitle: "About this data",
    // <0> is the bold total, <1> the gold estimated part.
    about3: "Numbers on the map show the total, then the estimated part in gold: <0>1,200</0> <1>(300)</1> means 1,200 riders, 300 of them estimated.",
    aboutStory: "Read the story →",
    aboutMethodology: "Methodology →",
    aboutExplore: "Explore the map",
    // The same Transitland credit as the story's. <0> links to its terms.
    aboutTransitland: "<0>Transitland</0> was used to obtain historical GTFS bus schedules",

    // View picker
    headingView: "View",
    viewTotal: "Total ridership",
    viewRel: "Relative to prepandemic",
    viewRecovery: "Recovery time",
    viewCommute: "Commute pattern",
    viewSpeed: "Speed per corridor",
    viewLos: "Level of service",
    viewImp: "Percent estimated",

    reachedLabel: "Reached",
    ofBaseline: "of prepandemic",

    focusTo: "Estimated arrivals",
    focusFrom: "Estimated departures",
    hintFocusLoading: "Loading estimated flows...",

    // Level picker
    headingLevel: "Level",
    levelGroup: "Stop groups",
    levelBgroup: "Block groups",
    levelTract: "Census tracts",
    levelCity: "Cities",
    levelNone: "Corridors",

    headingLegend: "Legend",
    headingSelection: "Selection",
    clearSelection: "Clear selection",

    ctxRoutes: "Routes on this corridor",
    ctxInferredTo: "Arrivals",
    ctxInferredFrom: "Departures",
    ctxWeeklyChart: "Weekly chart",

    searchPlaceholder: "Find a route...",
    searchNotRunning: "not running this week",
    tabSpeed: "Riders and bus speed",
    tabRiders: "Observed vs. estimated",
    // Tabs in a place's detail panel.
    tabOverTime: "Ridership over time",
    tabWeekdayPattern: "Weekday pattern",

    playLabel: "Play",
    pauseLabel: "Pause",
    playMark: ">",
    pauseMark: "||",
    weekOf: "Week of {week}",
    systemRidership: "System ridership",
    loadingApp: "Loading ridership data...",
    loadingView: "Loading data for this view...",
    errorTitle: "Unable to load the visualization",

    // Corridor hover
    rowBoardingsWk: "Boardings per week",
    rowDropOffsWk: "Drop-offs per week",
    rowNetAtGroup: "Net at this stop group",
    tipNoPeak: "no peak",
    tipLine: "Line",
    amArrive: "arrive",
    amDepart: "depart",
    // {sign} is "+" or empty, {pct} the value, {dir} one of the two words above.
    balanceValue: "{sign}{pct}% {dir}",
    peakRatio: "{n}×",

    // Selection chart / speed tab
    selectionCount: "{n} stop group{s} selected",
    exportPng: "Export PNG",
    speedStatLabel: "Average bus speed, 2019–2026:",
    speedNoData: "no bus data here",
    speedLoading: "loading…",

    // Map hover tooltips
    tipMedianIncome: "Median income",
    tipMedianIncomeBg: "Median income (block group)",
    tipNotPublished: "not published",
    tipIncomeTopCoded: "$250,000+",
    tipStopsOne: "{n} stop",
    tipStopsMany: "{n} stops",
    // {year} is the LODES vintage.
    tipLodesLabel: "{label} ({year})",
    tipLinesMore: "+{n} more",
    tipLines: "{n} lines",

    // Weekday profile panel
    headingWeekdayProfile: "Weekday profile · {label}",
    rowRidersWeekday: "Riders per weekday",
    rowAmBalance: "AM balance",
    rowPmBalance: "PM balance",
    rowPeakStrength: "Peak strength",

    // Legend
    loadingLevel: "Loading this level...",
    // {lo}/{hi} are dollar amounts already formatted.
    legendIncomeLow: "${lo}k",
    legendIncomeHigh: "${hi}k+",
    legendNoFlow: "no estimated trips",
    // {n} riders per weekday.
    legendRidersWkday: "{n} riders per weekday",
    legendOrLess: "{pct} or less",
    legendPlus: "{pct}+",
    legendPerWeek: "{n}+ / week",
    legendImputedHigh: "100% estimated",
    legendNeverSustained: "hasn't recovered",
    legendBaselineTooSmall: "no prepandemic service",

    // Commute measures
    cellAcHome: "AC Transit commuters",
    cellAllHome: "All commuters",
    modeCompare: "Compare",

    // Service legend
    noSnapshot: "No data for this week.",
    // {limit}/{lower} are numbers, {unit} is "min" or "mph".
    legendUnder: "under {limit} {unit}",
    legendOver: "{lower}+ {unit}",
    legendBetween: "{lower}-{limit} {unit}",
    legendNoTrips: "no trips in this period",
  },
};
