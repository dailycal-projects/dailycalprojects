import React, { useState, useEffect } from 'react';

// components
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import {
  MapContainer,
  CircleMarker,
  Polyline,
  TileLayer,
  Popup,
} from 'react-leaflet';

// data
import BART_lines from './data/BART_lines_ordered_stops.json';
import BART_stops from './data/BART_stops_leaflet.json';
import BART_fares from './data/BART_fares.json';

// styles
import 'leaflet/dist/leaflet.css';
import './BayPassCalculator.css';

// bay pass fare option parameters [OLD]
// const bayPassFareMin = 200;
// const bayPassFareMax = 350;
// const bayPassFareIncrement = 5;
// const bayPassFareDefault = 229;
// const bayPassFares = [];
// for (let i = bayPassFareMin; i <= bayPassFareMax; i += bayPassFareIncrement) {
//   bayPassFares.push(i);
// }

// NEW
const BAYPASS_SEMESTER_FEE = 229;
const WEEKS_PER_SEMESTER = 16;

// AC Transit charges a flat fare per one-way ride
const AC_TRANSIT_FARE = 2.50;

// students can log up to this many distinct trips
const MAX_TRIPS = 3;

// line parameters
const lineNames = Object.keys(BART_lines);
// line colors from official BART map
const lineColors = [
  '#ABA682',
  '#019CDB',
  '#4EB849',
  '#FAA61A',
  '#ED1C24',
  '#FFE802',
];
const lineNameColorDict = lineNames.reduce((acc, key, index) => {
  acc[key] = lineColors[index];
  return acc;
}, {});

// stop parameters
const BART_stops_info = BART_stops.info;
// get bart stop names from stops data
const BART_stop_names = BART_stops_info.map((s) => s.Name);
BART_stop_names.sort(); // alphabetically
const BART_stop_name_id_dict = {};
for (const obj of BART_stops_info) {
  BART_stop_name_id_dict[obj.Name] = obj.id;
}

// a blank trip to drop into the list — BART by default, same defaults as the old tool
const makeBlankTrip = (id) => ({
  id,
  mode: 'BART',
  frequency: '1',
  origin: 'Downtown Berkeley',
  destination: 'Embarcadero',
  roundTrip: true,
});

