export default function initialize({ root, emit, laureates }) {
  const chart = root.querySelector('.decade-chart');
  if (!chart) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const categories = [
    'Physics',
    'Chemistry',
    'Economics',
    'Physiology or Medicine',
    'Literature',
  ];
  const element = (tag, attrs = {}, content) => {
    const node = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attrs))
      node.setAttribute(name, value);
    if (content != null) node.textContent = content;
    return node;
  };
  const shortDecade = (year, lastYear) =>
    year === Math.floor(lastYear / 10) * 10 && lastYear % 10 !== 9
      ? `${year}–${String(lastYear).slice(-2)}`
      : `${year}s`;
  const trendPath = (points, mobile) =>
    points
      .map(([x, y], index) => {
        if (!index) return `M${x} ${y}`;
        const [previousX, previousY] = points[index - 1];
        const bend = index % 2 ? 2 : -2;
        return mobile
          ? `Q${(x + previousX) / 2 + bend} ${(y + previousY) / 2} ${x} ${y}`
          : `Q${(x + previousX) / 2} ${(y + previousY) / 2 + bend} ${x} ${y}`;
      })
      .join(' ');

  function build(svg, people, mobile) {
    const years = people.map((person) => Number(person.year));
    const firstDecade = Math.floor(Math.min(...years) / 10) * 10;
    const lastYear = Math.max(...years);
    const lastDecade = Math.floor(lastYear / 10) * 10;
    const decades = Array.from(
      { length: (lastDecade - firstDecade) / 10 + 1 },
      (_, index) => firstDecade + index * 10,
    );
    const byDecade = new Map(
      decades.map((decade) => [
        decade,
        people.filter((person) => Math.floor(person.year / 10) * 10 === decade),
      ]),
    );
    const fieldTargets = element('g');
    const totalTargets = element('g');
    const trendPoints = [];
    const maxCount = Math.max(
      ...[...byDecade.values()].map((members) => members.length),
    );
    const dotSpacing = mobile
      ? Math.min(20, 270 / Math.max(1, maxCount))
      : Math.min(19, 290 / Math.max(1, maxCount));
    const heading = element(
      'text',
      {
        class: 'decade-chart__heading',
        x: mobile ? 20 : 74,
        y: mobile ? 25 : 38,
      },
      'Berkeley Nobel laureates by decade',
    );
    svg.append(heading);

    if (mobile) {
      const rowHeight = Math.min(59, 570 / Math.max(1, decades.length - 1));
      const startY = 78;
      svg.append(
        element('path', {
          class: 'decade-chart__axis',
          d: 'M165 25 Q163 382 166 745',
        }),
      );
      decades.forEach((decade, decadeIndex) => {
        const members = byDecade.get(decade);
        const y = startY + decadeIndex * rowHeight;
        svg.append(
          element('path', {
            class: 'decade-chart__guide',
            d: `M165 ${y} L460 ${y}`,
          }),
        );
        svg.append(
          element(
            'text',
            { class: 'decade-chart__label', x: 64, y: y + 5 },
            shortDecade(decade, lastYear),
          ),
        );
        let fieldPosition = 0;
        categories.forEach((category) => {
          const group = members
            .filter((person) => person.category === category)
            .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));
          if (group.length && fieldPosition) fieldPosition += 9;
          group.forEach((person) => {
            const x = 184 + fieldPosition;
            fieldTargets.append(
              element('circle', {
                class: 'decade-chart__target decade-chart__target--field',
                cx: x,
                cy: y,
                r: 8,
                'data-person-id': person.id,
              }),
            );
            fieldPosition += dotSpacing;
          });
        });
        members
          .slice()
          .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
          .forEach((person, index) => {
            totalTargets.append(
              element('circle', {
                class: 'decade-chart__target decade-chart__target--total',
                cx: 184 + index * dotSpacing,
                cy: y,
                r: 8,
                'data-person-id': person.id,
              }),
            );
          });
        const lineX = 184 + Math.max(0, members.length - 1) * dotSpacing + 18;
        trendPoints.push([lineX, y]);
        svg.append(
          element(
            'text',
            {
              class: 'decade-chart__count',
              x: 467,
              y: y + 5,
              'data-decade-count': decade,
            },
            members.length,
          ),
        );
      });
    } else {
      const baseline = 356;
      const left = 96;
      const width = 1008;
      const columnGap = width / Math.max(1, decades.length - 1);
      svg.append(
        element('path', {
          class: 'decade-chart__axis',
          d: 'M24 356 Q318 354 600 357 T1176 355',
        }),
      );
      for (let count = 4; count <= maxCount; count += 4) {
        const y = baseline - count * dotSpacing;
        svg.append(
          element('path', {
            class: 'decade-chart__guide',
            d: `M24 ${y} Q600 ${y + 1} 1176 ${y}`,
          }),
        );
      }
      decades.forEach((decade, decadeIndex) => {
        const members = byDecade.get(decade);
        const x = left + decadeIndex * columnGap;
        svg.append(
          element('path', {
            class: 'decade-chart__axis',
            d: `M${x} ${baseline} L${x} ${baseline + 10}`,
          }),
        );
        svg.append(
          element(
            'text',
            { class: 'decade-chart__label', x, y: 396 },
            shortDecade(decade, lastYear),
          ),
        );
        let fieldPosition = 0;
        categories.forEach((category) => {
          const group = members
            .filter((person) => person.category === category)
            .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));
          if (group.length && fieldPosition) fieldPosition += 10;
          group.forEach((person) => {
            const y = baseline - 13 - fieldPosition;
            fieldTargets.append(
              element('circle', {
                class: 'decade-chart__target decade-chart__target--field',
                cx: x,
                cy: y,
                r: 8,
                'data-person-id': person.id,
              }),
            );
            fieldPosition += dotSpacing;
          });
        });
        members
          .slice()
          .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
          .forEach((person, index) => {
            totalTargets.append(
              element('circle', {
                class: 'decade-chart__target decade-chart__target--total',
                cx: x,
                cy: baseline - 13 - index * dotSpacing,
                r: 8,
                'data-person-id': person.id,
              }),
            );
          });
        const top = baseline - 13 - (members.length - 1) * dotSpacing - 20;
        trendPoints.push([x, top]);
        svg.append(
          element(
            'text',
            {
              class: 'decade-chart__count',
              x,
              y: top - 12,
              'data-decade-count': decade,
            },
            members.length,
          ),
        );
      });
    }
    svg.insertBefore(
      element('path', {
        class: 'decade-chart__trend',
        pathLength: 1,
        d: trendPath(trendPoints, mobile),
      }),
      svg.querySelector('.decade-chart__count'),
    );
    svg
      .querySelectorAll('.decade-chart__axis')
      .forEach((path) => path.setAttribute('pathLength', 1));
    svg.append(fieldTargets, totalTargets);
  }

  {
    const people = laureates;
    if (!people.length) return;
    build(chart.querySelector('.decade-chart__svg--desktop'), people, false);
    build(chart.querySelector('.decade-chart__svg--mobile'), people, true);
    emit(new Event('decade-chart:ready'));
  }
}
