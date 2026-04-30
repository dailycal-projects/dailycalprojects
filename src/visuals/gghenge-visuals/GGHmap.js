import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./GGHMap.css";

const GGHMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const MAPTILER_STYLE =
      "https://api.maptiler.com/maps/voyager-v2/style.json?key=cv2lryclk9tg1QR6KCLy";

    const MAP_CENTER = [-122.2730, 37.8715];
    const START_ZOOM = 11.4;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAPTILER_STYLE,
      center: MAP_CENTER,
      zoom: START_ZOOM,
      minZoom: 10,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      /* ============================================================
       Section 1 — PINS LIST
       Format: { 
          name: string,
          photo: string,
          lat: int,
          lng: int,
          gghStartSp: int,
          gghEndSp: int,
          gghStartFa: int,
          gghEndFa: int,
          tag: string,
          access: double,
          views: double,
          env: double,
          notes: string
       ============================================================ */
      const PINS = [
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
        { name: "Mt Diablo Summit Visitor Center", lat: 37.8818042559832, lng: -121.914290020331, gghStartSp: 63, gghEndSp: 63, gghStartFa: 282, gghEndFa: 282, tag: "Off-Campus", access: 3, views: 4, env: 5, notes: "Due to the distance from the Golden Gate Bridge, very clear visiblilty is required to see it from Mt. Diablo." },
        { name: "Treasure Island NW", lat: 37.8303856995793, lng: -122.377617269266, gghStartSp: 61, gghEndSp: 65, gghStartFa: 279, gghEndFa: 284, tag: "Off-Campus", access: 2, views: 5, env: 4, notes: "$8.50 toll is collected heading westbound on the Bay Bridge to Treasure Island." },
        { name: "Alcatraz Viewpoint (Barker Beach)", lat: 37.8268929527263, lng: -122.424130452215, gghStartSp: 55, gghEndSp: 64, gghStartFa: 281, gghEndFa: 290, tag: "Off-Campus", access: 1, views: 5, env: 4, notes: "The Alcatraz ferry is the only authorized way to reach the island. Adult tickets sell for roughly $45-60 and can sell out 90 days in advance." },
        { name: "Joaquin Miller Park (Lookout Point)", lat: 37.8128316018722, lng: -122.194258955209, gghStartSp: 81, gghEndSp: 82, gghStartFa: 262, gghEndFa: 263, tag: "Off-Campus", access: 3, views: 5, env: 5, notes: "" },
        { name: "Evans Hall F10 Balcony", lat: 37.8734336917814, lng: -122.258000827204, gghStartSp: 42, gghEndSp: 43, gghStartFa: 302, gghEndFa: 304, tag: "On-Campus", access: 4, views: 3, env: 1, notes: "Access to the balcony is blocked off, but the sunset can be viewed from inside the building." },
        { name: "Graduate Theological Union Balcony", lat: 37.8754152586105, lng: -122.262049887252, gghStartSp: 39, gghEndSp: 41, gghStartFa: 304, gghEndFa: 306, tag: "On-Campus", access: 4, views: 3, env: 3, notes: "" },
        { name: "Ridge Path", lat: 37.8764686028796, lng: -122.263984471867, gghStartSp: 38, gghEndSp: 40, gghStartFa: 305, gghEndFa: 307, tag: "On-Campus", access: 5, views: 2, env: 4, notes: "" },
        { name: "Cal Memorial Stadium Concourse", lat: 37.8704318904843, lng: -122.251501483844, gghStartSp: 45, gghEndSp: 46, gghStartFa: 299, gghEndFa: 300, tag: "On-Campus", access: 2, views: 5, env: 4, notes: "Entry to the stadium is prohibited except on game days." },
        { name: "Top of Campanile", lat: 37.8720578106133, lng: -122.25787494319, gghStartSp: 43, gghEndSp: 44, gghStartFa: 301, gghEndFa: 303, tag: "On-Campus", access: 1, views: 5, env: 5, notes: "Access to the top closes at 5pm on weekdays and 5:30pm on weekends, which is before sunset." },
      ];

    /* ============================================================
       Section 2 — MAP SETTINGS
       ============================================================ */
      const IS_MOBILE = window.innerWidth <= 700;
      const MAPTILER_KEY = "cv2lryclk9tg1QR6KCLy";
      const GEOCODE_BASE = "https://api.maptiler.com/geocoding";

      const COLOR_ON   = "#6f8fb8";
      const COLOR_OFF  = "#b87a6f";
      const COLOR_BAND = "#c7ab4b";
      const COLOR_TEXT = "#1f2328";
      const COLOR_PANEL_BG = "rgba(250, 248, 244, 0.86)";
      const COLOR_PANEL_BORDER = "rgba(60, 52, 46, 0.14)";

      const PIN_RADIUS = 8;
      const PIN_TOUCH_RADIUS = IS_MOBILE ? 18 : 12;

      const MIDPOINT = [-122.4785691240060, 37.8198754226465];
      const NORTH_TOWER = [-122.4792559011720, 37.8256669371344];
      const SOUTH_TOWER = [-122.4778823468390, 37.8140839081585];

      const GRID_LNG_MIN = -122.55;
      const GRID_LNG_MAX = -121.85;
      const GRID_LAT_MIN = 37.68;
      const GRID_LAT_MAX = 38.03;
      const GRID_STEP_DEG = 0.005;

      let clickedPopup = null;
      let clickedLngLat = null;
      let suppressClickedPopupClose = false;
      let clickedPinCameFromSearch = false;

      let selectedPinPopup = null;
      let selectedPinLngLat = null;
      let selectedPinProps = null;
      let suppressSelectedPinClose = false;

    /* ============================================================
       Section 4 — MARKERS RENDERING
       ============================================================ */
       // Build a GeoJSON FeatureCollection from visible pins
       function buildGeoJSON(visiblePins) {
        return {
          type: "FeatureCollection",
          features: visiblePins.map(pin => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
            properties: {
              name: pin.name,
              photo: pin.photo || "",
              lat: pin.lat,
              lng: pin.lng,
              gghStartSp: pin.gghStartSp,
              gghEndSp: pin.gghEndSp,
              gghStartFa: pin.gghStartFa,
              gghEndFa: pin.gghEndFa,
              tag: pin.tag,
              access: pin.access,
              views: pin.views,
              env: pin.env,
              weighted: getWeightedRating(pin.access, pin.views, pin.env),
              notes: pin.notes || ""
            }
          }))
        };
      }

      function ratingDots(score, max = 5) {
        const filled = Math.round(score);
        let html = "";
        for (let i = 0; i < max; i++) {
          html += `<span class="dot ${i < filled ? "filled" : ""}"></span>`;
        }
        return html;
      }

      function getWeightedRating(access, views, env) {
        return (1.3 * views + 1.1 * env + 0.6 * access) / 3
      }

      function buildPopupHtml(props) {
        const tagClass = props.tag === "On-Campus" ? "on-campus" : "off-campus";

        const spStart = Number(props.gghStartSp);
        const spEnd   = Number(props.gghEndSp);
        const faStart = Number(props.gghStartFa);
        const faEnd   = Number(props.gghEndFa);

        const springLine = spStart === spEnd
          ? doyToDateStr(spStart)
          : `${doyToDateStr(spStart)} – ${doyToDateStr(spEnd)}`;
        const fallLine = faStart === faEnd
          ? doyToDateStr(faStart)
          : `${doyToDateStr(faStart)} – ${doyToDateStr(faEnd)}`;
        const samePeriod = spStart === faStart && spEnd === faEnd;

        const currentDay = Number(daySlider.value);
        const todaySunset = sunsetLocalTime(currentDay, Number(props.lat), Number(props.lng));

        const overallRating =
          props.weighted ?? getWeightedRating(Number(props.access), Number(props.views), Number(props.env));

        const dateHtml = samePeriod
          ? `<div class="popup-row"><strong>GGH Dates:</strong> ${springLine}</div>`
          : `<div class="popup-row"><strong>Spring Dates:</strong> ${springLine}</div>
            <div class="popup-row"><strong>Fall Dates:</strong> ${fallLine}</div>`;

        const photoHtml = props.photo
          ? `<img class="popup-photo" src="${props.photo}" alt="${props.name}" onerror="this.style.display='none'" />`
          : "";

        const notesHtml = props.notes
          ? `<div class="popup-row popup-notes">
              <strong>Notes:</strong><br>
              ${props.notes}
            </div>`
          : "";

        return `
          ${photoHtml}
          <div class="popup-body">
            <div class="popup-name">${props.name}</div>
            <div class="popup-row"><strong>Coordinates:</strong> ${Number(props.lat).toFixed(5)}, ${Number(props.lng).toFixed(5)}</div>
            <div class="popup-row"><strong>Today's Date:</strong> ${doyToDateStr(currentDay)}</div>
            <div class="popup-row"><strong>Sunset Time:</strong> ${todaySunset}</div>
            ${dateHtml}
            <div class="popup-ratings">
              <div class="rating-item">
                <span class="rating-label">Accessibility</span>
                <span class="rating-stars" style="color:#5b9cf6;">${ratingDots(props.access)}</span>
              </div>
              <div class="rating-item">
                <span class="rating-label">Views</span>
                <span class="rating-stars" style="color:#f5c842;">${ratingDots(props.views)}</span>
              </div>
              <div class="rating-item">
                <span class="rating-label">Environment</span>
                <span class="rating-stars" style="color:#5dd68c;">${ratingDots(props.env)}</span>
              </div>
              <div class="rating-item">
                <span class="rating-label">Overall</span>
                <span class="rating-stars" style="color:#d6644d;">${ratingDots(overallRating)}</span>
              </div>
            </div>
            <span class="popup-tag ${tagClass}">${props.tag}</span>
            ${notesHtml}
          </div>
        `;
      }

      map.on("load", () => {
        map.addSource("pins", {
          type: "geojson",
          data: buildGeoJSON([])
        });

        map.addSource("valid-region", {
          type: "geojson",
          data: buildBoundaryFillGeoJSON(Number(daySlider.value))
        });

        map.addLayer({
          id: "valid-region-fill",
          source: "valid-region",
          type: "fill",
          paint: {
            "fill-color": COLOR_BAND,
            "fill-opacity": 0.22
          }
        });

        map.addLayer({
          id: "pins-off",
          source: "pins",
          type: "circle",
          filter: ["==", ["get", "tag"], "Off-Campus"],
          paint: {
            "circle-color": COLOR_OFF,
            "circle-radius": 6.5,
            "circle-opacity": 0.65,
            "circle-stroke-color": "rgba(255,255,255,0.78)",
            "circle-stroke-width": 1.1
          }
        });

        map.addLayer({
          id: "pins-on",
          source: "pins",
          type: "circle",
          filter: ["==", ["get", "tag"], "On-Campus"],
          paint: {
            "circle-color": COLOR_ON,
            "circle-radius": 6.5,
            "circle-opacity": 0.65,
            "circle-stroke-color": "rgba(255,255,255,0.78)",
            "circle-stroke-width": 1.1
          }
        });

        map.addLayer({
          id: "pins-halo",
          source: "pins",
          type: "circle",
          filter: ["==", ["get", "name"], ""],
          paint: {
            "circle-color": [
              "case",
              ["==", ["get", "tag"], "On-Campus"], COLOR_ON,
              COLOR_OFF
            ],
            "circle-radius": PIN_RADIUS + 6,
            "circle-opacity": 0.16,
            "circle-blur": 0.85,
            "circle-stroke-width": 0
          }
        });

        map.addSource("clicked-point", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: []
          }
        });

        map.addLayer({
          id: "clicked-point-layer",
          source: "clicked-point",
          type: "circle",
          paint: {
            "circle-radius": 6.5,
            "circle-color": "#8a8f98",
            "circle-opacity": 0.65,
            "circle-stroke-color": "rgba(255,255,255,0.78)",
            "circle-stroke-width": 1.1
          }
        });

        // captures mouse/touch events, making pins much easier to click
        ["Off-Campus", "On-Campus"].forEach(tag => {
          const id = tag === "On-Campus" ? "pins-on" : "pins-off";
          map.addLayer({
            id: `${id}-hit`,
            source: "pins",
            type: "circle",
            filter: ["==", ["get", "tag"], tag],
            paint: {
              "circle-radius": PIN_TOUCH_RADIUS,
              "circle-opacity": 0, // fully invisible
              "circle-stroke-width": 0,
            }
          });
        });

        // use hit layers for events so the clickable area is large,
        // but visual layers remain the right size
        const hitLayers = ["pins-off-hit", "pins-on-hit"];

        hitLayers.forEach(layerId => {
          map.on("mouseenter", layerId, (e) => {
            map.getCanvas().style.cursor = "pointer";
            const name = e.features[0].properties.name;
            map.setFilter("pins-halo", ["==", ["get", "name"], name]);
          });

          map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
            map.setFilter("pins-halo", ["==", ["get", "name"], ""]);
          });

          map.on("click", layerId, (e) => {
            e.preventDefault();
            e.originalEvent.stopPropagation();

            // clear dropped-pin popup
            clickedLngLat = null;
            const clickedSource = map.getSource("clicked-point");
            if (clickedSource) {
              clickedSource.setData({
                type: "FeatureCollection",
                features: []
              });
            }
            if (clickedPopup) {
              clickedPopup.remove();
              clickedPopup = null;
            }

            // clear previous selected red/blue pin popup
            if (selectedPinPopup) {
              suppressSelectedPinClose = true;
              selectedPinPopup.remove();
              suppressSelectedPinClose = false;
            }

            selectedPinLngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat };
            selectedPinProps = { ...e.features[0].properties };

            selectedPinPopup = new maplibregl.Popup({ offset: 16, maxWidth: "280px" })
              .setLngLat([selectedPinLngLat.lng, selectedPinLngLat.lat])
              .setHTML(buildPopupHtml(selectedPinProps))
              .addTo(map);

            selectedPinPopup.on("close", () => {
              if (suppressSelectedPinClose) return;
              selectedPinPopup = null;
              selectedPinLngLat = null;
              selectedPinProps = null;
            });
          });

          map.on("click", (e) => {
            const hitFeatures = map.queryRenderedFeatures(e.point, {
              layers: ["pins-off-hit", "pins-on-hit"]
            });
            // if click is on an existing red/blue pin, do nothing here
            if (hitFeatures.length > 0) return;
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;
            clickedLngLat = { lng, lat };
            clickedPinCameFromSearch = false;
            updateClickedSunsetPopup();
          });
        });
        renderPinMenu();
        applyFilters();
      });

      function formatDateRange(start, end) {
        return Number(start) === Number(end)
          ? doyToDateStr(Number(start))
          : `${doyToDateStr(Number(start))} – ${doyToDateStr(Number(end))}`;
      }

      function getSortedPins(sortMode) {
        const pinsCopy = [...PINS];
        if (sortMode === "rating") {
          pinsCopy.sort((a, b) => {
            const diff =
              getWeightedRating(b.access, b.views, b.env) -
              getWeightedRating(a.access, a.views, a.env);

            if (diff !== 0) return diff;
            return a.name.localeCompare(b.name);
          });
        } else {
          pinsCopy.sort((a, b) => a.name.localeCompare(b.name));
        }
        return pinsCopy;
      }

      function renderPinMenu() {
        const pinMenuList = document.getElementById("pinMenuList");
        const pinSortSelect = document.getElementById("pinSortSelect");
        if (!pinMenuList || !pinSortSelect) return;
        const sortedPins = getSortedPins(pinSortSelect.value);
        pinMenuList.innerHTML = sortedPins.map(pin => {
          const springLine = formatDateRange(pin.gghStartSp, pin.gghEndSp);
          const fallLine = formatDateRange(pin.gghStartFa, pin.gghEndFa);
          const weighted = getWeightedRating(pin.access, pin.views, pin.env).toFixed(2);
          return `
            <button class="pin-menu-item" data-pin-name="${pin.name}">
              <div class="pin-menu-item-name">${pin.name}</div>
              <div class="pin-menu-item-meta">Spring Dates: ${springLine}</div>
              <div class="pin-menu-item-meta">Fall Dates: ${fallLine}</div>
              <div class="pin-menu-item-meta"><strong>Overall rating: ${weighted}</strong></div>
            </button>
          `;
        }).join("");
        pinMenuList.querySelectorAll(".pin-menu-item").forEach(btn => {
          btn.addEventListener("click", async () => {
            clickedLngLat = null;
            clickedPinCameFromSearch = false;
            const clickedSource = map.getSource("clicked-point");
            if (clickedSource) {
              clickedSource.setData({
                type: "FeatureCollection",
                features: []
              });
            }
            if (clickedPopup) {
              suppressClickedPopupClose = true;
              clickedPopup.remove();
              suppressClickedPopupClose = false;
              clickedPopup = null;
            }
            const pinName = btn.dataset.pinName;
            const pin = PINS.find(p => p.name === pinName);
            if (pin) {
              const day = Number(daySlider.value);
              const matchesSpring = day >= pin.gghStartSp && day <= pin.gghEndSp;
              const matchesFall = day >= pin.gghStartFa && day <= pin.gghEndFa;
              const matchesDay = matchesSpring || matchesFall;
              if (!showAll && !matchesDay) {
                showAll = true;
                showAllBtn.textContent = "Filter by Date";
              }
            }
            searchInput.value = pinName;
            clearSuggestions();
            await runSearch();
          });
        });
      }

    /* ============================================================
       Section 5 — SEARCH UI
       ============================================================ */
      const searchInput = document.getElementById("search");
      const resetBtn = document.getElementById("resetBtn");
      const showAllBtn = document.getElementById("showAllBtn");
      const countLine = document.getElementById("countLine");
      const pinMenuList = document.getElementById("pinMenuList");
      const pinSortSelect = document.getElementById("pinSortSelect");
      const pinMenuToggle = document.getElementById("pinMenuToggle");
      const suggestionsEl = document.getElementById("searchSuggestions");
      let suggestionItems = [];
      let addressSuggestTimer = null;
      let latestSuggestToken = 0;
      let searchPinnedResult = null;

      function clearSuggestions() {
        suggestionItems = [];
        suggestionsEl.innerHTML = "";
      }

      function renderSuggestions(items) {
        suggestionItems = items;
        if (!items.length) {
          clearSuggestions();
          return;
        }
        suggestionsEl.innerHTML = `
          <div class="search-suggestions-box">
            ${items.map((item, i) => `
              <div class="search-suggestion-item" data-index="${i}">
                <div class="search-suggestion-main">${item.main}</div>
                ${item.sub ? `<div class="search-suggestion-sub">${item.sub}</div>` : ""}
              </div>
            `).join("")}
          </div>
        `;
        suggestionsEl.querySelectorAll(".search-suggestion-item").forEach(node => {
          node.addEventListener("click", () => {
            const i = Number(node.dataset.index);
            suggestionItems[i].onClick();
            clearSuggestions();
          });
        });
      }

      function getPinSuggestions(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        const day = Number(daySlider.value);
        return PINS
          .filter(pin => {
            const matchesName = pin.name.toLowerCase().includes(q);
            const matchesSpring = day >= pin.gghStartSp && day <= pin.gghEndSp;
            const matchesFall = day >= pin.gghStartFa && day <= pin.gghEndFa;
            const matchesDay = showAll ? true : (matchesSpring || matchesFall);
            return matchesName && matchesDay;
          })
          .slice(0, 5)
          .map(pin => ({
            main: pin.name,
            sub: pin.tag,
            onClick: () => {
              searchInput.value = pin.name;
              runSearch();
            }
          }));
      }

      async function getAddressSuggestions(query) {
        const bounds = map.getBounds();
        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth()
        ].join(",");
        const url =
          `${GEOCODE_BASE}/${encodeURIComponent(query)}.json` +
          `?bbox=${bbox}` +
          `&proximity=${MAP_CENTER[0]},${MAP_CENTER[1]}` +
          `&types=address,street` +
          `&limit=5` +
          `&key=${MAPTILER_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Address suggestion request failed");
        const data = await res.json();
        const features = data.features || [];
        return features.map(f => ({
          main: f.text || "Address result",
          sub: f.place_name || "",
          onClick: () => {
            searchInput.value = f.place_name || f.text || "";
            const [lng, lat] = f.center;
            map.flyTo({
              center: [lng, lat],
              zoom: Math.max(map.getZoom(), 14),
              essential: true
            });
            clickedLngLat = { lng, lat };
            clickedPinCameFromSearch = true;
            updateClickedSunsetPopup();
          }
        }));
      }

      async function updateSuggestions() {
        const query = searchInput.value.trim();
        if (!query) {
          clearSuggestions();
          return;
        }
        const token = ++latestSuggestToken;
        const pinSuggestions = getPinSuggestions(query);
        // show pin suggestions immediately
        renderSuggestions(pinSuggestions);
        clearTimeout(addressSuggestTimer);
        addressSuggestTimer = setTimeout(async () => {
          try {
            const addressSuggestions = await getAddressSuggestions(query);
            if (token !== latestSuggestToken) return;
            const merged = [...pinSuggestions, ...addressSuggestions].slice(0, 8);
            renderSuggestions(merged);
          } catch (err) {
            console.error(err);
            if (token !== latestSuggestToken) return;
            renderSuggestions(pinSuggestions);
          }
        }, 250);
      }

      let searchMarkerPopup = null;

      function parseCoordinates(query) {
        const q = query.trim();
        // accepts [lng,lat] [lng, lat] or [lng lat]
        const match = q.match(
          /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/
        );
        if (!match) return null;
        const a = Number(match[1]);
        const b = Number(match[2]);
        // if lat,lng (correct format)
        if (a >= -90 && a <= 90 && b >= -180 && b <= 180) {
          return { lat: a, lng: b };
        }
        // if lng,lat
        if (a >= -180 && a <= 180 && b >= -90 && b <= 90) {
          return { lat: b, lng: a };
        }
        return null;
      }

      function getPinsMatchingQuery(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return PINS.filter(pin =>
          pin.name.toLowerCase().includes(q)
        );
      }

      function getVisiblePinsByDay() {
        const day = Number(daySlider.value);
        return PINS.filter(pin => {
          const matchesSpring = day >= pin.gghStartSp && day <= pin.gghEndSp;
          const matchesFall = day >= pin.gghStartFa && day <= pin.gghEndFa;
          const matchesDay = showAll ? true : (matchesSpring || matchesFall);
          return matchesDay;
        });
      }

      async function searchAddressInMapBounds(query) {
        const bounds = map.getBounds();
        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth()
        ].join(",");
        const url =
          `${GEOCODE_BASE}/${encodeURIComponent(query)}.json` +
          `?bbox=${bbox}` +
          `&proximity=${MAP_CENTER[0]},${MAP_CENTER[1]}` +
          `&types=address,street` +
          `&limit=5` +
          `&key=${MAPTILER_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Geocoding request failed");
        const data = await res.json();
        return data.features || [];
      }

      async function runSearch() {
        const query = searchInput.value.trim();
        if (!query) {
          applyFilters();
          return;
        }

        // 1) exact/partial pin-name matches
        const pinMatches = getPinsMatchingQuery(query);
        if (pinMatches.length > 0) {
          const pin = pinMatches[0];
          const day = Number(daySlider.value);
          const matchesSpring = day >= pin.gghStartSp && day <= pin.gghEndSp;
          const matchesFall = day >= pin.gghStartFa && day <= pin.gghEndFa;
          const matchesDay = showAll ? true : (matchesSpring || matchesFall);
          if (!matchesDay) {
            searchPinnedResult = null;
            if (selectedPinPopup) {
              suppressSelectedPinClose = true;
              selectedPinPopup.remove();
              suppressSelectedPinClose = false;
              selectedPinPopup = null;
            }
            selectedPinLngLat = null;
            selectedPinProps = null;
            const source = map.getSource("pins");
            if (source) source.setData(buildGeoJSON([]));
            countLine.textContent = "No valid pin found for the selected date";
            return;
          }
          searchPinnedResult = pin;
          map.flyTo({
            center: [pin.lng, pin.lat],
            zoom: Math.max(map.getZoom(), 14),
            essential: true
          });
          selectedPinLngLat = { lng: pin.lng, lat: pin.lat };
          selectedPinProps = { ...pin };
          if (selectedPinPopup) {
            suppressSelectedPinClose = true;
            selectedPinPopup.remove();
            suppressSelectedPinClose = false;
          }
          applyFilters();
          selectedPinPopup = new maplibregl.Popup({ offset: 16, maxWidth: "280px" })
            .setLngLat([pin.lng, pin.lat])
            .setHTML(buildPopupHtml(pin))
            .addTo(map);
            selectedPinPopup.on("close", () => {
              if (suppressSelectedPinClose) return;
              selectedPinPopup = null;
              selectedPinLngLat = null;
              selectedPinProps = null;
              searchPinnedResult = null;
              searchInput.value = "";
              clearSuggestions();
              applyFilters();
            });
          return;
        }

        // 2) typed coordinates
        const coords = parseCoordinates(query);
        if (coords) {
          map.flyTo({
            center: [coords.lng, coords.lat],
            zoom: Math.max(map.getZoom(), 12),
            essential: true
          });
          clickedLngLat = { lng: coords.lng, lat: coords.lat };
          clickedPinCameFromSearch = true;
          updateClickedSunsetPopup();
          return;
        }

        // 3) address search restricted to current map frame
        try {
          const features = await searchAddressInMapBounds(query);
          if (features.length > 0) {
            const f = features[0];
            const [lng, lat] = f.center;
            map.flyTo({
              center: [lng, lat],
              zoom: Math.max(map.getZoom(), 12),
              essential: true
            });
            clickedLngLat = { lng, lat };
            clickedPinCameFromSearch = true;
            updateClickedSunsetPopup();
            return;
          }
          countLine.textContent = "No valid pin, address, or coordinate found";
        } catch (err) {
          console.error(err);
          countLine.textContent = "Search failed";
        }
      }

      function resetState() {
        searchInput.value = "";
        searchPinnedResult = null;
        showAll = true;
        showAllBtn.textContent = "Filter by Date";
        clickedLngLat = null;
        clickedPinCameFromSearch = false;
        const clickedSource = map.getSource("clicked-point");
        if (clickedSource) {
          clickedSource.setData({
            type: "FeatureCollection",
            features: []
          });
        }
        if (clickedPopup) {
          suppressClickedPopupClose = true;
          clickedPopup.remove();
          suppressClickedPopupClose = false;
          clickedPopup = null;
        }
        if (selectedPinPopup) {
          suppressSelectedPinClose = true;
          selectedPinPopup.remove();
          suppressSelectedPinClose = false;
          selectedPinPopup = null;
        }
        selectedPinLngLat = null;
        selectedPinProps = null;
        clearSuggestions();
        applyFilters();
      }

      function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const day = Number(daySlider.value);
        let visible;
        if (searchPinnedResult) {
          const pin = searchPinnedResult;
          const matchesSpring = day >= pin.gghStartSp && day <= pin.gghEndSp;
          const matchesFall = day >= pin.gghStartFa && day <= pin.gghEndFa;
          const matchesDay = showAll ? true : (matchesSpring || matchesFall);
          visible = matchesDay ? [pin] : [];
        } else {
          visible = PINS.filter(pin => {
            const matchesSearch =
              query === "" ||
              pin.name.toLowerCase().includes(query);
            const matchesSpring = day >= pin.gghStartSp && day <= pin.gghEndSp;
            const matchesFall = day >= pin.gghStartFa && day <= pin.gghEndFa;
            const matchesDay = showAll ? true : (matchesSpring || matchesFall);
            return matchesSearch && matchesDay;
          });
        }
        if (selectedPinPopup && selectedPinProps) {
          const selectedName = String(selectedPinProps.name || "");
          const stillVisible = visible.some(pin => pin.name === selectedName);
          if (!stillVisible) {
            suppressSelectedPinClose = true;
            selectedPinPopup.remove();
            suppressSelectedPinClose = false;
            selectedPinPopup = null;
            selectedPinLngLat = null;
            selectedPinProps = null;
          }
        }
        if (searchPinnedResult) {
          const stillVisible = visible.length > 0;
          if (!stillVisible && selectedPinPopup) {
            suppressSelectedPinClose = true;
            selectedPinPopup.remove();
            suppressSelectedPinClose = false;
            selectedPinPopup = null;
            selectedPinLngLat = null;
            selectedPinProps = null;
            searchPinnedResult = null;
            searchInput.value = "";
          }
        }
        const source = map.getSource("pins");
        if (source) source.setData(buildGeoJSON(visible));
        const n = visible.length;
        countLine.textContent = `Showing ${n} pin${n === 1 ? "" : "s"} of ${PINS.length}`;
      }

      searchInput.addEventListener("input", () => {
        searchPinnedResult = null;
        applyFilters();
        updateSuggestions();
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          clearSuggestions();
          runSearch();
        }
      });

      searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim()) {
          updateSuggestions();
        }
      });

      searchInput.addEventListener("click", () => {
        if (searchInput.value.trim()) {
          updateSuggestions();
        }
      });

      resetBtn.addEventListener("click", resetState);

      showAllBtn.addEventListener("click", () => {
        showAll = !showAll;
        showAllBtn.textContent = showAll ? "Filter by Date" : "Show All Pins";
        applyFilters();
      });

      document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsEl.contains(e.target)) {
          clearSuggestions();
        }
      });

      pinSortSelect.addEventListener("change", () => {
        renderPinMenu();
      });

      pinMenuToggle.addEventListener("click", () => {
        pinMenuList.classList.toggle("hidden");
        pinMenuToggle.textContent = pinMenuList.classList.contains("hidden") ? "Show" : "Hide";
      });

    /* ============================================================
       Section 6 — DAY SLIDER
       ============================================================ */
      let showAll = true;

      const daySlider = document.getElementById("daySlider");
      const dayNum = document.getElementById("dayNum");
      const dateDisplay = document.getElementById("dateDisplay");
      const todayBtn = document.getElementById("todayBtn");

      const TIMEZONE = "America/Los_Angeles";
      let currentYear = new Date().getFullYear();

      function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      }
      const MAX_DOY = isLeapYear(currentYear) ? 366 : 365;
      daySlider.max = String(MAX_DOY);

      // convert doy to formatted PST date
      function doyToDateStr(doy, year = currentYear) {
        // 01/01 in PST
        const d = new Date(currentYear, 0, 1);
        d.setDate(Number(doy));
        return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      }

      // get today's PST doy
      function getTodayDOY() {
        const now = new Date();
        const start = new Date(currentYear, 0, 1);
        return Math.floor((now - start) / 86400000) + 1;
      }

      function setDay(doy) {
        const v = Math.min(MAX_DOY, Math.max(1, Number(doy)));
        daySlider.value = v;
        dayNum.textContent = v;
        dateDisplay.textContent = doyToDateStr(v);

        if (map.isStyleLoaded()) {
          const regionSource = map.getSource("valid-region");
          if (regionSource) {
            regionSource.setData(buildBoundaryFillGeoJSON(v));
          }
          applyFilters();
          if (document.activeElement === searchInput && searchInput.value.trim()) {
            updateSuggestions();
          }
          updateClickedSunsetPopup();
          updateSelectedPinPopup();
          renderPinMenu();
        }
      }

      daySlider.addEventListener("input", (e) => {
        setDay(e.target.value);
      });

      todayBtn.addEventListener("click", () => {
        setDay(getTodayDOY());
      });

      // initialize
      setDay(1);

    /* ============================================================
        Section 7 — MATH FUNCTIONS
        ============================================================ */
      function degToRad(deg) {
        return deg * Math.PI / 180;
      }

      function radToDeg(rad) {
        return rad * 180 / Math.PI;
      }

      // bearing from observer to target from true north
      function bearingDeg(fromLng, fromLat, toLng, toLat) {
        const phi1 = degToRad(fromLat);
        const phi2 = degToRad(toLat);
        const lambda1 = degToRad(fromLng);
        const lambda2 = degToRad(toLng);

        const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
        const x =
          Math.cos(phi1) * Math.sin(phi2) -
          Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);

        return (radToDeg(Math.atan2(y, x)) + 360) % 360;
      }

      // smallest signed angular difference a-b in (-180, 180]
      function signedAngleDiff(a, b) {
        return ((a - b + 540) % 360) - 180;
      }

      function normalize360(angle) {
        return ((angle % 360) + 360) % 360;
      }

      function angularWidth(a, b) {
        return Math.abs(signedAngleDiff(a, b));
      }

      function sunsetUTC(dayNum, year = currentYear, lat, lng) {
        const PI = Math.PI;
        const zen = 90.833;
        const gA = 18;
        const daysThisYear = isLeapYear(year) ? 366 : 365;
        const d = new Date(Date.UTC(year, 0, dayNum)); // midnight UTC of dayNum

        // first pass
        const gammaA = 2 * PI / daysThisYear * (dayNum - 1 + (gA - 12) / 24);
        const eqA = 229.18 * (
          0.000075 +
          0.001868 * Math.cos(gammaA) -
          0.032077 * Math.sin(gammaA) -
          0.014615 * Math.cos(2 * gammaA) -
          0.040849 * Math.sin(2 * gammaA)
        );

        const decA =
          0.006918 -
          0.399912 * Math.cos(gammaA) +
          0.070257 * Math.sin(gammaA) -
          0.006758 * Math.cos(2 * gammaA) +
          0.000907 * Math.sin(2 * gammaA) -
          0.002697 * Math.cos(3 * gammaA) +
          0.00148 * Math.sin(3 * gammaA);

        const haA = radToDeg(
          Math.acos(
            Math.cos(degToRad(zen)) /
              (Math.cos(degToRad(lat)) * Math.cos(decA)) -
            Math.tan(degToRad(lat)) * Math.tan(decA)
          )
        );

        const smA = 720 - 4 * lng - eqA + 4 * haA;

        // second pass
        const gB = smA / 60;
        const gammaB = 2 * PI / daysThisYear * (dayNum - 1 + (gB - 12) / 24);

        const eqB = 229.18 * (
          0.000075 +
          0.001868 * Math.cos(gammaB) -
          0.032077 * Math.sin(gammaB) -
          0.014615 * Math.cos(2 * gammaB) -
          0.040849 * Math.sin(2 * gammaB)
        );

        const decB =
          0.006918 -
          0.399912 * Math.cos(gammaB) +
          0.070257 * Math.sin(gammaB) -
          0.006758 * Math.cos(2 * gammaB) +
          0.000907 * Math.sin(2 * gammaB) -
          0.002697 * Math.cos(3 * gammaB) +
          0.00148 * Math.sin(3 * gammaB);

        const haB = radToDeg(
          Math.acos(
            Math.cos(degToRad(zen)) /
              (Math.cos(degToRad(lat)) * Math.cos(decB)) -
            Math.tan(degToRad(lat)) * Math.tan(decB)
          )
        );

        const smB = 720 - 4 * lng - eqB + 4 * haB;

        // convert to date in UTC
        return new Date(d.getTime() + smB * 60000);
      }

      function sunsetLocalTime(dayNum, lat, lng, year = currentYear) {
        const sunset = sunsetUTC(dayNum, year, lat, lng);
        return sunset.toLocaleTimeString("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "short"
        });
      }

      function dayFrac(dayNum, lat, lng, year = currentYear) {
        const sunset = sunsetUTC(dayNum, year, lat, lng);
        const startOfYear = new Date(Date.UTC(year, 0, 1));
        return (sunset - startOfYear) / 86400000 + 1;
      }

      function sunsetDeclination(dayFraction, daysThisYear) {
        return radToDeg(
          0.006918
          - 0.399912 * Math.cos((2 * Math.PI * (dayFraction - 1)) / daysThisYear)
          + 0.070257 * Math.sin((2 * Math.PI * (dayFraction - 1)) / daysThisYear)
          - 0.006758 * Math.cos((4 * Math.PI * (dayFraction - 1)) / daysThisYear)
          + 0.000907 * Math.sin((4 * Math.PI * (dayFraction - 1)) / daysThisYear)
          - 0.002697 * Math.cos((6 * Math.PI * (dayFraction - 1)) / daysThisYear)
          + 0.00148  * Math.sin((6 * Math.PI * (dayFraction - 1)) / daysThisYear)
        );
      }

      function sunsetAzimuth(dayFraction, lat, year = currentYear) {
        const daysThisYear = isLeapYear(year) ? 366 : 365;
        const declDeg = sunsetDeclination(dayFraction, daysThisYear);
        const val = Math.sin(degToRad(declDeg)) / Math.cos(degToRad(lat));
        const clamped = Math.max(-1, Math.min(1, val));
        return ((360 - radToDeg(Math.acos(clamped))) % 360) + 0.5;
      }

      function getBridgeBounds(lng, lat) {
        const thetaMid = bearingDeg(lng, lat, MIDPOINT[0], MIDPOINT[1]);
        const thetaNorth = bearingDeg(lng, lat, NORTH_TOWER[0], NORTH_TOWER[1]);
        const thetaSouth = bearingDeg(lng, lat, SOUTH_TOWER[0], SOUTH_TOWER[1]);

        const bridgeDelta = angularWidth(thetaSouth, thetaNorth);
        const allowedDelta = bridgeDelta / 3;
        const center = thetaMid;
        const upper = normalize360(center + allowedDelta / 2);
        const lower = normalize360(center - allowedDelta / 2);

        return {
          thetaMid,
          thetaNorth,
          thetaSouth,
          bridgeDelta,
          allowedDelta,
          center,
          upper,
          lower
        };
      }

      // residual = 0 exactly on the requested boundary
      function boundaryResidual(dayNum, lat, lng, side) {
        const dayFraction = dayFrac(dayNum, lat, lng, currentYear);
        const sunAz = sunsetAzimuth(dayFraction, lat, currentYear);
        const bounds = getBridgeBounds(lng, lat);

        if (side === "upper") {
          return signedAngleDiff(sunAz, bounds.upper);
        }
        return signedAngleDiff(sunAz, bounds.lower);
      }

      // find latitude for one longitude
      function findBoundaryLatAtLng(dayNum, lng, side) {
        const step = GRID_STEP_DEG;
        let prevLat = GRID_LAT_MIN;
        let prevVal = boundaryResidual(dayNum, prevLat, lng, side);

        for (let lat = GRID_LAT_MIN + step; lat <= GRID_LAT_MAX; lat += step) {
          const val = boundaryResidual(dayNum, lat, lng, side);

          if (Math.abs(val) < 1e-8) {
            return lat;
          }

          if ((prevVal < 0 && val > 0) || (prevVal > 0 && val < 0)) {
            let loLat = prevLat;
            let hiLat = lat;
            let loVal = prevVal;
            let hiVal = val;

            for (let i = 0; i < 32; i++) {
              const midLat = (loLat + hiLat) / 2;
              const midVal = boundaryResidual(dayNum, midLat, lng, side);

              if (Math.abs(midVal) < 1e-8) {
                return midLat;
              }

              if ((loVal < 0 && midVal > 0) || (loVal > 0 && midVal < 0)) {
                hiLat = midLat;
                hiVal = midVal;
              } else {
                loLat = midLat;
                loVal = midVal;
              }
            }

            return (loLat + hiLat) / 2;
          }

          prevLat = lat;
          prevVal = val;
        }

        return null;
      }

      function buildBoundaryFillGeoJSON(dayNum) {
        if (dayNum >= 83 && dayNum <= 261) {
          return {
            type: "FeatureCollection",
            features: []
          };
        }

        const rows = [];

        for (let lng = GRID_LNG_MIN; lng <= GRID_LNG_MAX; lng += GRID_STEP_DEG) {
          const upperLat = findBoundaryLatAtLng(dayNum, lng, "upper");
          const lowerLat = findBoundaryLatAtLng(dayNum, lng, "lower");

          if (upperLat !== null && lowerLat !== null && upperLat >= lowerLat) {
            rows.push({
              lng,
              upper: upperLat,
              lower: lowerLat
            });
          }
        }

        if (rows.length < 2) {
          return {
            type: "FeatureCollection",
            features: []
          };
        }

        const segments = [];
        let current = [rows[0]];

        for (let i = 1; i < rows.length; i++) {
          const prev = rows[i - 1];
          const curr = rows[i];

          if (curr.lng - prev.lng <= GRID_STEP_DEG * 1.5) {
            current.push(curr);
          } else {
            if (current.length >= 2) segments.push(current);
            current = [curr];
          }
        }

        if (current.length >= 2) {
          segments.push(current);
        }

        if (segments.length === 0) {
          return {
            type: "FeatureCollection",
            features: []
          };
        }

        let bestSegment = segments[0];
        for (const seg of segments) {
          if (seg.length > bestSegment.length) {
            bestSegment = seg;
          }
        }

        const upperCoords = bestSegment.map(p => [p.lng, p.upper]);
        const lowerCoords = bestSegment.map(p => [p.lng, p.lower]).reverse();
        const ring = [...upperCoords, ...lowerCoords, upperCoords[0]];

        return {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [ring]
              },
              properties: {}
            }
          ]
        };
      }

      function updateClickedSunsetPopup() {
        if (!clickedLngLat) return;
        const { lng, lat } = clickedLngLat;
        const day = Number(daySlider.value);
        const sunsetStr = sunsetLocalTime(day, lat, lng, currentYear);

        if (clickedPopup) {
          suppressClickedPopupClose = true;
          clickedPopup.remove();
          suppressClickedPopupClose = false;
        }
        const clickedSource = map.getSource("clicked-point");
        if (clickedSource) {
          clickedSource.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [lng, lat]
                },
                properties: {}
              }
            ]
          });
        }

        clickedPopup = new maplibregl.Popup({ offset: 14, maxWidth: "240px" })
          .setLngLat([lng, lat])
          .setHTML(`
            <div class="popup-body">
              <div class="popup-name">Dropped Pin</div>
              <div class="popup-row"><strong>Coordinates:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
              <div class="popup-row"><strong>Today's Date:</strong> ${doyToDateStr(day)}</div>
              <div class="popup-row"><strong>Sunset Time:</strong> ${sunsetStr}</div>
            </div>
          `)
          .addTo(map);

          clickedPopup.on("close", () => {
            if (suppressClickedPopupClose) return;
            const shouldClearSearch = clickedPinCameFromSearch;
            clickedPopup = null;
            clickedLngLat = null;
            clickedPinCameFromSearch = false;
            const clickedSource = map.getSource("clicked-point");
            if (clickedSource) {
              clickedSource.setData({
                type: "FeatureCollection",
                features: []
              });
            }
            if (shouldClearSearch) {
              searchInput.value = "";
              clearSuggestions();
            }
            applyFilters();
          });
      }

      function updateSelectedPinPopup() {
        if (!selectedPinLngLat || !selectedPinProps) return;
        if (selectedPinPopup) {
          suppressSelectedPinClose = true;
          selectedPinPopup.remove();
          suppressSelectedPinClose = false;
        }
        selectedPinPopup = new maplibregl.Popup({ offset: 16, maxWidth: "280px" })
          .setLngLat([selectedPinLngLat.lng, selectedPinLngLat.lat])
          .setHTML(buildPopupHtml(selectedPinProps))
          .addTo(map);
        selectedPinPopup.on("close", () => {
          if (suppressSelectedPinClose) return;
          selectedPinPopup = null;
          selectedPinLngLat = null;
          selectedPinProps = null;
        });
      }

    /* ============================================================
        Section 8 — HELP POPUP
        ============================================================ */
        const helpModal = document.getElementById("helpModal");
        const closeHelp = document.getElementById("closeHelp");

        helpText.addEventListener("click", () => {
          helpModal.classList.remove("hidden");
        });

        closeHelp.addEventListener("click", () => {
          helpModal.classList.add("hidden");
        });

        helpModal.addEventListener("click", (e) => {
          if (e.target === helpModal) {
            helpModal.classList.add("hidden");
          }
        });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="ggh-map-wrapper">
      <div ref={mapContainer} className="ggh-map" />

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">GGH Locations</span>
          <span className="panel-subtitle" id="helpText">
            Click here for help using this site
          </span>
        </div>

        <div className="search-row">
          <input
            id="search"
            type="search"
            placeholder="Search by pin name, address, or coordinates"
          />
          <button className="btn" id="resetBtn">Reset</button>
        </div>

        <div id="searchSuggestions" className="search-suggestions" />

        <div className="slider-section">
          <div className="slider-header">
            <div className="slider-left">
              <span className="slider-label">
                Day <span id="dayNum">1</span>
              </span>
              <span className="slider-divider">/</span>
              <span className="slider-date" id="dateDisplay">Jan 01</span>
            </div>
            <button className="btn" id="todayBtn">Today</button>
          </div>

          <input id="daySlider" type="range" min="1" max="365" step="1" defaultValue="1" />
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot on-campus" />
            <span>On-Campus</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot off-campus" />
            <span>Off-Campus</span>
          </div>
        </div>

        <div className="bottom-row">
          <div className="count-line" id="countLine" />
          <button className="btn" id="showAllBtn">Filter by Date</button>
        </div>
      </div>
    </div>
  );
};

export default GGHMap;
