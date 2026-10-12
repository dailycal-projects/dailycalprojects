export default function initialize({ root, shared, emit, laureates }) {
  const lot = root.querySelector('.parking-lot__canvas');
  if (!lot) return;
  const fields = [...lot.querySelectorAll('.parking-lot__field')];
  const colors = shared.colors;
  const groups = [...lot.querySelectorAll('.parking-lot__dots')];
  const svgNS = 'http://www.w3.org/2000/svg';

  {
    const people = laureates;
    fields.forEach((field, index) => {
      const members = people.filter(
        (person) => person.category === field.dataset.category,
      );
      field.querySelector('.parking-lot__count').textContent = members.length;
      groups.forEach((group, layout) => {
        const columns = layout === 0 ? 4 : 7;
        const spacingX = layout === 0 ? 42 : 34;
        const spacingY = layout === 0 ? 38 : 32;
        const centerX = layout === 0 ? 187.5 + index * 205 : 322;
        const centerY = layout === 0 ? 135 : 100 + index * 130;
        members.forEach((person, personIndex) => {
          const row = Math.floor(personIndex / columns);
          const column = personIndex % columns;
          const rowCount = Math.min(columns, members.length - row * columns);
          const dot = document.createElementNS(svgNS, 'circle');
          dot.setAttribute('class', 'parking-lot__dot');
          dot.setAttribute(
            'cx',
            centerX + (column - (rowCount - 1) / 2) * spacingX,
          );
          dot.setAttribute('cy', centerY + row * spacingY);
          dot.setAttribute('r', layout === 0 ? 18 : 15);
          const svg = group.ownerSVGElement;
          let defs = svg.querySelector('defs');
          if (!defs) {
            defs = document.createElementNS(svgNS, 'defs');
            svg.prepend(defs);
          }
          const pattern = document.createElementNS(svgNS, 'pattern');
          const patternId = `parking-photo-${layout}-${person.id}`;
          pattern.setAttribute('id', patternId);
          pattern.setAttribute('width', '1');
          pattern.setAttribute('height', '1');
          pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
          const background = document.createElementNS(svgNS, 'rect');
          background.setAttribute('width', '1');
          background.setAttribute('height', '1');
          background.setAttribute('fill', colors[field.dataset.category]);
          const photo = document.createElementNS(svgNS, 'image');
          photo.setAttribute('href', person.photo);
          photo.setAttribute('x', '.07');
          photo.setAttribute('y', '.07');
          photo.setAttribute('width', '.86');
          photo.setAttribute('height', '.86');
          photo.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          photo.style.filter = 'grayscale(1)';
          pattern.append(background, photo);
          defs.append(pattern);
          dot.setAttribute('fill', `url(#${patternId})`);
          dot.dataset.personId = person.id;
          dot.dataset.personName = person.name;
          dot.dataset.memberIndex = personIndex;
          dot.dataset.categoryCount = members.length;
          group.append(dot);
        });
      });
    });
    emit(new Event('parking-lot:ready'));
  }
}
