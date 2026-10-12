export default function initialize({ root, shared, emit, laureates }) {
  const ageChart = root.querySelector('.age-chart');
  if (!ageChart) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const colors = shared.colors;
  const make = (tag, attrs = {}, value) => {
    const node = document.createElementNS(svgNS, tag);
    for (const [key, data] of Object.entries(attrs))
      node.setAttribute(key, data);
    if (value != null) node.textContent = value;
    return node;
  };
  const mean = (values) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const pathThrough = (points, mobile) =>
    points
      .map(([x, y], index) => {
        if (!index) return `M${x} ${y}`;
        const [priorX, priorY] = points[index - 1];
        const bend = index % 2 ? 1.5 : -1.5;
        return mobile
          ? `Q${(priorX + x) / 2 + bend} ${(priorY + y) / 2} ${x} ${y}`
          : `Q${(priorX + x) / 2} ${(priorY + y) / 2 + bend} ${x} ${y}`;
      })
      .join(' ');

  function buildAge(svg, people, mobile) {
    const lastYear = Math.max(...people.map((person) => Number(person.year)));
    const first =
      Math.floor(
        Math.min(...people.map((person) => Number(person.year))) / 10,
      ) * 10;
    const last = Math.floor(lastYear / 10) * 10;
    const decades = Array.from(
      { length: (last - first) / 10 + 1 },
      (_, index) => first + index * 10,
    );
    const points = [];
    const markerGroup = make('g', { class: 'age-chart__markers' });
    svg.append(
      make(
        'text',
        {
          class: 'age-chart__heading',
          x: mobile ? 20 : 74,
          y: mobile ? 25 : 38,
        },
        'Age when the prize was awarded',
      ),
    );
    if (mobile) {
      const startY = 80;
      const rowGap = Math.min(59, 570 / Math.max(1, decades.length - 1));
      const ageX = (age) => 180 + ((age - 30) / 60) * 265;
      [40, 60, 80].forEach((age) => {
        const x = ageX(age);
        svg.append(
          make(
            'text',
            { class: 'age-chart__note', x: x - 7, y: 55 },
            String(age),
          ),
        );
      });
      decades.forEach((decade, index) => {
        const members = people.filter(
          (person) => Math.floor(person.year / 10) * 10 === decade,
        );
        const y = startY + index * rowGap;
        const average = mean(
          members.map((person) => Number(person.ageAtAward)),
        );
        members.forEach((person, item) =>
          markerGroup.append(
            make('circle', {
              class: 'age-chart__person',
              cx: ageX(Number(person.ageAtAward)),
              cy: y + ((item % 3) - 1) * 5,
              r: 8,
              fill: colors[person.category],
              'data-person-id': person.id,
            }),
          ),
        );
        points.push([ageX(average), y]);
      });
    } else {
      const left = 96;
      const width = 1008;
      const axisY = 356;
      const ageY = (age) => axisY - (age - 20) * 3.8;
      [40, 60, 80].forEach((age) => {
        const y = ageY(age);
        svg.append(
          make(
            'text',
            { class: 'age-chart__note', x: 39, y: y + 4 },
            String(age),
          ),
        );
      });
      decades.forEach((decade, index) => {
        const members = people.filter(
          (person) => Math.floor(person.year / 10) * 10 === decade,
        );
        const x = left + (index * width) / Math.max(1, decades.length - 1);
        const average = mean(
          members.map((person) => Number(person.ageAtAward)),
        );
        members.forEach((person, item) =>
          markerGroup.append(
            make('circle', {
              class: 'age-chart__person',
              cx: x + ((item * 7) % 27) - 13,
              cy: ageY(Number(person.ageAtAward)),
              r: 8,
              fill: colors[person.category],
              'data-person-id': person.id,
            }),
          ),
        );
        points.push([x, ageY(average)]);
      });
    }
    svg.append(markerGroup);
    svg.append(
      make('path', {
        class: 'age-chart__mean-line',
        pathLength: 1,
        d: pathThrough(points, mobile),
      }),
    );
    points.forEach(([x, y]) =>
      svg.append(
        make('circle', { class: 'age-chart__mean-dot', cx: x, cy: y, r: 6 }),
      ),
    );
    const legendX = mobile ? 338 : 980;
    const legendY = mobile ? 28 : 34;
    svg.append(
      make('path', {
        class: 'age-chart__legend-line',
        d: `M${legendX} ${legendY} L${legendX + 28} ${legendY}`,
      }),
    );
    svg.append(
      make(
        'text',
        { class: 'age-chart__note', x: legendX + 34, y: legendY + 4 },
        'Average',
      ),
    );
  }

  {
    const people = laureates;
    buildAge(ageChart.querySelector('.age-chart__svg--desktop'), people, false);
    buildAge(ageChart.querySelector('.age-chart__svg--mobile'), people, true);
    emit(new Event('age-chart:ready'));
  }
}
