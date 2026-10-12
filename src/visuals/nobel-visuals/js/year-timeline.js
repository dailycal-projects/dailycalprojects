export default function initialize({ root, shared, frame, emit, laureates }) {
  const intro = root.querySelector('.intro-scrolly');
  const steps = intro?.querySelector('.intro-scrolly__steps');
  const yearFigure = intro?.querySelector('.year-story');
  const facultyFigure = intro?.querySelector('.faculty-story');
  if (!steps || !yearFigure || !facultyFigure) return;
  const ns = 'http://www.w3.org/2000/svg';
  const colors = shared.colors;
  const portions = ['1', '1/2', '1/3', '1/4'];
  const portionShare = { 1: 1, '1/2': 1 / 2, '1/3': 1 / 3, '1/4': 1 / 4 };
  const wedge = (cx, cy, r, share) => {
    if (share >= 1)
      return `M${cx - r} ${cy}A${r} ${r} 0 1 1 ${
        cx + r
      } ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}Z`;
    const angle = -Math.PI / 2 + share * 2 * Math.PI;
    return `M${cx} ${cy}L${cx} ${cy - r}A${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${
      cx + r * Math.cos(angle)
    } ${cy + r * Math.sin(angle)}Z`;
  };
  const portionLabels = {
    1: 'Full prize',
    '1/2': 'Half',
    '1/3': 'One-third',
    '1/4': 'One-quarter',
  };
  const node = (tag, attrs = {}, value) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
    if (value != null) el.textContent = value;
    return el;
  };
  const open = (person) =>
    emit(
      new CustomEvent('open-laureate-profile', { detail: { id: person.id } }),
    );
  const interactive = (element, person) => {
    element.dataset.personId = person.id;
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.setAttribute(
      'aria-label',
      `${person.name}, ${person.year}, ${person.category}. Open profile`,
    );
    element.addEventListener('click', () => open(person));
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(person);
      }
    });
  };
  function renderYear(people, mobile) {
    const svg = node('svg', {
      class: `year-story__svg year-story__svg--${
        mobile ? 'mobile' : 'desktop'
      }`,
      viewBox: mobile ? '0 0 500 770' : '0 0 1200 520',
      role: 'img',
      'aria-label': 'Berkeley Nobel laureates by year, one dot per person',
    });
    svg.append(
      node(
        'text',
        {
          class: 'year-story__heading year-story__heading--year',
          x: mobile ? 20 : 74,
          y: mobile ? 25 : 38,
        },
        'Year of award',
      ),
    );
    svg.append(
      node(
        'text',
        {
          class: 'year-story__heading year-story__heading--portion',
          x: mobile ? 20 : 74,
          y: mobile ? 25 : 38,
          opacity: 0,
        },
        'Share of the prize by decade',
      ),
    );
    const legend = node('g', {
      class: 'year-story__portion-legend',
      opacity: 0,
    });
    portions.forEach((portion, index) => {
      const x = (mobile ? 28 : 82) + index * (mobile ? 118 : 130);
      const y = mobile ? 50 : 66;
      legend.append(
        node('circle', {
          class: 'year-story__legend-ring',
          cx: x,
          cy: y - 4,
          r: 6,
        }),
      );
      legend.append(
        node('path', {
          class: 'year-story__legend-fill',
          d: wedge(x, y - 4, 6, portionShare[portion]),
        }),
      );
      legend.append(
        node(
          'text',
          { class: 'year-story__legend-label', x: x + 11, y },
          portionLabels[portion],
        ),
      );
    });
    svg.append(legend);
    const categoryOrder = Object.keys(colors);
    const ordered = people
      .slice()
      .sort(
        (a, b) =>
          a.year - b.year ||
          categoryOrder.indexOf(a.category) -
            categoryOrder.indexOf(b.category) ||
          a.name.localeCompare(b.name),
      );
    const bins = new Map();
    ordered.forEach((person) => {
      const decade = Math.floor(person.year / 10) * 10;
      const column = Math.floor((person.year - 1930) / 2);
      const bin = mobile ? decade : column;
      const index = bins.get(bin) || 0;
      bins.set(bin, index + 1);
      const x = mobile
        ? 184 + index * 20
        : 96 + ((column * 2 + 0.5) * 1008) / 90;
      const y = mobile ? 80 + ((decade - 1930) / 10) * 59 : 333 - index * 19;
      const dot = node('circle', {
        class: 'year-story__dot',
        cx: x,
        cy: y,
        r: 8,
        fill: colors[person.category],
        'data-portion': person.portion,
        'data-year': person.year,
      });
      interactive(dot, person);
      svg.append(dot);
    });
    const byDecade = new Map();
    people
      .slice()
      .sort(
        (a, b) =>
          portions.indexOf(a.portion) - portions.indexOf(b.portion) ||
          a.year - b.year ||
          a.name.localeCompare(b.name),
      )
      .forEach((person) => {
        const decade = Math.floor(person.year / 10) * 10;
        const index = byDecade.get(decade) || 0;
        byDecade.set(decade, index + 1);
        const x = mobile ? 184 + index * 20 : 96 + ((decade - 1930) / 10) * 112;
        const y = mobile ? 80 + ((decade - 1930) / 10) * 59 : 333 - index * 19;
        svg.append(
          node('circle', {
            class: 'year-story__portion-target',
            cx: x,
            cy: y,
            r: 8,
            'data-person-id': person.id,
            'data-portion': person.portion,
            'data-highlight': person.name === 'Svante Pääbo' ? 'paabo' : '',
          }),
        );
        if (person.name === 'Svante Pääbo') {
          const labelX = x;
          const labelY = mobile ? y + 26 : 424;
          svg.append(
            node(
              'text',
              {
                class: 'year-story__callout',
                x: labelX,
                y: labelY,
                'text-anchor': mobile ? 'start' : 'middle',
                opacity: 0,
              },
              'Svante Pääbo, 2022',
            ),
          );
        }
      });
    yearFigure.append(svg);
  }
  function renderFaculty(people, mobile) {
    // These four received their prizes before joining Berkeley's faculty.
    const joinedAfterAward = new Set([
      'John Howard Northrop',
      'Wendell Stanley',
      'Charles Townes',
      'Eric Betzig',
    ]);
    const faculty = people.filter(
      (person) =>
        person.relationship === 'Faculty' && !joinedAfterAward.has(person.name),
    );
    const svg = node('svg', {
      class: `faculty-story__svg faculty-story__svg--${
        mobile ? 'mobile' : 'desktop'
      }`,
      viewBox: '0 0 780 800',
      role: 'group',
      'aria-label':
        'Berkeley faculty Nobel laureates; select a portrait for the full description',
    });
    const defs = node('defs');
    svg.append(defs);
    svg.append(
      node(
        'text',
        { class: 'faculty-story__heading', x: 24, y: 26 },
        'Berkeley faculty and emeriti · 24',
      ),
    );
    [300, 190, 80].forEach((radius) =>
      svg.append(
        node('circle', {
          class: 'faculty-story__guide',
          cx: 390,
          cy: 390,
          r: radius,
        }),
      ),
    );
    svg.append(
      node(
        'text',
        {
          class: 'faculty-story__hint',
          x: 390,
          y: 783,
          'text-anchor': 'middle',
        },
        'Select a portrait to read their profile.',
      ),
    );
    svg.setAttribute(
      'aria-label',
      '24 laureates who were Berkeley faculty or emeriti at the time of their award; select a portrait for the full description',
    );
    faculty.forEach((person, index) => {
      const ring = index < 12 ? 0 : index < 20 ? 1 : 2;
      const slot = index - [0, 12, 20][ring];
      const count = [12, 8, 4][ring];
      const angle =
        -Math.PI / 2 +
        (slot * Math.PI * 2) / count +
        [0, Math.PI / 8, Math.PI / 4][ring];
      const centerX = 390;
      const centerY = 390;
      const radiusX = [300, 190, 80][ring];
      const radiusY = radiusX;
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      const clipId = `faculty-clip-${mobile ? 'm' : 'd'}-${person.id.replace(
        /[^a-zA-Z0-9_-]/g,
        '-',
      )}`;
      const radius = 46;
      const clip = node('clipPath', { id: clipId });
      clip.append(node('circle', { cx: 0, cy: 0, r: radius - 5 }));
      defs.append(clip);
      const mark = node('g', {
        class: 'faculty-story__mark',
        'data-year': person.year,
        transform: `translate(${x} ${y})`,
      });
      mark.dataset.orbitAngle = angle;
      mark.dataset.orbitCenterX = centerX;
      mark.dataset.orbitCenterY = centerY;
      mark.dataset.orbitRadiusX = radiusX;
      mark.dataset.orbitRadiusY = radiusY;
      mark.dataset.orbitDirection = ring === 1 ? -1 : 1;
      interactive(mark, person);
      mark.append(
        node('circle', {
          class: 'faculty-story__ring',
          cx: 0,
          cy: 0,
          r: radius,
          fill: colors[person.category],
        }),
      );
      mark.append(
        node('image', {
          x: -radius + 5,
          y: -radius + 5,
          width: (radius - 5) * 2,
          height: (radius - 5) * 2,
          href: person.photo,
          'clip-path': `url(#${clipId})`,
          preserveAspectRatio: 'xMidYMid slice',
        }),
      );
      svg.append(mark);
    });
    facultyFigure.append(svg);
  }
  let orbitTime = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let previousFrame = 0;
  let lastOrbitDraw = 0;
  function animateOrbit(time) {
    const active =
      facultyFigure.dataset.orbitReady === 'true' &&
      !document.hidden &&
      !reducedMotion.matches &&
      !root.querySelector('#intro-profile[open]') &&
      !facultyFigure.querySelector(
        '.faculty-story__mark:hover, .faculty-story__mark:focus',
      );
    if (active && previousFrame)
      orbitTime += Math.min(time - previousFrame, 100);
    if (active && time - lastOrbitDraw > 32) {
      const orbitAngle = Math.sin(orbitTime / 6000) * 0.1;
      facultyFigure.querySelectorAll('.faculty-story__mark').forEach((mark) => {
        const angle =
          Number(mark.dataset.orbitAngle) +
          orbitAngle * Number(mark.dataset.orbitDirection);
        const x =
          Number(mark.dataset.orbitCenterX) +
          Math.cos(angle) * Number(mark.dataset.orbitRadiusX);
        const y =
          Number(mark.dataset.orbitCenterY) +
          Math.sin(angle) * Number(mark.dataset.orbitRadiusY);
        mark.setAttribute('transform', `translate(${x} ${y})`);
      });
      lastOrbitDraw = time;
    }
    previousFrame = time;
    frame(animateOrbit);
  }
  frame(animateOrbit);
  const people = laureates;
  renderYear(people, false);
  renderYear(people, true);
  renderFaculty(people, false);
  renderFaculty(people, true);
  emit(new Event('year-timeline:ready'));
}
