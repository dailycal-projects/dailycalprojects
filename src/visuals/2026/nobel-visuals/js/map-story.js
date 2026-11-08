import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export default function initialize({
  root,
  shared,
  on,
  emit,
  world,
  map,
  land,
  states,
}) {
  const figure = root.querySelector('.map-story');
  if (!figure) return;
  const colors = shared.colors;
  const cities = {
    Ashburn: [-77.49, 39.04],
    Baltimore: [-76.61, 39.29],
    Berkeley: [-122.27, 37.87],
    Boston: [-71.06, 42.36],
    Boulder: [-105.27, 40.02],
    Cambridge: [-71.11, 42.37],
    'College Park': [-76.94, 38.99],
    Garching: [11.65, 48.25],
    Greenbelt: [-76.88, 39],
    Houston: [-95.37, 29.76],
    Leipzig: [12.37, 51.34],
    'Los Angeles': [-118.24, 34.05],
    'New Brunswick': [-74.45, 40.49],
    'New Haven': [-72.93, 41.31],
    'New York': [-74.01, 40.71],
    Okinawa: [127.8, 26.5],
    Pasadena: [-118.14, 34.15],
    Philadelphia: [-75.17, 39.95],
    Princeton: [-74.66, 40.35],
    'San Francisco': [-122.42, 37.77],
    'Santa Barbara': [-119.7, 34.42],
    Seattle: [-122.33, 47.61],
    'St. Louis': [-90.2, 38.63],
    Stanford: [-122.17, 37.43],
    'Walnut Creek': [-122.07, 37.91],
  };
  const scenes = [];
  const hoverTip = document.createElement('aside');
  hoverTip.className = 'map-story__hover';
  hoverTip.hidden = true;
  root.append(hoverTip);
  function explain(event, title, detail, list = []) {
    hoverTip.replaceChildren();
    const name = document.createElement('strong');
    name.textContent = title;
    const body = document.createElement('span');
    body.textContent = detail;
    hoverTip.append(name, body);
    if (list.length) {
      const names = document.createElement('ul');
      names.className = 'map-story__hover-list';
      list.forEach((text) => {
        const row = document.createElement('li');
        row.textContent = text;
        names.append(row);
      });
      hoverTip.append(names);
    }
    shared.markHistoricalMentions?.(hoverTip);
    hoverTip.hidden = false;
    hoverTip.style.left = `${Math.max(
      12,
      Math.min(event.clientX + 16, innerWidth - 330),
    )}px`;
    hoverTip.style.top = `${Math.max(
      12,
      Math.min(event.clientY + 16, innerHeight - hoverTip.offsetHeight - 12),
    )}px`;
  }
  function hover(selection, title, detail) {
    selection
      .on('pointerenter', function (event, d) {
        d3.select(this).classed('is-hovered', true);
        explain(
          event,
          typeof title === 'function' ? title(d) : title,
          typeof detail === 'function' ? detail(d) : detail,
        );
      })
      .on('pointermove', function (event, d) {
        explain(
          event,
          typeof title === 'function' ? title(d) : title,
          typeof detail === 'function' ? detail(d) : detail,
        );
      })
      .on('pointerleave', function () {
        d3.select(this).classed('is-hovered', false);
        hoverTip.hidden = true;
      })
      .on('focus', function (event, d) {
        const r = this.getBoundingClientRect();
        explain(
          { clientX: r.left, clientY: r.top },
          typeof title === 'function' ? title(d) : title,
          typeof detail === 'function' ? detail(d) : detail,
        );
      })
      .on('blur', () => {
        hoverTip.hidden = true;
      });
  }
  on(
    'scroll',
    () => {
      hoverTip.hidden = true;
      figure
        .querySelectorAll('.is-hovered,.is-linked')
        .forEach((node) => node.classList.remove('is-hovered', 'is-linked'));
    },
    { passive: true },
  );
  const clamp = (t) => Math.max(0, Math.min(1, t)),
    ease = (t) => t * t * (3 - 2 * t),
    mix = (a, b, t) => a + (b - a) * t;
  const places = {
    US: ['840', 'United States', [-100, 39], [-180, 65]],
    CA: ['124', 'Canada', [-106, 57], [-85, -25]],
    MX: ['484', 'Mexico', [-102, 24], [-30, 160]],
    GB: ['826', 'United Kingdom', [-3, 55], [-130, -30]],
    FR: ['250', 'France', [2, 46], [-140, 35]],
    DE: ['276', 'Germany', [10, 51], [-25, -40]],
    IT: ['380', 'Italy', [12, 42], [-110, 80]],
    SE: ['752', 'Sweden', [16, 63], [15, -30]],
    LT: ['440', 'Lithuania', [24, 55], [65, -15]],
    UA: ['804', 'Ukraine', [32, 49], [110, 25]],
    HU: ['348', 'Hungary', [19, 47], [80, 70]],
    IL: ['376', 'Israel', [35, 31], [-60, 95]],
    JO: ['400', 'Jordan', [37, 31], [65, 125]],
    TW: ['158', 'Taiwan', [121, 24], [35, 25]],
  };
  function render(world, people, mobile, land, states) {
    const svg = d3
      .select(figure)
      .append('svg')
      .attr(
        'class',
        `map-story__svg map-story__svg--${mobile ? 'mobile' : 'desktop'}`,
      )
      .attr('viewBox', mobile ? '0 0 500 770' : '0 0 1200 640')
      .attr('role', 'img')
      .attr('aria-label', 'Country of birth, one dot per laureate');
    const worldFeatures = topojson
      .feature(world, world.objects.countries)
      .features.filter((country) => String(country.id) !== '010');
    const projection = d3.geoMercator().fitExtent(
      mobile
        ? [
            [20, 15],
            [480, 275],
          ]
        : [
            [75, 40],
            [1125, 615],
          ],
      { type: 'FeatureCollection', features: worldFeatures },
    );
    const path = d3.geoPath(projection);
    const heading = svg
      .append('text')
      .attr('class', 'map-story__heading map-story__title')
      .attr('x', mobile ? 20 : 74)
      .attr('y', mobile ? 25 : 28)
      .text('Birthplace');
    const geometries = world.objects.countries.geometries.filter(
      (country) => country.id !== '010',
    );
    const geography = svg.append('g');
    geography
      .append('g')
      .attr('class', 'map-story__land')
      .selectAll('path')
      .data(
        topojson
          .feature(world, world.objects.countries)
          .features.filter((country) => country.id !== '010'),
      )
      .join('path')
      .attr(
        'class',
        (country) =>
          `map-story__country${
            Object.values(places).some((place) => place[0] === country.id)
              ? ' is-represented'
              : ''
          }`,
      )
      .attr('d', path);
    geography
      .append('path')
      .datum(topojson.merge(world, geometries))
      .attr('class', 'map-story__coast')
      .attr('pathLength', 1)
      .attr('d', path);
    geography
      .append('path')
      .datum(
        topojson.mesh(
          world,
          world.objects.countries,
          (a, b) => a !== b && a.id !== '010' && b.id !== '010',
        ),
      )
      .attr('class', 'map-story__borders')
      .attr('pathLength', 1)
      .attr('d', path);
    const stateBorders = geography
      .append('path')
      .datum(topojson.mesh(states, states.objects.states, (a, b) => a !== b))
      .attr('class', 'map-story__states')
      .attr('d', path)
      .attr('opacity', 0);
    const polygons = topojson
      .feature(land, land.objects.land)
      .features[0].geometry.coordinates.filter((polygon) =>
        polygon[0].some((coordinate) => coordinate[1] > -60),
      )
      .map((coordinates) =>
        d3.geoArea({ type: 'Polygon', coordinates }) > 2 * Math.PI
          ? coordinates.map((ring) => [...ring].reverse())
          : coordinates,
      );
    const localLand = geography.append('g').attr('opacity', 0);
    localLand
      .selectAll('path')
      .data(polygons.map((coordinates) => ({ type: 'Polygon', coordinates })))
      .join('path')
      .attr('class', 'map-story__local-land')
      .attr('d', d3.geoPath(projection.precision(0.01)).digits(5));
    const connectors = svg.append('g');
    const labels = svg.append('g').attr('class', 'map-story__labels');
    const dots = svg.append('g');
    Object.entries(places).forEach(([code, place], index) => {
      const members = people
        .filter((person) => person.birthCountryCode === code)
        .sort((a, b) => a.year - b.year);
      const [ax, ay] = projection(place[2]);
      let x = ax + place[3][0],
        y = ay + place[3][1];
      if (mobile) {
        x = index === 0 ? 30 : 30 + ((index - 1) % 3) * 155;
        y = index === 0 ? 320 : 455 + Math.floor((index - 1) / 3) * 57;
      }
      if (!mobile) {
        const columns = Math.min(10, members.length),
          rows = Math.ceil(members.length / 10),
          right = x + (columns - 1) * 17 + 8,
          bottom = y + 18 + (rows - 1) * 17 + 8;
        const endX = Math.max(x - 8, Math.min(right, ax)),
          endY = Math.max(y + 10, Math.min(bottom, ay));
        connectors
          .append('path')
          .attr('class', 'map-story__connector')
          .attr('pathLength', 1)
          .attr('d', `M${ax},${ay} L${endX},${endY}`);
      }
      const label = labels
        .append('text')
        .attr('class', 'map-story__label')
        .attr('x', x)
        .attr('y', y);
      label.append('tspan').text(place[1]);
      label
        .append('tspan')
        .attr('class', 'map-story__count')
        .attr('dx', 8)
        .text(members.length);
      members.forEach((person, i) =>
        dots
          .append('circle')
          .attr('class', 'map-story__dot')
          .attr('data-person-id', person.id)
          .attr('cx', x + (i % (mobile ? 20 : 10)) * 17)
          .attr('cy', y + 18 + Math.floor(i / (mobile ? 20 : 10)) * 17)
          .attr('r', 8)
          .attr('fill', colors[person.category])
          .attr('role', 'img')
          .attr('aria-label', `${person.name}, born in ${person.birthCountry}`),
      );
    });
    const items = [...svg.node().querySelectorAll('.map-story__dot')].map(
      (dot) => ({
        dot,
        person: people.find((p) => p.id === dot.dataset.personId),
        birth: [+dot.getAttribute('cx'), +dot.getAttribute('cy')],
      }),
    );
    items.slice().forEach((item) => {
      const affiliations = item.person.awardAffiliations.filter(
        (a) => cities[a.city],
      );
      const unique = [
        ...new Map(affiliations.map((a) => [a.city, a])).values(),
      ];
      const first = item.person.awardAffiliations.some((a) =>
        a.name.startsWith('University of California, Berkeley,'),
      )
        ? 'Berkeley'
        : unique[0]?.city;
      unique
        .filter((a) => a.city !== first)
        .forEach((a) => {
          const dot = item.dot.cloneNode(true);
          dots.node().append(dot);
          items.push({
            ...item,
            dot,
            forcedCoordinate: cities[a.city],
            extra: true,
          });
        });
    });
    const slots = {};
    items.forEach((item) => {
      const a = item.person.awardAffiliations.find((a) => cities[a.city]);
      item.coordinate = item.forcedCoordinate || (a ? cities[a.city] : null);
      item.berkeley =
        !item.extra &&
        item.person.awardAffiliations.some((a) =>
          a.name.startsWith('University of California, Berkeley,'),
        );
      if (item.berkeley) item.coordinate = cities.Berkeley;
      const key = item.coordinate?.join(',') || 'unlocated';
      item.slot = slots[key] || 0;
      slots[key] = item.slot + 1;
    });
    items.forEach((item) => {
      item.affiliationNames = item.person.awardAffiliations
        .filter((a) => cities[a.city]?.join(',') === item.coordinate?.join(','))
        .map((a) => a.name);
      item.dot.dataset.affiliations = item.affiliationNames.join(' · ');
    });
    const institutionGroups = new Map();
    people.forEach((person) =>
      person.awardAffiliations
        .filter((a) => cities[a.city])
        .forEach((a) => {
          if (!institutionGroups.has(a.name))
            institutionGroups.set(a.name, {
              ...a,
              coordinate: cities[a.city],
              ids: new Set(),
            });
          institutionGroups.get(a.name).ids.add(person.id);
        }),
    );
    const institutionLabels = svg
      .append('g')
      .attr('class', 'map-story__institutions');
    const institutions = [...institutionGroups.values()].map((institution) => {
      const group = institutionLabels.append('g');
      group.append('line').attr('class', 'map-story__institution-line');
      group.append('line').attr('class', 'map-story__institution-hit');
      const leader = group.selectAll('line');
      const label = group
        .append('text')
        .attr('class', 'map-story__institution-label');
      let name = institution.name.startsWith('University of California,')
        ? `UC ${institution.name.split(',')[1].trim()}`
        : institution.name.split(',')[0];
      name = name
        .replace('Massachusetts Institute of Technology (MIT)', 'MIT')
        .replace('California Institute of Technology (Caltech)', 'Caltech')
        .replace(
          'Max Planck Institute for Evolutionary Anthropology',
          'Max Planck · Leipzig',
        )
        .replace(
          'Max Planck Institute for Extraterrestrial Physics',
          'Max Planck · Garching',
        )
        .replace(
          'Okinawa Institute of Science and Technology',
          'Okinawa Institute of Science & Technology',
        );
      const words = name.split(' '),
        lines = [''];
      words.forEach((word) => {
        if ((lines.at(-1) + ' ' + word).trim().length > 30) lines.push(word);
        else lines[lines.length - 1] = (lines.at(-1) + ' ' + word).trim();
      });
      lines.forEach((line, index) =>
        label
          .append('tspan')
          .attr('class', 'map-story__institution-text')
          .attr('dy', index ? 12 : 0)
          .text(
            `${line}${
              index === lines.length - 1 ? ` · ${institution.ids.size}` : ''
            }`,
          ),
      );
      return { ...institution, group, leader, label, lineCount: lines.length };
    });
    const info = svg
      .append('text')
      .attr('class', 'map-story__label')
      .attr('x', mobile ? 20 : 74)
      .attr('y', mobile ? 750 : 630);
    const campusLabel = svg
      .append('g')
      .attr('class', 'map-story__campus-label');
    campusLabel
      .append('text')
      .attr('class', 'map-story__heading')
      .text('UC Berkeley');
    campusLabel
      .append('text')
      .attr('class', 'map-story__label')
      .attr('y', 22)
      .text(
        `${
          items.filter((item) => item.berkeley).length
        } faculty members and professor emeriti at the time of the award`,
      );
    const countries = topojson.feature(world, world.objects.countries).features;
    hover(
      geography.selectAll('.map-story__country'),
      (country) => country.properties.name,
      (country) => {
        const code = Object.entries(places).find(
          ([, p]) => p[0] === String(country.id),
        )?.[0];
        const count = people.filter((p) => p.birthCountryCode === code).length;
        return `${count} laureates born here in this dataset`;
      },
    );
    hover(
      geography.selectAll('.map-story__coast,.map-story__borders'),
      'Map boundary',
      'Geographic reference',
    );
    hover(
      connectors.selectAll('path'),
      'Birthplace country',
      'This line connects the country to its laureate dots.',
    );
    institutions.forEach((i) => {
      hover(
        i.group,
        i.name,
        `${i.ids.size} laureate${
          i.ids.size === 1 ? '' : 's'
        } affiliated at the time of the award`,
      );
      i.group
        .on('pointerenter pointermove focus', (event) => {
          institutionLabels
            .selectAll('.is-hovered')
            .classed('is-hovered', false);
          i.group.classed('is-hovered', true);
          items.forEach((item) =>
            item.dot.classList.toggle(
              'is-linked',
              item.affiliationNames.includes(i.name),
            ),
          );
          const box = i.label.node().getBoundingClientRect();
          explain(
            event.type === 'focus'
              ? { clientX: box.right, clientY: box.top }
              : event,
            i.name,
            `${i.ids.size} laureate${i.ids.size === 1 ? '' : 's'} · ${i.city}`,
            people
              .filter((p) => i.ids.has(p.id))
              .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
              .map((p) => `${p.name} (${p.year})`),
          );
        })
        .on('pointerleave blur', () => {
          i.group.classed('is-hovered', false);
          items.forEach((item) => item.dot.classList.remove('is-linked'));
          hoverTip.hidden = true;
        });
    });
    scenes.push({
      svg,
      heading,
      countries,
      projection,
      geography,
      localLand,
      stateBorders,
      items,
      labels,
      connectors,
      info,
      campusLabel,
      mobile,
      institutionLabels,
      institutions,
      layouts: new Map(),
    });
  }
  shared.updateMapStory = (mapPhase = 1) => {
    const phase = (name) => {
      const el = root.querySelector(`[data-story-step="${name}"]`);
      return el
        ? ease(
            clamp(
              (innerHeight * 0.75 - el.getBoundingClientRect().top) /
                (innerHeight * 1.1),
            ),
          )
        : 0;
    };
    const affiliation = phase('map-affiliations'),
      zoom = phase('map-berkeley');
    const regionalStages = [
      {
        phase: phase('map-asia'),
        name: 'Asia',
        coordinate: [127.8, 28],
        scale: 4.5,
      },
      {
        phase: phase('map-europe'),
        name: 'Europe',
        coordinate: [12, 50],
        scale: 9,
      },
      {
        phase: phase('map-us-east'),
        name: 'Eastern United States',
        coordinate: [-80, 38],
        scale: 8,
      },
      {
        phase: phase('map-us-west'),
        name: 'Western United States',
        coordinate: [-118, 38],
        scale: 8,
      },
    ];
    scenes.forEach((scene) => {
      const {
        svg,
        heading,
        countries,
        projection,
        geography,
        localLand,
        stateBorders,
        items,
        labels,
        connectors,
        info,
        campusLabel,
        mobile,
        institutionLabels,
        institutions,
        layouts,
      } = scene;
      const cx = mobile ? 250 : 600,
        cy = mobile ? 350 : 320,
        width = mobile ? 500 : 1200;
      let camera = [cx, cy, width],
        region = '';
      regionalStages.forEach((stage) => {
        const center = projection(stage.coordinate),
          target = [
            center[0],
            center[1],
            width / (stage.scale * (mobile ? 1.7 : 1)),
          ];
        if (stage.phase > 0) {
          camera = d3.interpolateZoom(camera, target)(stage.phase);
          region = stage.name;
        }
      });
      const berkeleyCenter = projection(cities.Berkeley);
      camera = d3.interpolateZoom(camera, [
        berkeleyCenter[0],
        berkeleyCenter[1],
        width / (mobile ? 85 : 115),
      ])(zoom);
      const [cameraX, cameraY, cameraWidth] = camera,
        scale = width / cameraWidth;
      geography.attr(
        'transform',
        `translate(${cx},${cy}) scale(${scale}) translate(${-cameraX},${-cameraY})`,
      );
      localLand.attr('opacity', clamp((zoom - 0.1) / 0.3));
      geography.select('.map-story__land').node().dataset.zoomOpacity =
        1 - clamp(zoom / 0.3);
      geography
        .selectAll('.map-story__coast,.map-story__borders')
        .style('opacity', 1 - clamp(zoom / 0.3));
      const screen = (coordinate) => {
        const p = projection(coordinate);
        return [cx + (p[0] - cameraX) * scale, cy + (p[1] - cameraY) * scale];
      };
      labels.node().dataset.stageOpacity = 1 - affiliation;
      connectors.attr('opacity', 1 - affiliation);
      heading
        .text(
          zoom > 0.5
            ? 'Berkeley'
            : region
            ? `Affiliation at the time of the award · ${region}`
            : affiliation > 0.5
            ? 'Affiliation at the time of the award'
            : 'Birthplace',
        )
        .raise();
      const us = region.includes('United States'),
        focusCountry =
          region === 'Asia'
            ? '392'
            : region === 'Europe'
            ? '276'
            : us
            ? '840'
            : null;
      stateBorders.attr('opacity', us ? (1 - zoom) * affiliation : 0);
      geography
        .selectAll('.map-story__country')
        .classed('is-active', (country) => String(country.id) === focusCountry)
        .style('fill', (country) => {
          if (focusCountry)
            return String(country.id) === focusCountry ? '#b4c7cc' : '#e3e9e9';
          const represented = Object.values(places).some(
            (place) => place[0] === String(country.id),
          );
          return represented
            ? d3.interpolateRgb(
                '#e3e9e9',
                '#91adb6',
              )(ease(clamp((mapPhase - 0.4) / 0.55)))
            : '#e3e9e9';
        });
      info.text('');
      const activeStage = regionalStages
        .filter((stage) => stage.phase > 0)
        .at(-1);
      institutionLabels.attr(
        'opacity',
        activeStage
          ? ease(clamp((activeStage.phase - 0.7) / 0.3)) * (1 - zoom)
          : 0,
      );
      institutionLabels.style(
        'pointer-events',
        activeStage && activeStage.phase > 0.9 && zoom < 0.1 ? 'auto' : 'none',
      );
      // Berkeley institutions are left out of the regional views; the Berkeley zoom step covers them.
      const active = institutions
        .filter((i) => i.city !== 'Berkeley')
        .filter((i) =>
          region === 'Asia'
            ? i.countryCode === 'JP'
            : region === 'Europe'
            ? i.countryCode === 'DE'
            : us
            ? i.countryCode === 'US' &&
              (region.startsWith('Eastern')
                ? i.coordinate[0] > -95
                : i.coordinate[0] <= -95)
            : false,
        );
      institutions.forEach((i) =>
        i.group.attr('display', active.includes(i) ? null : 'none'),
      );
      [false, true].forEach((east) => {
        const divider = us ? (region.startsWith('Eastern') ? -80 : -119) : 12;
        const column = active
          .filter((i) => i.coordinate[0] > divider === east)
          .sort((a, b) => b.coordinate[1] - a.coordinate[1]);
        const lineHeight = us ? 14 : 22,
          maxY = mobile ? 700 : 595;
        const rows = column.map((i) => ({
          i,
          anchor: screen(i.coordinate),
          height: Math.max(us ? 28 : 48, i.lineCount * lineHeight + 10),
        }));
        let cursor = 65;
        rows.forEach((row) => {
          row.y = Math.max(cursor, Math.min(maxY - row.height, row.anchor[1]));
          cursor = row.y + row.height;
        });
        if (cursor > maxY) {
          let bottom = maxY;
          for (let index = rows.length - 1; index >= 0; index--) {
            const row = rows[index];
            row.y = Math.min(row.y, bottom - row.height);
            bottom = row.y;
          }
        }
        rows.forEach(({ i, anchor, y }) => {
          const clearance = us ? 130 : 50;
          const x = mobile
            ? east
              ? Math.min(290, anchor[0] + clearance)
              : Math.max(205, anchor[0] - clearance)
            : east
            ? Math.min(920, anchor[0] + clearance)
            : Math.max(280, anchor[0] - clearance);
          i.label
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', east ? 'start' : 'end')
            .style('font-size', us ? '12px' : '18px');
          i.label
            .selectAll('.map-story__institution-text')
            .attr('x', x)
            .attr('dy', (_, index) => (index ? lineHeight : 0));
          const vx = (east ? x - 8 : x + 8) - anchor[0],
            vy = y - 4 - anchor[1],
            distance = Math.hypot(vx, vy) || 1;
          i.leader
            .attr('x1', anchor[0] + (vx / distance) * 7)
            .attr('y1', anchor[1] + (vy / distance) * 7)
            .attr('x2', east ? x - 8 : x + 8)
            .attr('y2', y - 4);
        });
      });
      const occupied = [];
      const layoutKey = zoom > 0 ? 'Berkeley' : region || 'World';
      const layoutScale =
        zoom > 0
          ? mobile
            ? 85
            : 115
          : activeStage
          ? activeStage.scale * (mobile ? 1.7 : 1)
          : 1;
      const layout = layouts.get(layoutKey) || [];
      const previousKey =
        zoom > 0
          ? region
          : regionalStages[regionalStages.indexOf(activeStage) - 1]?.name ||
            'World';
      const previousLayout = layouts.get(previousKey);
      const layoutBlend = zoom > 0 ? zoom : activeStage?.phase ?? 1;
      items.forEach((item, itemIndex) => {
        const anchor = item.coordinate
          ? screen(item.coordinate)
          : [mobile ? 30 : 75, mobile ? 700 : 580];
        const angle = item.slot * 2.399963;
        let rad = item.slot ? Math.sqrt(item.slot) * 6 : 0,
          dx = Math.cos(angle) * rad,
          dy = Math.sin(angle) * rad;
        let x = anchor[0] + dx,
          y = anchor[1] + dy;
        if (item.coordinate && affiliation > 0.01) {
          if (!layout[itemIndex]) {
            if (layoutKey === 'World') {
              const radius = Math.sqrt(item.slot) * 2.5;
              layout[itemIndex] = [
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
              ];
            } else {
              const country = countries.find(
                (c) =>
                  String(c.id) ===
                  (item.coordinate[0] > 100
                    ? '392'
                    : item.coordinate[0] > 0
                    ? '276'
                    : '840'),
              );
              const projected = projection(item.coordinate),
                layoutAnchor = projected.map((value) => value * layoutScale);
              const direction = item.coordinate[0] < -95 ? 1 : -1;
              let placed = false;
              for (let attempt = 0; attempt < 160; attempt++) {
                const row = Math.floor(attempt / 8),
                  col = attempt % 8;
                x = layoutAnchor[0] + direction * col * 14;
                y =
                  layoutAnchor[1] +
                  (row % 2 ? 1 : -1) * Math.ceil(row / 2) * 14;
                if (occupied.some((p) => Math.hypot(p[0] - x, p[1] - y) < 13))
                  continue;
                const coordinate = projection.invert([
                  x / layoutScale,
                  y / layoutScale,
                ]);
                if (!country || d3.geoContains(country, coordinate)) {
                  placed = true;
                  break;
                }
              }
              if (!placed) {
                for (let attempt = 0; attempt < 300; attempt++) {
                  const radius = 7 * Math.sqrt(attempt),
                    angle = attempt * 2.399963;
                  x = layoutAnchor[0] + Math.cos(angle) * radius;
                  y = layoutAnchor[1] + Math.sin(angle) * radius;
                  if (
                    !occupied.some((p) => Math.hypot(p[0] - x, p[1] - y) < 13)
                  )
                    break;
                }
              }
              occupied.push([x, y]);
              layout[itemIndex] = [x - layoutAnchor[0], y - layoutAnchor[1]];
            }
          }
          const offset = layout[itemIndex],
            prior = previousLayout?.[itemIndex] || offset;
          x = anchor[0] + mix(prior[0], offset[0], layoutBlend);
          y = anchor[1] + mix(prior[1], offset[1], layoutBlend);
        }
        item.dot.setAttribute('cx', mix(item.birth[0], x, affiliation));
        item.dot.setAttribute('cy', mix(item.birth[1], y, affiliation));
        const regionalSize = mix(
          4,
          5.5,
          zoom > 0 ? 1 : activeStage?.phase ?? 0,
        );
        item.dot.setAttribute('r', mix(8, regionalSize, affiliation));
        item.dot.dataset.mapOpacity = item.coordinate
          ? item.extra
            ? ease(clamp((affiliation - 0.75) / 0.25))
            : 1
          : 1 - affiliation;
        const hiddenAtBerkeley =
          region.startsWith('Western') &&
          zoom < 0.2 &&
          item.coordinate?.join(',') === cities.Berkeley.join(',');
        item.dot.dataset.mapVisible = String(
          (!item.extra || affiliation > 0.01) &&
            (zoom < 0.2 || item.berkeley) &&
            !hiddenAtBerkeley,
        );
      });
      institutions.forEach((institution) => {
        const members = items.filter((item) =>
          item.affiliationNames.includes(institution.name),
        );
        if (!members.length) return;
        const endX = Number(institution.leader.attr('x2')),
          endY = Number(institution.leader.attr('y2'));
        const closest = members.reduce((best, item) => {
          const distance = Math.hypot(
            Number(item.dot.getAttribute('cx')) - endX,
            Number(item.dot.getAttribute('cy')) - endY,
          );
          return !best || distance < best.distance ? { item, distance } : best;
        }, null).item.dot;
        institution.leader
          .attr('x1', closest.getAttribute('cx'))
          .attr('y1', closest.getAttribute('cy'));
      });
      if (affiliation > 0.01) layouts.set(layoutKey, layout);
      campusLabel
        .attr('transform', `translate(${cx + 60},${cy - 65})`)
        .attr('opacity', zoom > 0.8 ? (zoom - 0.8) / 0.2 : 0);
    });
  };
  {
    // Miłosz's Nobel affiliation field is empty; Berkeley documents his emeritus appointment in 1980.
    const milosz = map.people.find(
      (person) => person.name === 'Czesław Miłosz',
    );
    if (milosz && !milosz.awardAffiliations.some((a) => a.city === 'Berkeley'))
      milosz.awardAffiliations.push({
        name: 'University of California, Berkeley, CA, USA',
        city: 'Berkeley',
        country: 'USA',
        countryCode: 'US',
        source:
          'https://newsarchive.berkeley.edu/news/berkeleyan/2004/08/18_milosz.shtml',
        appointment: 'Professor emeritus',
      });
    render(world, map.people, false, land, states);
    render(world, map.people, true, land, states);
    emit(new Event('birth-map:ready'));
  }
}
