/* ============================================================
   constants.js — GGH pins data + map/style configuration
   ============================================================ */

export const PINS = [
  { name: "Albany Bulb", lat: 37.8888190128995, lng: -122.327415343957, gghStartSp: 346, gghEndSp: 365, gghStartFa: 346, gghEndFa: 365, tag: "Off-Campus", access: 4, views: 5, env: 5, notes: "" },
  { name: "Indian Rock Park", lat: 37.8922186297827, lng: -122.273079038403, gghStartSp: 23, gghEndSp: 26, gghStartFa: 320, gghEndFa: 322, tag: "Off-Campus", access: 4, views: 5, env: 3, notes: "" },
  { name: "Grotto Rock Park", lat: 37.8934271576909, lng: -122.268772249069, gghStartSp: 23, gghEndSp: 26, gghStartFa: 319, gghEndFa: 322, tag: "Off-Campus", access: 4, views: 5, env: 4, notes: "" },
  { name: "Seaview Trail Vista", lat: 37.8941055046049, lng: -122.234256937359, gghStartSp: 32, gghEndSp: 34, gghStartFa: 312, gghEndFa: 313, tag: "Off-Campus", access: 3, views: 5, env: 5, notes: "" },
  { name: "Cesar Chavez Park (north end)", lat: 37.874363168464, lng: -122.324623478546, gghStartSp: 22, gghEndSp: 26, gghStartFa: 320, gghEndFa: 324, tag: "Off-Campus", access: 3, views: 5, env: 5, notes: "" },
  { name: "Cesar Chavez Park (south end)", lat: 37.8696703920424, lng: -122.320255234011, gghStartSp: 29, gghEndSp: 33, gghStartFa: 313, gghEndFa: 316, tag: "Off-Campus", access: 4, views: 5, env: 4, notes: "" },
  { name: "Bayview Pl", lat: 37.8843472745503, lng: -122.262806137463, gghStartSp: 33, gghEndSp: 35, gghStartFa: 311, gghEndFa: 313, tag: "Off-Campus", access: 3, views: 2, env: 4, notes: "" },
  { name: "Atlas Path Vista", lat: 37.8868405145148, lng: -122.25041512177, gghStartSp: 34, gghEndSp: 35, gghStartFa: 310, gghEndFa: 312, tag: "Off-Campus", access: 4, views: 5, env: 3, notes: "" },
  { name: "Berkeley Bay Vista", lat: 37.8804262480801, lng: -122.247626549108, gghStartSp: 39, gghEndSp: 40, gghStartFa: 305, gghEndFa: 307, tag: "Off-Campus", access: 4, views: 5, env: 3, notes: "" },
  { name: "Lawrence Hall of Science", lat: 37.878412, lng: -122.247044, gghStartSp: 40, gghEndSp: 42, gghStartFa: 303, gghEndFa: 305, tag: "Off-Campus", access: 4, views: 5, env: 4, notes: "Though admission is free for UC Berkeley students, the Lawrence Hall of Science closes at 5pm, which is before sunset." },
  { name: "Grizzly Peak (main pullout)", lat: 37.8812286530182, lng: -122.231515513766, gghStartSp: 41, gghEndSp: 42, gghStartFa: 303, gghEndFa: 304, tag: "Off-Campus", access: 4, views: 5, env: 4, notes: "" },
  { name: "Big C", lat: 37.8745311105514, lng: -122.249589757626, gghStartSp: 42, gghEndSp: 44, gghStartFa: 301, gghEndFa: 303, tag: "Off-Campus", access: 4, views: 5, env: 5, notes: "" },
  { name: "Brickyard Cove (Berkeley Marina)", lat: 37.8598142764415, lng: -122.305735651139, gghStartSp: 43, gghEndSp: 46, gghStartFa: 300, gghEndFa: 302, tag: "Off-Campus", access: 3, views: 5, env: 5, notes: "" },
  { name: "Picnic View Ridge", lat: 37.871545273863, lng: -122.22968464953, gghStartSp: 47, gghEndSp: 49, gghStartFa: 296, gghEndFa: 298, tag: "Off-Campus", access: 3, views: 5, env: 5, notes: "" },
  { name: "Grizzly Peak (giant log pullout)", lat: 37.8722073897154, lng: -122.220588331848, gghStartSp: 48, gghEndSp: 49, gghStartFa: 296, gghEndFa: 297, tag: "Off-Campus", access: 4, views: 5, env: 5, notes: "" },
  { name: "Clark Kerr Track", lat: 37.8647545004258, lng: -122.24647976126, gghStartSp: 49, gghEndSp: 51, gghStartFa: 294, gghEndFa: 296, tag: "On-Campus", access: 5, views: 3, env: 4, notes: "" },
  { name: "Stonewall-Panoramic Trail Vista", lat: 37.8655644745048, lng: -122.240581102592, gghStartSp: 50, gghEndSp: 51, gghStartFa: 294, gghEndFa: 296, tag: "Off-Campus", access: 4, views: 5, env: 5, notes: "" },
  { name: "Grizzly Peak (KPFA Tower pullout)", lat: 37.8651820930087, lng: -122.222135855337, gghStartSp: 52, gghEndSp: 53, gghStartFa: 292, gghEndFa: 293, tag: "Off-Campus", access: 4, views: 5, env: 5, notes: "" },
  { name: "Point Emery", lat: 37.8457293526268, lng: -122.302198015687, gghStartSp: 56, gghEndSp: 58, gghStartFa: 287, gghEndFa: 289, tag: "Off-Campus", access: 4, views: 5, env: 3, notes: "" },
  { name: "Emeryville Marina Park", lat: 37.8424286024585, lng: -122.314367444065, gghStartSp: 57, gghEndSp: 59, gghStartFa: 285, gghEndFa: 288, tag: "Off-Campus", access: 4, views: 5, env: 5, notes: "" },
  { name: "Mt Diablo Summit Visitor Center", lat: 37.8818042559832, lng: -121.914290020331, gghStartSp: 63, gghEndSp: 63, gghStartFa: 282, gghEndFa: 282, tag: "Off-Campus", access: 3, views: 4, env: 5, notes: "Due to the distance from the Golden Gate Bridge, very clear visibility is required to see it from Mt. Diablo." },
  { name: "Treasure Island NW", lat: 37.8303856995793, lng: -122.377617269266, gghStartSp: 61, gghEndSp: 65, gghStartFa: 279, gghEndFa: 284, tag: "Off-Campus", access: 2, views: 5, env: 4, notes: "$8.50 toll is collected heading westbound on the Bay Bridge to Treasure Island." },
  { name: "Alcatraz Viewpoint (Barker Beach)", lat: 37.8268929527263, lng: -122.424130452215, gghStartSp: 55, gghEndSp: 64, gghStartFa: 281, gghEndFa: 290, tag: "Off-Campus", access: 1, views: 5, env: 4, notes: "The Alcatraz ferry is the only authorized way to reach the island. Adult tickets sell for roughly $45-60 and can sell out 90 days in advance." },
  { name: "Joaquin Miller Park (Lookout Point)", lat: 37.8128316018722, lng: -122.194258955209, gghStartSp: 81, gghEndSp: 82, gghStartFa: 262, gghEndFa: 263, tag: "Off-Campus", access: 3, views: 5, env: 5, notes: "" },
  { name: "Evans Hall F10 Balcony", lat: 37.8734336917814, lng: -122.258000827204, gghStartSp: 42, gghEndSp: 43, gghStartFa: 302, gghEndFa: 304, tag: "On-Campus", access: 4, views: 3, env: 1, notes: "Access to the balcony is blocked off, but the sunset can be viewed from inside the building." },
  { name: "Graduate Theological Union Balcony", lat: 37.8754152586105, lng: -122.262049887252, gghStartSp: 39, gghEndSp: 41, gghStartFa: 304, gghEndFa: 306, tag: "On-Campus", access: 4, views: 3, env: 3, notes: "" },
  { name: "Ridge Path", lat: 37.8764686028796, lng: -122.263984471867, gghStartSp: 38, gghEndSp: 40, gghStartFa: 305, gghEndFa: 307, tag: "On-Campus", access: 5, views: 2, env: 4, notes: "" },
  { name: "Cal Memorial Stadium Concourse", lat: 37.8704318904843, lng: -122.251501483844, gghStartSp: 45, gghEndSp: 46, gghStartFa: 299, gghEndFa: 300, tag: "On-Campus", access: 2, views: 5, env: 4, notes: "Entry to the stadium is prohibited except on game days." },
  { name: "Top of Campanile", lat: 37.8720578106133, lng: -122.25787494319, gghStartSp: 43, gghEndSp: 44, gghStartFa: 301, gghEndFa: 303, tag: "On-Campus", access: 1, views: 5, env: 5, notes: "Access to the top closes at 5pm on weekdays and 5:30pm on weekends, which is before sunset." },
];

export const MAP_CONFIG = {
  style: "https://api.maptiler.com/maps/voyager-v2/style.json?key=cv2lryclk9tg1QR6KCLy",
  center: [-122.2730, 37.8715],
  zoom: 11.4,
  minZoom: 10,
};

export const MAPTILER_KEY = "cv2lryclk9tg1QR6KCLy";
export const GEOCODE_BASE = "https://api.maptiler.com/geocoding";

export const COLORS = {
  onCampus: "#6f8fb8",
  offCampus: "#b87a6f",
  band: "#c7ab4b",
};

export const BRIDGE = {
  midpoint:   [-122.4785691240060, 37.8198754226465],
  northTower: [-122.4792559011720, 37.8256669371344],
  southTower: [-122.4778823468390, 37.8140839081585],
};

export const GRID = {
  lngMin: -122.55,
  lngMax: -121.85,
  latMin:  37.68,
  latMax:  38.03,
  step:     0.005,
};

export const PIN_RADIUS       = 6.5;
export const PIN_TOUCH_RADIUS = 12;