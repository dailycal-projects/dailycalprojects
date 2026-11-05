// The Golden Gate Henge map (GGHengeInteractive.astro's script). generate-gold-band.cjs reads its constants and
// calendar and geometry functions to precompute gold-band.js, so regenerate that after changing them.
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// These set globalThis.GGHEphemeris, GGHSolar and GGHBandData, in this order
import "./solar-ephemeris.js";
import "./solar-calculations.js";
import "./gold-band.js";

    /* ============================================================
       Section 1 — PINS LIST
       Format: { 
          name: string,
          photo: string,
          lat: int,
          lng: int,
          tag: string,
          travel: array of eligible travel modes,
          notes: string
       ============================================================ */
      // Pin windows are computed at startup from the JPL DE440 data.
      // Dates use a continuous day index from Jan 1, 2026 (day 1).
      // Fall covers Sep–Dec 2026; spring covers Jan–March 2027. The slider starts Oct 1.
      // Travel review, route times, and sources: TRAVEL_ACCESS.md.
      const PINS = [
        { name: "Albany Bulb", lat: 37.8888190128995, lng: -122.327415343957, tag: "Off-Campus", travel: ["bike", "drive"], notes: "" },
        { name: "Indian Rock Park", lat: 37.8922186297827, lng: -122.273079038403, tag: "Off-Campus", travel: ["bike", "transit", "drive"], notes: "View accessible from top of the climbing rock." },
        { name: "Grotto Rock Park", lat: 37.8934271576909, lng: -122.268772249069, tag: "Off-Campus", travel: ["bike", "transit", "drive"], notes: "View accessible from top of the climbing rock." },
        { name: "Seaview Trail Vista", lat: 37.8941055046049, lng: -122.234256937359, tag: "Off-Campus", travel: ["hike"], notes: "" },
        { name: "Cesar Chavez Park (north end)", lat: 37.874363168464, lng: -122.324623478546, tag: "Off-Campus", travel: ["bike", "drive"], notes: "" },
        { name: "Cesar Chavez Park (south end)", lat: 37.8696703920424, lng: -122.320255234011, tag: "Off-Campus", travel: ["bike", "drive"], notes: "" },
        { name: "Bay View Place", lat: 37.8843472745503, lng: -122.262806137463, tag: "Off-Campus", travel: ["walk", "bike", "transit", "drive"], notes: "" },
        { name: "Atlas Path Vista", lat: 37.8868405145148, lng: -122.25041512177, tag: "Off-Campus", travel: ["transit", "drive"], notes: "" },
        { name: "Berkeley Bay Vista", lat: 37.8804262480801, lng: -122.247626549108, tag: "Off-Campus", travel: ["transit", "drive"], notes: "" },
        { name: "Lawrence Hall of Science", lat: 37.878412, lng: -122.247044, tag: "Off-Campus", travel: ["transit", "drive"], notes: "Though admission is free for UC Berkeley students, the Lawrence Hall of Science closes at 5pm, which is before sunset." },
        { name: "Grizzly Peak (main pullout)", lat: 37.8812286530182, lng: -122.231515513766, tag: "Off-Campus", travel: ["drive"], notes: "" },
        { name: "Big C", lat: 37.8745311105514, lng: -122.249589757626, tag: "On-Campus", travel: ["hike"], notes: "" },
        { name: "Brickyard Cove (Berkeley Marina)", lat: 37.8598142764415, lng: -122.305735651139, tag: "Off-Campus", travel: ["bike", "transit", "drive"], notes: "" },
        { name: "Picnic View Ridge", lat: 37.871545273863, lng: -122.22968464953, tag: "Off-Campus", travel: ["hike"], notes: "" },
        { name: "Grizzly Peak (giant log pullout)", lat: 37.8722073897154, lng: -122.220588331848, tag: "Off-Campus", travel: ["drive"], notes: "" },
        { name: "Clark Kerr Track", lat: 37.8647545004258, lng: -122.24647976126, tag: "On-Campus", travel: ["walk", "bike", "transit", "drive"], notes: "" },
        { name: "Stonewall-Panoramic Trail Vista", lat: 37.8655644745048, lng: -122.240581102592, tag: "Off-Campus", travel: ["hike"], notes: "" },
        { name: "Grizzly Peak (KPFA Tower pullout)", lat: 37.8651820930087, lng: -122.222135855337, tag: "Off-Campus", travel: ["drive"], notes: "" },
        { name: "Point Emery", lat: 37.8457293526268, lng: -122.302198015687, tag: "Off-Campus", travel: ["bike", "drive"], notes: "" },
        { name: "Emeryville Marina Park", lat: 37.8424286024585, lng: -122.314367444065, tag: "Off-Campus", travel: ["transit", "drive"], notes: "" },
        { name: "Mount Diablo Summit Visitor Center", lat: 37.8818042559832, lng: -121.914290020331, tag: "Off-Campus", travel: ["drive"], notes: "Due to the distance from the Golden Gate Bridge, very clear visiblilty is required to see it from Mount Diablo." },
        { name: "Treasure Island (Northwest corner)", lat: 37.8303856995793, lng: -122.377617269266, tag: "Off-Campus", travel: ["transit", "drive"], notes: "$8.50 toll is collected heading westbound on the Bay Bridge to Treasure Island." },
        { name: "Alcatraz Viewpoint (Barker Beach)", lat: 37.8268929527263, lng: -122.424130452215, tag: "Off-Campus", travel: ["ferry"], notes: "The Alcatraz ferry is the only authorized way to reach the island. Adult tickets sell for roughly $45-60 and can sell out 90 days in advance." },
        { name: "Evans Hall 10th floor balcony", lat: 37.8734336917814, lng: -122.258000827204, tag: "On-Campus", travel: ["walk", "bike", "transit"], notes: "Access to the balcony is blocked off, but the sunset can be viewed from inside the building." },
        { name: "Graduate Theological Union balcony", lat: 37.8754152586105, lng: -122.262049887252, tag: "On-Campus", travel: ["walk", "bike", "transit", "drive"], notes: "" },
        { name: "Ridge Path", lat: 37.8764686028796, lng: -122.263984471867, tag: "On-Campus", travel: ["walk", "bike", "transit", "drive"], notes: "" },
        { name: "California Memorial Stadium Concourse", lat: 37.8704318904843, lng: -122.251501483844, tag: "On-Campus", travel: ["walk", "bike", "transit", "drive"], notes: "Entry to the stadium is prohibited except on game days." },
        { name: "Campanile (top)", lat: 37.8720578106133, lng: -122.25787494319, tag: "On-Campus", travel: ["walk", "bike", "transit"], notes: "Access to the top closes at 5pm on weekdays and 5:30pm on weekends, which is before sunset." },
        { name: "Panoramic Way Vista", lat: 37.867570, lng: -122.240232, tag: "Off-Campus", travel: ["drive", "bike", "hike"], notes: "The last section of Panoramic Way to this location is a private road." },
        { name: "Campanile Way steps", lat: 37.871886, lng: -122.258556, tag: "On-Campus", travel: ["walk", "transit", "bike"], notes: "" },
        { name: "Bancroft Parking Structure (top)", lat: 37.869610, lng: -122.256112, tag: "On-Campus", travel: ["walk", "transit", "bike"], notes: "" },
        { name: "Remillard Park", lat: 37.89231079459089, lng: -122.26118831536431, tag: "Off-Campus", travel: ["bike", "transit", "drive"], notes: "View accessible from top of the climbing rock." },
        { name: "Skyline Overlook", lat: 37.848075, lng: -122.201340, tag: "Off-Campus", travel: ["drive"], notes: "" },
      ];

    /* ============================================================
       Section 2 — MAP SETTINGS
       ============================================================ */
      const IS_MOBILE = window.innerWidth <= 900 || (window.innerWidth <= 1100 && window.innerHeight <= 500);
      const MAPTILER_STYLE = "https://api.maptiler.com/maps/voyager-v2/style.json?key=cv2lryclk9tg1QR6KCLy";
      const MAP_CENTER = IS_MOBILE ? [-122.2730, 37.89277]: [-122.2730, 37.8715];
      const START_ZOOM = IS_MOBILE ? 10.6 : 11.4;

      const MAPTILER_KEY = "cv2lryclk9tg1QR6KCLy";
      const GEOCODE_BASE = "https://api.maptiler.com/geocoding";

      const COLOR_ON   = "#6f8fb8";
      const COLOR_OFF  = "#b87a6f";
      const COLOR_BAND = "#c7ab4b";
      const COLOR_TEXT = "#1f2328";
      const COLOR_PANEL_BG = "rgba(250, 248, 244, 0.86)";
      const COLOR_PANEL_BORDER = "rgba(60, 52, 46, 0.14)";

      const PIN_RADIUS = 8;
      const PIN_TOUCH_RADIUS = 22;

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
      let preparedBandSource = false;
      let displayedBandDay = null;
      let renderedMenuKey = null;
      let visiblePinsKey = null;
      let visiblePinsSource = null;
      let selectedPinLngLat = null;
      let selectedPinProps = null;
      let suppressSelectedPinClose = false;

    /* ============================================================
       Section 3 — MAP INIT
       ============================================================ */
      
      const map = new maplibregl.Map({
      container: "map",
      style: MAPTILER_STYLE,
      center: MAP_CENTER,
      zoom: START_ZOOM,
      minZoom: 10,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      function setPopupForeground(foreground) {
        document.getElementById("map").classList.toggle("popups-behind-controls", !foreground);
      }

      const popupPreservingControls = "#daySlider, #todayBtn, button.legend-item, .maplibregl-ctrl-zoom-in, .maplibregl-ctrl-zoom-out";
      let popupPreservingGesture = false;
      let popupDragOrigin = null;
      let popupGestureDragged = false;

      function lowerPopupCoveredByMenu() {
        const popup = document.querySelector(".maplibregl-popup-content");
        if (!popup) return;
        const bounds = popup.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const covered = Array.from(document.querySelectorAll(".panel, .pin-menu-wrap")).some(menu => {
          const menuBounds = menu.getBoundingClientRect();
          return menuBounds.width > 0 && menuBounds.height > 0 &&
            bounds.left >= menuBounds.left && bounds.right <= menuBounds.right &&
            bounds.top >= menuBounds.top && bounds.bottom <= menuBounds.bottom;
        });
        if (covered) setPopupForeground(false);
      }

      let popupMapDragActive = false;
      let popupOverlapFrame = null;
      function schedulePopupOverlapCheck() {
        if (popupOverlapFrame !== null) return;
        popupOverlapFrame = requestAnimationFrame(() => {
          popupOverlapFrame = null;
          lowerPopupCoveredByMenu();
        });
      }
      map.on("dragstart", () => { popupMapDragActive = true; });
      map.on("move", () => {
        if (popupMapDragActive) schedulePopupOverlapCheck();
      });
      map.on("moveend", () => {
        if (popupMapDragActive) schedulePopupOverlapCheck();
        popupMapDragActive = false;
      });

      function updatePopupLayerFromTarget(event) {
        // Date, tag, and zoom controls preserve the popup's current layer.
        if (event.target.closest(popupPreservingControls)) return;
        if (event.target.closest(".maplibregl-popup")) {
          setPopupForeground(true);
        } else if (!event.target.closest(".maplibregl-canvas-container")) {
          setPopupForeground(false);
        }
      }
      // Capture first: selecting a menu result can then raise its new popup.
      document.addEventListener("pointerdown", (event) => {
        popupPreservingGesture = !!event.target.closest(popupPreservingControls);
        popupDragOrigin = event.target.closest(".maplibregl-canvas-container, .maplibregl-popup")
          ? { x: event.clientX, y: event.clientY, pointerId: event.pointerId } : null;
        popupGestureDragged = false;
        updatePopupLayerFromTarget(event);
      }, true);
      function trackPopupGestureMovement(event) {
        if (!popupDragOrigin || event.pointerId !== popupDragOrigin.pointerId) return;
        if (Math.hypot(event.clientX - popupDragOrigin.x, event.clientY - popupDragOrigin.y) > 3) {
          popupGestureDragged = true;
        }
      }
      document.addEventListener("pointermove", trackPopupGestureMovement, true);
      document.addEventListener("pointerup", (event) => {
        trackPopupGestureMovement(event);
        if (popupGestureDragged) schedulePopupOverlapCheck();
      }, true);
      document.addEventListener("pointercancel", () => {
        popupPreservingGesture = false;
        popupDragOrigin = null;
        popupGestureDragged = false;
      }, true);
      document.addEventListener("click", (event) => {
        const preserveLayer = popupPreservingGesture && event.detail !== 0;
        const endedDrag = popupGestureDragged && event.detail !== 0;
        popupPreservingGesture = false;
        popupDragOrigin = null;
        popupGestureDragged = false;
        if (endedDrag) {
          // A drag release is not a fresh click on the menu beneath the mouse.
          event.preventDefault();
          event.stopPropagation();
          schedulePopupOverlapCheck();
          return;
        }
        if (preserveLayer) {
          // A release outside the control can target a shared ancestor or the map.
          if (!event.target.closest(popupPreservingControls)) {
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        updatePopupLayerFromTarget(event);
      }, true);

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
              travel: JSON.stringify(pin.travel),
              notes: pin.notes || ""
            }
          }))
        };
      }

      const TRAVEL_MODES = {
        walk: { emoji: "🚶", label: "Walk", description: "On campus or at most 30 minutes walking from 37.870236, -122.259506" },
        bike: { emoji: "🚲", label: "Bike", description: "At most 30 minutes cycling from 37.870236, -122.259506 on roads below 40 mph" },
        transit: { emoji: "🚌", label: "Transit", description: "Bus or train stop within a 15-minute walk" },
        hike: { emoji: "⛰️", label: "Hike", description: "Hike to the viewing location" },
        drive: { emoji: "🚗", label: "Drive", description: "Car access to the location or nearby park or trail entrance" },
        ferry: { emoji: "⛴️", label: "Ferry", description: "Ferry required to reach the island" }
      };


      // MapLibre serializes arrays into strings in clicked feature properties.
      function getTravelModes(pin) {
        return typeof pin.travel === "string" ? JSON.parse(pin.travel) : (pin.travel || []);
      }

      function travelTags(pin) {
        if (!getTravelModes(pin).length) return "";
        return `<span class="travel-modes">${getTravelModes(pin).map(key => {
          const mode = TRAVEL_MODES[key];
          return `<span class="travel-icon popup-travel-tag" role="img" aria-label="${mode.label}" title="${mode.description}">${mode.emoji}</span>`;
        }).join("")}</span>`;
      }

      function buildPopupHtml(props) {
        const tagClass = props.tag === "On-Campus" ? "on-campus" : "off-campus";

        const spStart = props.gghStartSp;
        const spEnd   = props.gghEndSp;
        const faStart = props.gghStartFa;
        const faEnd   = props.gghEndFa;

        const springLine = formatDateRange(spStart, spEnd);
        const fallLine = formatDateRange(faStart, faEnd);

        const currentDay = Number(daySlider.value);
        const todaySunset = sunsetLocalTime(currentDay, Number(props.lat), Number(props.lng));

        const dateHtml =
          `<div class="popup-row"><strong>Fall 2026 Dates:</strong> ${fallLine}</div>
            <div class="popup-row"><strong>Spring 2027 Dates:</strong> ${springLine}</div>`;

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
            <div class="popup-row"><strong>Selected Date:</strong> ${doyToDateStr(currentDay)}</div>
            <div class="popup-row"><strong>Sunset Time:</strong> ${todaySunset}</div>
            ${dateHtml}
            <span class="popup-tag ${tagClass}">${props.tag}</span>
            ${travelTags(props)}
            ${notesHtml}
          </div>
        `;
      }

      map.on("load", () => {
        map.addSource("pins", {
          type: "geojson",
          data: buildGeoJSON([])
        });

        const bandDays = globalThis.GGHBandData?.days;
        preparedBandSource = Boolean(bandDays &&
          Array.from({ length: MAX_DAY - MIN_DAY + 1 }, (_, i) => MIN_DAY + i)
            .every(day => bandDays[day]));
        map.addSource("valid-region", {
          type: "geojson",
          data: preparedBandSource ? {
            type: "FeatureCollection",
            features: Object.entries(bandDays).flatMap(([day, data]) =>
              data.features.map(feature => ({ ...feature, id: Number(day), properties: { day: Number(day) } })))
          } : buildBoundaryFillGeoJSON(Number(daySlider.value))
        });

        map.addLayer({
          id: "valid-region-fill",
          source: "valid-region",
          type: "fill",
          paint: {
            "fill-color": COLOR_BAND,
            "fill-opacity": preparedBandSource
              ? ["case", ["boolean", ["feature-state", "active"], false], 0.22, 0]
              : 0.22,
            "fill-opacity-transition": { duration: 0, delay: 0 }
          }
        });
        updateBandForDay(Number(daySlider.value));

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
            setPopupForeground(true);

            // clear dropped-pin popup
            clearDroppedPin();

            // clear previous selected red/blue pin popup
            if (selectedPinPopup) {
              suppressSelectedPinClose = true;
              selectedPinPopup.remove();
              suppressSelectedPinClose = false;
            }

            selectedPinLngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat };
            selectedPinProps = { ...e.features[0].properties };

            selectedPinPopup = new maplibregl.Popup({ closeOnClick: false, offset: 16, maxWidth: "280px" })
              .setLngLat([selectedPinLngLat.lng, selectedPinLngLat.lat])
              .setHTML(buildPopupHtml(selectedPinProps))
              .addTo(map);

            selectedPinPopup.on("close", () => {
              if (suppressSelectedPinClose) return;
              clearSelectedPin();
              applyFilters();
            });
          });

        });
        map.on("click", (e) => {
          const hitFeatures = map.queryRenderedFeatures(e.point, { layers: hitLayers });
          if (hitFeatures.length > 0) return;
          const droppedHits = map.queryRenderedFeatures([
            [e.point.x - PIN_TOUCH_RADIUS, e.point.y - PIN_TOUCH_RADIUS],
            [e.point.x + PIN_TOUCH_RADIUS, e.point.y + PIN_TOUCH_RADIUS]
          ], { layers: ["clicked-point-layer"] });
          if (clickedPopup && droppedHits.length) {
            setPopupForeground(true);
            return;
          }
          clearSelectedPin();
          applyFilters();
          clickedLngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat };
          clickedPinCameFromSearch = false;
          updateClickedSunsetPopup(true);
        });
        renderPinMenu();
        applyFilters();
      });

      function formatDateRange(start, end) {
        if (start == null || end == null) return "No dates in this period";
        return Number(start) === Number(end)
          ? doyToDateStr(Number(start), false)
          : `${doyToDateStr(Number(start), false)} – ${doyToDateStr(Number(end), false)}`;
      }

      function getSortedPins(sortMode) {
        const dateSorts = {
          "fall-start": ["gghStartFa", 1],
          "fall-end": ["gghEndFa", -1],
          "spring-start": ["gghStartSp", 1],
          "spring-end": ["gghEndSp", -1]
        };
        const dateSort = dateSorts[sortMode];
        return [...PINS].sort((a, b) => {
          if (dateSort) {
            const [field, direction] = dateSort;
            // Locations with no dates for the season always sort last.
            if (a[field] == null && b[field] != null) return 1;
            if (a[field] != null && b[field] == null) return -1;
            if (a[field] != null && b[field] != null) {
              const difference = direction * (a[field] - b[field]);
              if (difference) return difference;
            }
          }
          const nameOrder = a.name.localeCompare(b.name);
          return sortMode === "alphabet-reverse" ? -nameOrder : nameOrder;
        });
      }

      function renderPinMenu() {
        const pinMenuList = document.getElementById("pinMenuList");
        const pinSortSelect = document.getElementById("pinSortSelect");
        if (!pinMenuList || !pinSortSelect) return;
        const query = pinNameSearch.value.trim().toLowerCase();
        const sortedPins = getSortedPins(pinSortSelect.value).filter(pin =>
          matchesPinFilters(pin) && pin.name.toLowerCase().includes(query));
        const menuKey = JSON.stringify(sortedPins.map(pin => pin.name));
        if (menuKey === renderedMenuKey) return;
        renderedMenuKey = menuKey;
        pinMenuList.innerHTML = sortedPins.map(pin => {
          const springLine = formatDateRange(pin.gghStartSp, pin.gghEndSp);
          const fallLine = formatDateRange(pin.gghStartFa, pin.gghEndFa);
          return `
            <button class="pin-menu-item" data-pin-name="${pin.name}">
              <div class="pin-menu-item-name">${pin.name}</div>
              <div class="pin-menu-item-meta">Fall 2026 Dates: ${fallLine}</div>
              <div class="pin-menu-item-meta">Spring 2027 Dates: ${springLine}</div>
            </button>
          `;
        }).join("") || '<div class="pin-menu-empty">No pins match your search and filters.</div>';
        pinMenuList.querySelectorAll(".pin-menu-item").forEach(btn => {
          btn.addEventListener("click", async () => {
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
      const pinNameSearch = document.getElementById("pinNameSearch");
      const selectedCampusTags = new Set();
      const selectedTravelModes = new Set();
      const filterButtons = [
        ["filterOnCampus", selectedCampusTags, "On-Campus"],
        ["filterOffCampus", selectedCampusTags, "Off-Campus"],
        ...Object.keys(TRAVEL_MODES).map(key => ["filter" + key[0].toUpperCase() + key.slice(1), selectedTravelModes, key])
      ];

      function matchesPinFilters(pin) {
        const day = Number(daySlider.value);
        const matchesDay = showAll ||
          (pin.gghStartSp != null && day >= pin.gghStartSp && day <= pin.gghEndSp) ||
          (pin.gghStartFa != null && day >= pin.gghStartFa && day <= pin.gghEndFa);
        const matchesCampus = !selectedCampusTags.size || selectedCampusTags.has(pin.tag);
        const matchesTravel = !selectedTravelModes.size || getTravelModes(pin).some(mode => selectedTravelModes.has(mode));
        return matchesDay && matchesCampus && matchesTravel;
      }

      function updateFilterButtons() {
        filterButtons.forEach(([id, selected, key]) => {
          document.getElementById(id).setAttribute("aria-pressed", String(selected.has(key)));
        });
      }

      filterButtons.forEach(([id, selected, key]) => {
        if (TRAVEL_MODES[key]) document.getElementById(id).title = TRAVEL_MODES[key].description;
        document.getElementById(id).addEventListener("click", () => {
          if (selected.has(key)) selected.delete(key); else selected.add(key);
          updateFilterButtons();
          clearSuggestions();
          applyFilters();
        });
      });
      pinNameSearch.addEventListener("input", renderPinMenu);
      const suggestionsEl = document.getElementById("searchSuggestions");
      let suggestionItems = [];
      let addressSuggestTimer = null;
      let latestSuggestToken = 0;
      let searchPinnedResult = null;

      function clearSuggestions() {
        clearTimeout(addressSuggestTimer);
        latestSuggestToken++;
        suggestionItems = [];
        suggestionsEl.innerHTML = "";
      }

      function renderSuggestions(items) {
        suggestionItems = items;
        if (!items.length) {
          suggestionsEl.innerHTML = "";
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
            const item = suggestionItems[i];
            clearSuggestions();
            searchInput.blur();
            item.onClick();
          });
        });
      }

      function getPinSuggestions(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return PINS
          .filter(pin => pin.name.toLowerCase().includes(q) && matchesPinFilters(pin))
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
            updateClickedSunsetPopup(true);
          }
        }));
      }

      async function updateSuggestions() {
        clearSuggestions();
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
        clearSuggestions();
        searchInput.blur();
        const query = searchInput.value.trim();
        if (!query) {
          applyFilters();
          return;
        }

        // 1) exact/partial pin-name matches
        const pinMatches = getPinsMatchingQuery(query);
        if (pinMatches.length > 0) {
          clearDroppedPin();
          const pin = pinMatches[0];
          if (!matchesPinFilters(pin)) {
            searchPinnedResult = null;
            if (selectedPinPopup) {
              suppressSelectedPinClose = true;
              selectedPinPopup.remove();
              suppressSelectedPinClose = false;
              selectedPinPopup = null;
            }
            selectedPinLngLat = null;
            selectedPinProps = null;
            updateVisiblePins([]);
            countLine.textContent = "No pin matches the selected date and filters";
            return;
          }
          searchPinnedResult = pin;
          setPopupForeground(true);
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
          selectedPinPopup = new maplibregl.Popup({ closeOnClick: false, offset: 16, maxWidth: "280px" })
            .setLngLat([pin.lng, pin.lat])
            .setHTML(buildPopupHtml(pin))
            .addTo(map);
            selectedPinPopup.on("close", () => {
              if (suppressSelectedPinClose) return;
              clearSelectedPin();
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
          updateClickedSunsetPopup(true);
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
            updateClickedSunsetPopup(true);
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
        pinNameSearch.value = "";
        selectedCampusTags.clear();
        selectedTravelModes.clear();
        updateFilterButtons();
        searchPinnedResult = null;
        showAll = true;
        showAllBtn.textContent = "Filter by Date";
        clearDroppedPin();
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

      function clearDroppedPin() {
        clickedLngLat = null;
        clickedPinCameFromSearch = false;
        const source = map.getSource("clicked-point");
        if (source) source.setData({ type: "FeatureCollection", features: [] });
        if (clickedPopup) {
          suppressClickedPopupClose = true;
          clickedPopup.remove();
          suppressClickedPopupClose = false;
          clickedPopup = null;
        }
      }

      // Closing a selected pin clears its search without resetting the filters.
      function clearSelectedPin() {
        if (selectedPinPopup) {
          suppressSelectedPinClose = true;
          selectedPinPopup.remove();
          suppressSelectedPinClose = false;
        }
        selectedPinPopup = null;
        selectedPinLngLat = null;
        selectedPinProps = null;
        searchPinnedResult = null;
        searchInput.value = "";
        clearSuggestions();
      }

      function updateVisiblePins(visible) {
        const source = map.getSource("pins");
        if (!source) return;
        const key = JSON.stringify(visible.map(pin => pin.name));
        if (source === visiblePinsSource && key === visiblePinsKey) return;
        source.setData(buildGeoJSON(visible));
        visiblePinsSource = source;
        visiblePinsKey = key;
      }

      function applyFilters() {
        const selected = searchPinnedResult || selectedPinProps;
        if (selected && !matchesPinFilters(selected)) clearSelectedPin();
        const query = searchInput.value.trim().toLowerCase();
        const candidates = searchPinnedResult ? [searchPinnedResult] : PINS;
        const visible = candidates.filter(pin => matchesPinFilters(pin) &&
          (query === "" || pin.name.toLowerCase().includes(query)));
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
        updateVisiblePins(visible);
        const n = visible.length;
        countLine.textContent = `Showing ${n} pin${n === 1 ? "" : "s"} of ${PINS.length}`;
        renderPinMenu();
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
      const dateDisplay = document.getElementById("dateDisplay");
      const todayBtn = document.getElementById("todayBtn");

      const TIMEZONE = "America/Los_Angeles";
      const BASE_YEAR = 2026;
      const DAY_MS = 86400000;
      const MIN_DAY = 274; // Oct 1, 2026
      const MAX_DAY = 455; // March 31, 2027

      // UTC calendar arithmetic keeps slider dates independent of DST/browser timezone.
      function calendarDay(dayIndex) {
        const date = new Date(Date.UTC(BASE_YEAR, 0, Number(dayIndex)));
        const year = date.getUTCFullYear();
        const doy = Math.floor((date - Date.UTC(year, 0, 1)) / DAY_MS) + 1;
        return { date, year, doy };
      }

      function doyToDateStr(dayIndex, includeYear = true) {
        const date = calendarDay(dayIndex).date;
        return date.toLocaleDateString("en-US", {
          timeZone: "UTC", month: date.getUTCMonth() === 2 ? "long" : "short", day: "numeric", year: includeYear ? "numeric" : undefined
        });
      }

      function getTodayDOY() {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: TIMEZONE, year: "numeric", month: "numeric", day: "numeric"
        }).formatToParts(new Date());
        const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
        return Math.floor((Date.UTC(Number(values.year), Number(values.month) - 1,
          Number(values.day)) - Date.UTC(BASE_YEAR, 0, 1)) / DAY_MS) + 1;
      }

      function updateBandForDay(day) {
        const source = map.getSource("valid-region");
        if (!source || displayedBandDay === day) return;
        if (preparedBandSource) {
          // Keep geometry in the map; only update opacity for the old/new day.
          if (displayedBandDay !== null) {
            map.setFeatureState({ source: "valid-region", id: displayedBandDay }, { active: false });
          }
          map.setFeatureState({ source: "valid-region", id: day }, { active: true });
        } else {
          source.setData(buildBoundaryFillGeoJSON(day));
        }
        displayedBandDay = day;
      }

      function setDay(doy) {
        const v = Math.min(MAX_DAY, Math.max(MIN_DAY, Number(doy)));
        daySlider.value = v;
        dateDisplay.textContent = doyToDateStr(v);
        daySlider.setAttribute("aria-valuetext", dateDisplay.textContent);

        // Sources can be updating while a user drags the slider. Keep the
        // selected date, filters and popups in sync during those updates too.
        updateBandForDay(v);
        applyFilters();
        if (document.activeElement === searchInput && searchInput.value.trim()) {
          updateSuggestions();
        }
        updateClickedSunsetPopup();
        updateSelectedPinPopup();
      }

      daySlider.addEventListener("input", (e) => {
        setDay(e.target.value);
      });

      todayBtn.addEventListener("click", () => {
        setDay(getTodayDOY());
      });

      // Compute both seasons with the same model used by the band and popups.
      updatePinDateRanges();
      setDay(MIN_DAY);

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

      function sunsetForDay(dayIndex, lat, lng) {
        const { doy, year } = calendarDay(dayIndex);
        return GGHSolar.sunset(year, doy, lat, lng);
      }

      function sunsetLocalTime(dayIndex, lat, lng) {
        const sunset = sunsetForDay(dayIndex, lat, lng);
        if (!sunset) return "No sunset on this date";
        return new Date(sunset.timeMs).toLocaleTimeString("en-US", {
          timeZone: TIMEZONE,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "short"
        });
      }

      function calculatePinWindow(pin, firstDay, lastDay) {
        const bounds = getBridgeBounds(pin.lng, pin.lat);
        let start = null, end = null;
        for (let day = firstDay; day <= lastDay; day++) {
          const sunset = sunsetForDay(day, pin.lat, pin.lng);
          if (sunset && Math.abs(signedAngleDiff(sunset.azimuth, bounds.center)) <= bounds.allowedDelta / 2) {
            if (start === null) start = day;
            end = day;
          }
        }
        return { start, end };
      }

      function updatePinDateRanges() {
        for (const pin of PINS) {
          const fall = calculatePinWindow(pin, 244, 365); // Sep 1–Dec 31, 2026
          const spring = calculatePinWindow(pin, 366, MAX_DAY); // Jan 1–March 31, 2027
          Object.assign(pin, {
            gghStartFa: fall.start, gghEndFa: fall.end,
            gghStartSp: spring.start, gghEndSp: spring.end
          });
        }
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
        const sunset = sunsetForDay(dayNum, lat, lng);
        if (!sunset) return NaN;
        const sunAz = sunset.azimuth;
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
        const prepared = globalThis.GGHBandData?.days[dayNum];
        return prepared || calculateBoundaryFillGeoJSON(dayNum);
      }

      function calculateBoundaryFillGeoJSON(dayNum) {
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

      function updateClickedSunsetPopup(bringToFront = false) {
        if (!clickedLngLat) return;
        if (bringToFront) setPopupForeground(true);
        const { lng, lat } = clickedLngLat;
        const day = Number(daySlider.value);
        const sunsetStr = sunsetLocalTime(day, lat, lng);

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

        clickedPopup = new maplibregl.Popup({ closeOnClick: false, offset: 14, maxWidth: "240px" })
          .setLngLat([lng, lat])
          .setHTML(`
            <div class="popup-body">
              <div class="popup-name">Dropped Pin</div>
              <div class="popup-row"><strong>Coordinates:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
              <div class="popup-row"><strong>Selected Date:</strong> ${doyToDateStr(day)}</div>
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
        selectedPinPopup = new maplibregl.Popup({ closeOnClick: false, offset: 16, maxWidth: "280px" })
          .setLngLat([selectedPinLngLat.lng, selectedPinLngLat.lat])
          .setHTML(buildPopupHtml(selectedPinProps))
          .addTo(map);
        selectedPinPopup.on("close", () => {
          if (suppressSelectedPinClose) return;
          clearSelectedPin();
          applyFilters();
        });
      }

    /* ============================================================
        Section 8 — HELP POPUP
        ============================================================ */
        const helpText = document.getElementById("helpText");
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