export default function BayPassCalculator() {
  const [isMobile, setIsMobile] = useState(false);

  // trip inputs — an array so students can stack up to MAX_TRIPS distinct trips
  const [trips, setTrips] = useState([makeBlankTrip(1)]);
  const [tripIdCounter, setTripIdCounter] = useState(2);

  // // input states
  // const [frequency, setFrequency] = useState('1');
  // const [origin, setOrigin] = useState('Downtown Berkeley');
  // const [destination, setDestination] = useState('Embarcadero');
  // const [roundTrip, setRoundTrip] = useState(true);

  // output states
  const [fare, setFare] = useState(2.3); // weekly fare cost w/o BayPass, across all trips
  // const [bayPassAnnualFare, setBayPassAnnualFare] = useState(bayPassFareDefault);
  // const [bayPassWeeklyFare, setBayPassWeeklyFare] = useState(bayPassFareDefault / 52);
  const [bayPassWeeklyFare] = useState(
    Math.round((BAYPASS_SEMESTER_FEE / WEEKS_PER_SEMESTER) * 100) / 100,
  ); // new
  const [amountSaved, setAmountSaved] = useState(0);
  const [worthIt, setWorthIt] = useState(false);

  // map path state — one path per BART trip currently entered
  const [mapPaths, setMapPaths] = useState([]);

  // plotting parameters
  const centerLat = (BART_stops.minLat + BART_stops.maxLat) / 2;
  const distanceLat = BART_stops.maxLat - BART_stops.minLat;
  const bufferLat = distanceLat * 0.25;
  const centerLong = (BART_stops.minLong + BART_stops.maxLong) / 2;
  const distanceLong = BART_stops.maxLong - BART_stops.minLong;
  const bufferLong = distanceLong * 0.25;

  // EFFECTS
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  // recalculate weekly (non-BayPass) fare whenever any trip changes
  useEffect(() => {
    let total = 0;
    trips.forEach((trip) => {
      let oneWayFare = 0;
      if (trip.mode === 'AC') {
        oneWayFare = AC_TRANSIT_FARE;
      } else if (trip.origin !== trip.destination) {
        oneWayFare = (BART_fares[trip.origin] && BART_fares[trip.origin][trip.destination]) || 0;
      }
      total += oneWayFare * Number(trip.frequency) * (trip.roundTrip ? 2 : 1);
    });
    setFare(Math.round(total * 100) / 100);
  }, [trips]);

  // no longer needed // when BayPass annual fare changes, update BayPass weekly fare
  // useEffect(() => {
  //   const num_weeks = 52;
  //   const calculatedFare = Math.round(bayPassAnnualFare / num_weeks * 100) / 100;
  //   setBayPassWeeklyFare(calculatedFare);
  // }, [bayPassAnnualFare]);

  // when fare or bay pass weekly fare changes, check if still worth it (and amount saved)
  useEffect(() => {
    const calculatedDifference = Math.round((fare - bayPassWeeklyFare) * 100) / 100;
    setAmountSaved(calculatedDifference);
    setWorthIt(bayPassWeeklyFare <= fare);
  }, [fare, bayPassWeeklyFare]);

  // function that finds all stops between stop1 (ID) and stop2 (ID) for line (name)
  const findBetweenStops = (line, stop1, stop2) => {
    const selectedLineStops = BART_lines[line];
    const index1 = selectedLineStops.indexOf(stop1);
    const index2 = selectedLineStops.indexOf(stop2);
    const startIndex = Math.min(index1, index2);
    const endIndex = Math.max(index1, index2);
    return selectedLineStops.slice(startIndex, endIndex + 1);
  };

  // algorithm that finds shortest path between start and end stations
  function findShortestPath(startStation, endStation) {
    const priorityQueue = [{ path: [startStation], distance: 0, lines: new Set() }];
    const visited = new Set([startStation]);
    let shortestPath = null;

    while (priorityQueue.length > 0) {
      const { path, distance, lines } = priorityQueue.shift();
      const currentStation = path[path.length - 1];

      if (currentStation === endStation) {
        if (!shortestPath || distance < shortestPath.distance) {
          shortestPath = { path, distance, lines: Array.from(lines) };
        }
        continue;
      }

      for (const line in BART_lines) {
        if (BART_lines[line].includes(currentStation)) {
          const currentIndex = BART_lines[line].indexOf(currentStation);
          const nextStations = [];

          if (currentIndex > 0) {
            nextStations.push(BART_lines[line][currentIndex - 1]);
          }
          if (currentIndex < BART_lines[line].length - 1) {
            nextStations.push(BART_lines[line][currentIndex + 1]);
          }

          for (const nextStation of nextStations) {
            if (!visited.has(nextStation)) {
              const newPath = [...path, nextStation];
              const newDistance = distance + 1;
              const newLines = new Set(lines);
              newLines.add(line);
              priorityQueue.push({ path: newPath, distance: newDistance, lines: newLines });
              visited.add(nextStation);
            }
          }
        }
      }
    }

    if (shortestPath) {
      return shortestPath.lines.map((line) => {
        const stops = shortestPath.path.filter((station) => BART_lines[line].includes(station));
        return { line, stops };
      });
    }
    return null;
  }

  // recompute map paths for every BART trip whenever trips change
  useEffect(() => {
    const paths = trips
      .filter((trip) => trip.mode === 'BART')
      .map((trip) => {
        const originID = BART_stop_name_id_dict[trip.origin];
        const destinationID = BART_stop_name_id_dict[trip.destination];

        if (!originID || !destinationID || originID === destinationID) {
          return { tripId: trip.id, selectedLines: [], coordinatesSequences: [] };
        }

        const linesWithOriginDestination = Object.entries(BART_lines)
          .filter(([line, stops]) => stops.includes(originID))
          .filter(([line, stops]) => stops.includes(destinationID))
          .map(([line]) => line);

        let selectedLines; let
          coordinatesSequences;
        if (linesWithOriginDestination.length > 0) {
          selectedLines = [linesWithOriginDestination[0]];
          const stopSequence = findBetweenStops(selectedLines, originID, destinationID);
          coordinatesSequences = [stopSequence.map((stop) => {
            const coords = BART_stops_info.find((obj) => obj.id === stop).Location;
            return [coords.Latitude, coords.Longitude].map((str) => Number(str));
          })];
        } else {
          const sharedLines = findShortestPath(originID, destinationID);
          selectedLines = sharedLines ? sharedLines.map((segment) => segment.line) : [];
          coordinatesSequences = sharedLines ? sharedLines.map((segment) => segment.stops).map((stops) => stops.map((stop) => {
            const coords = BART_stops_info.find((obj) => obj.id === stop).Location;
            return [coords.Latitude, coords.Longitude].map((str) => Number(str));
          })) : [];
        }

        return { tripId: trip.id, selectedLines, coordinatesSequences };
      });

    setMapPaths(paths);
  }, [trips]);

  // ---- trip list handlers ----
  const updateTrip = (id, changes) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  };

  const addTrip = () => {
    if (trips.length >= MAX_TRIPS) return;
    setTrips((prev) => [...prev, makeBlankTrip(tripIdCounter)]);
    setTripIdCounter((prev) => prev + 1);
  };

  const removeTrip = (id) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const TripRow = ({ trip, index }) => (
    <div className="bp-trip-row">
      <div className="bp-trip-row-header">
        <span className="bp-trip-row-label">
          Trip
          {index + 1}
        </span>
        {trips.length > 1 && (
        <button
          type="button"
          className="bp-trip-remove-btn"
          onClick={() => removeTrip(trip.id)}
          aria-label={`Remove trip ${index + 1}`}
        >
          remove
        </button>
        )}
      </div>

      {/* mode */}
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id={`mode-label-${trip.id}`}>Operator</InputLabel>
        <Select
          labelId={`mode-label-${trip.id}`}
          value={trip.mode}
          onChange={(e) => updateTrip(trip.id, { mode: e.target.value })}
          label="Operator"
        >
          <MenuItem value="BART">BART</MenuItem>
          <MenuItem value="AC">AC Transit</MenuItem>
        </Select>
      </FormControl>

      {/* frequency */}
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id={`freq-label-${trip.id}`}>Trip frequency</InputLabel>
        <Select
          labelId={`freq-label-${trip.id}`}
          value={trip.frequency}
          onChange={(e) => updateTrip(trip.id, { frequency: e.target.value })}
          label="Frequency"
        >
          <MenuItem value="0.25">One per month</MenuItem>
          <MenuItem value="0.5">Two per month</MenuItem>
          <MenuItem value="1">One per week</MenuItem>
          <MenuItem value="2">Two per week</MenuItem>
          <MenuItem value="3">Three per week</MenuItem>
          <MenuItem value="4">Four per week</MenuItem>
          <MenuItem value="5">Five per week</MenuItem>
          <MenuItem value="6">Six per week</MenuItem>
          <MenuItem value="7">Daily</MenuItem>
        </Select>
      </FormControl>

      {trip.mode === 'BART' ? (
        <>
          {/* trip origin */}
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id={`origin-label-${trip.id}`}>Origin</InputLabel>
            <Select
              labelId={`origin-label-${trip.id}`}
              value={trip.origin}
              onChange={(e) => updateTrip(trip.id, { origin: e.target.value })}
              label="Origin"
            >
              {BART_stop_names.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
          </FormControl>

          {/* trip destination */}
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id={`destination-label-${trip.id}`}>Destination</InputLabel>
            <Select
              labelId={`destination-label-${trip.id}`}
              value={trip.destination}
              onChange={(e) => updateTrip(trip.id, { destination: e.target.value })}
              label="Destination"
            >
              {BART_stop_names.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
          </FormControl>
        </>
      ) : (
        <p className="bp-ac-note">
          AC Transit rides are a flat $
          {AC_TRANSIT_FARE.toFixed(2)}
          {' '}
          fare, each way.
        </p>
      )}

      <FormControlLabel
        control={(
          <Checkbox
            checked={trip.roundTrip}
            onChange={() => updateTrip(trip.id, { roundTrip: !trip.roundTrip })}
          />
)}
        label="Round trip?"
        labelPlacement="start"
      />
    </div>
  );

  const BayPassControls = () => (
    <div className="bp-controls-div">

      {trips.map((trip, index) => (
        <TripRow key={trip.id} trip={trip} index={index} />
      ))}

      {trips.length < MAX_TRIPS && (
      <button type="button" className="bp-add-trip-btn" onClick={addTrip}>
        + add another trip
      </button>
      )}

      {/* calculated fare */}
      <div className="bp-fare-output">
        <div className="bp-fare-output-grid">
          <p>Weekly cost without BayPass: </p>
          <p>
            <b>
              $
              {fare}
            </b>
          </p>
          <p>Weekly cost with BayPass: </p>
          <p>
            <b>
              $
              {bayPassWeeklyFare}
            </b>
          </p>
          <p>
            Each week, you would
            {worthIt ? <>save</> : <>lose</>}
            :
          </p>
          <p>
            <b className={worthIt ? 'green-text' : 'red-text'}>
              $
              {worthIt ? amountSaved : -amountSaved}
            </b>
          </p>
        </div>

        <p>
          Bay Pass
          {worthIt ? <b className="green-text">would</b> : <b className="red-text">would not</b>}
          {' '}
          be worth it.
          {fare === 0 ? <span>(but you should go out more!)</span> : null}
        </p>
      </div>

      <div>
        <p className="bp-map-note">
          <b>Note:</b>
          {' '}
          This assumes the standard $
          {BAYPASS_SEMESTER_FEE}
          /semester BayPass fee (
          {WEEKS_PER_SEMESTER}
          {' '}
          weeks).
        </p>

        <p className="bp-map-about-data">
          <b>About the data:</b>
          {' '}
          The data was obtained from
          {' '}
          <a href="https://511.org/open-data" target="_blank" rel="noreferrer">511.org</a>
          {' '}
          and
          {' '}
          <a href="https://www.transit.wiki/BART_fares" target="_blank" rel="noreferrer">tranist.wiki</a>
          .
        </p>
      </div>

    </div>
  );

  const BayPassMap = () => (
    <div className="bp-map-div">
      <MapContainer
        scrollWheelZoom={false}
        dragging={!isMobile}
        minZoom={9}
        zoom={isMobile ? 9 : 10}
        center={[centerLat, centerLong]}
        bounds={[
          [
            BART_stops.minLat - bufferLat,
            BART_stops.minLong - bufferLong,
          ],
          [
            BART_stops.maxLat + bufferLat,
            BART_stops.maxLong + bufferLong,
          ],
        ]}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png"
        />
        {BART_stops_info.map((stop, k) => (
          <CircleMarker
            key={k}
            center={[stop.Location.Latitude, stop.Location.Longitude]}
            radius={4}
            stroke
            weight={1}
            fill
            color="#000"
            opacity={0.9}
            fillColor="#000"
            data={stop}
          >
            <Popup>
              <div style={{ fontWeight: 500, fontSize: '16px' }}>
                <p><span>{stop.Name}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {mapPaths.map((tripPath) => (
          tripPath.selectedLines.map((line, index) => (
            <Polyline
              key={`${tripPath.tripId}-${line}`}
              pathOptions={{ color: lineNameColorDict[line] }}
              positions={tripPath.coordinatesSequences[index]}
            />
          ))
        ))}
      </MapContainer>
      {trips.some((t) => t.mode === 'AC') && (
      <p className="bp-ac-map-note">AC Transit trips aren't shown on the map above — only BART segments are plotted.</p>
      )}
    </div>
  );

  return (
    <div className="bp-calculator-div" id="bp-calculator-div">
      <div className="bp-title-div">
        <h2>BayPass Fare Calculator for BART &amp; AC Transit</h2>
      </div>
      <p>
        <span>Enter your riding habits to see if the </span>
        <b>
          $
          {BAYPASS_SEMESTER_FEE}
          {' '}
          per semester
        </b>
        <span> BayPass fee was worth it for you.</span>
      </p>
      <div className="bp-calculator-viz-div">
        <BayPassMap />
        <BayPassControls />
      </div>
    </div>
  );
}
