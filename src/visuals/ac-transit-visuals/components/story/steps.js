// The story's copy and the map state each passage drives. A step's `scene`
// is layered over the step before it, so a step only states what changes --
// the same way the script reads ("switch to block groups", "zoom out").
//
// Weeks are the Monday a week starts on, as meta.weeks labels them. Each is a
// representative week in the month the script names, clear of holidays:
// 2020-02-03 is the app's own Feb 2020 baseline week.
//
// Figures quoted in the copy come from numbers.json, resolved once by
// scripts/build_story_numbers.py rather than recomputed in the browser.
import { t } from "../../lib/i18n";
import NUMBERS from "./numbers.json";

export const WEEKS = {
  feb2020: "2020-02-03",
  apr2020: "2020-04-20",
  jul2021: "2021-07-19",
  nov2021: "2021-11-08",
  jul2022: "2022-07-11",
  aug2023: "2023-08-28",
  dec2020: "2020-12-07",
  sep2021: "2021-09-13",
  sep2025: "2025-09-15",
  feb2026: "2026-02-09",
};

// [[south, west], [north, east]]
export const BOUNDS = {
  berkeley: [[37.848, -122.318], [37.9065, -122.235]],
  eastBay: [[37.718, -122.405], [37.905, -122.15]],
  campusFlows: [[37.8, -122.33], [37.9, -122.215]],
  // The income deciles are drawn from tracts across the whole service area,
  // so those passages pull back further than the rest of the section.
  incomeBay: [[37.65, -122.47], [37.94, -122.09]],
  southEastBay: [[37.49, -122.42], [37.9, -121.92]],
};

export const RECOVERY_THRESHOLD = 5; // meta.recovery_thresholds[5] = 100%

const { income, speeds } = NUMBERS;

export const MAP_ONE = [
  {
    id: "records",
    scene: {
      view: "rel",
      level: "group",
      routes: true,
      mask: true,
      bounds: "berkeley",
      week: "feb2020",
      series: "berkeley",
    },
    text: [t("story.one.records")],
  },
  {
    id: "simulated",
    text: [t("story.one.simulated")],
    link: { view: "methodology", label: t("story.seeMethodology") },
  },
  {
    id: "berkeley-2020",
    text: [t("story.one.berkeley2020")],
  },
  {
    id: "pandemic",
    scrub: true,
    scene: { week: "apr2020", callout: "bancroft" },
    text: [t("story.one.pandemic")],
  },
  {
    id: "san-pablo",
    scene: { callout: "sanPablo" },
    text: [t("story.one.sanPablo")],
  },
  {
    id: "stagnant",
    scrub: true,
    scene: { week: "jul2021" },
    text: [t("story.one.stagnant")],
  },
  {
    id: "returned",
    scrub: true,
    scene: { week: "nov2021" },
    text: [t("story.one.returned")],
  },
  {
    id: "breaks",
    scrub: true,
    scene: { week: "jul2022" },
    text: [t("story.one.breaks")],
  },
  {
    id: "recovered-2023",
    scrub: true,
    scene: { week: "aug2023" },
    text: [t("story.one.recovered2023")],
  },
  {
    id: "fully-returned",
    scrub: true,
    scene: { week: "feb2026" },
    text: [t("story.one.fullyReturned")],
  },
  {
    id: "six-years-on",
    scene: { level: "tract", routes: false },
    text: [t("story.one.sixYearsOn")],
  },
  {
    id: "east-bay",
    scene: { mask: false, bounds: "eastBay", series: "system" },
    text: [t("story.one.eastBay")],
  },
  {
    id: "tempo",
    scene: { callout: "tempo", trace: ["1T", "1"] },
    text: [t("story.one.tempo")],
  },
  {
    id: "transbay",
    scene: { callout: "transbay" },
    text: [t("story.one.transbay")],
  },
  {
    id: "high-income",
    // Deciles are of tract median household income (ACS 2024 5-year B19013);
    // the recovery figure is the two groups' riders in the story's week over
    // the same tracts' riders in the Feb 2020 baseline week.
    scene: { income: "high", callout: null, bounds: "incomeBay" },
    text: [t("story.one.highIncome", { pct: income.high_recovery_pct })],
  },
  {
    id: "low-income",
    scene: { income: "low" },
    text: [t("story.one.lowIncome", { pct: income.low_recovery_pct })],
  },
];

export const MAP_TWO = [
  {
    id: "ipf",
    scene: {
      view: "commute",
      level: "group",
      routes: false,
      mask: false,
      income: null,
      bounds: "campusFlows",
      week: "feb2026",
      focus: { region: "campus", mode: "to" },
    },
    text: [t("story.two.ipf"), t("story.two.ipfAccuracy")],
  },
  {
    id: "to-campus",
    text: [t("story.two.toCampus")],
  },
  {
    id: "marks",
    scene: { marks: ["ucVillage"] },
    text: [t("story.two.marks")],
  },
  {
    id: "ac-home",
    scene: { level: "tract", commuteMeasure: "acHome", focus: null },
    text: [t("story.two.acHome")],
  },
  {
    id: "compare",
    scene: { commuteMeasure: "compare", marks: ["tract4238", "tract4235"] },
    text: [t("story.two.compare")],
  },
  {
    id: "south-east-bay",
    scene: { bounds: "southEastBay", marks: ["tract4425", "tract4403"] },
    text: [t("story.two.southEastBay"), t("story.two.southEastBayHint")],
    link: { view: "explore", label: t("story.seeData") },
  },
];

export const MAP_THREE = [
  {
    id: "speed",
    scene: {
      view: "speed",
      period: "day",
      level: "group",
      routes: true,
      mask: false,
      commuteMeasure: null,
      bounds: "berkeley",
      week: "feb2020",
      series: "speed",
    },
    text: [t("story.three.speed")],
  },
  {
    id: "pandemic-traffic",
    scrub: true,
    scene: { week: "dec2020" },
    text: [t("story.three.pandemicTraffic")],
  },
  {
    id: "time-of-day",
    scrub: true,
    scene: { week: "sep2025" },
    text: [t("story.three.timeOfDay", { pct: speeds.night_vs_peak_pct }),
      t("story.three.timeOfDayHint")],
    link: { view: "explore", label: t("story.seeData") },
  },
];

export const RECOVERY_SCENE = {
  view: "recovery",
  level: "bgroup",
  routes: false,
  mask: false,
  bounds: "eastBay",
  week: "feb2026",
  recThresh: RECOVERY_THRESHOLD,
};

// Fold each step's scene over the ones before it and turn names into indexes.
// Callouts, marks and traced lines point at what one passage is talking about,
// so they belong to that step alone and are not carried forward.
export function resolveScenes(steps, data, places) {
  let current = { focus: null, recThresh: RECOVERY_THRESHOLD, income: null, commuteMeasure: null };
  return steps.map((step) => {
    const { callout = null, marks = [], trace = null, ...inherited } = step.scene || {};
    current = { ...current, ...inherited };
    return resolveScene({ ...current, callout, marks, trace }, data, places);
  });
}

export function resolveScene(scene, data, places) {
  const index = data.meta.weeks.indexOf(WEEKS[scene.week]);
  return {
    ...scene,
    weekIndex: index >= 0 ? index : data.BASE,
    boundsLatLng: BOUNDS[scene.bounds],
    calloutPlace: scene.callout ? places[scene.callout] : null,
    markPlaces: (scene.marks || []).map((name) => places[name]),
  };
}
