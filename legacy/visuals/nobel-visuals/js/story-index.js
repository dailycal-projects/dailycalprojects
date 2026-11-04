export default function initialize({ root, on, frame }) {
  const article = root.parentElement;
  // Each section jumps to `selector`'s top plus `offset` viewport heights, so it lands where
  // that view has finished animating (offsets come from the phase math in parking-bridge.js).
  const chapters = [
    { label: 'Introduction', selector: '.nobel-opening', offset: 0 },
    {
      label: 'The Laureates',
      selector: '.intro-scrolly [data-focus]',
      offset: 0,
    },
    {
      label: 'Prize Categories',
      selector: '[data-parking-step="fill"]',
      offset: -0.12,
    },
    {
      label: 'By the Decade',
      selector: '[data-timeline-step="year"]',
      offset: 0.22,
    },
    {
      label: 'Around the World',
      selector: '[data-story-step="birth-map"]',
      offset: 0.67,
    },
    {
      label: '24 Laureates',
      selector: '[data-timeline-step="faculty"]',
      offset: 0.2,
    },
    { label: 'Conclusion', selector: '.nobel-closing', offset: 0 },
  ];
  const anchor = (chapter) => {
    const target = article.querySelector(chapter.selector);
    return target
      ? target.getBoundingClientRect().top +
          scrollY +
          chapter.offset * innerHeight
      : null;
  };

  const nav = document.createElement('nav');
  nav.className = 'story-index';
  nav.setAttribute('aria-label', 'Story sections');
  const list = document.createElement('ol');
  const track = document.createElement('span');
  track.className = 'story-index__track';
  const fill = document.createElement('span');
  fill.className = 'story-index__fill';
  list.append(track, fill);
  chapters.forEach((chapter) => {
    const item = document.createElement('li');
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'story-index__link';
    link.innerHTML = `<span class="story-index__label"></span><span class="story-index__dot"></span>`;
    link.querySelector('.story-index__label').textContent = chapter.label;
    link.setAttribute('aria-label', chapter.label);
    link.addEventListener('click', () => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top = anchor(chapter);
      if (top === null) return;
      scrollTo({
        top: Math.ceil(top) + 1,
        behavior: reduce ? 'auto' : 'smooth',
      });
    });
    chapter.link = link;
    chapter.dot = link.querySelector('.story-index__dot');
    item.append(link);
    list.append(item);
  });
  nav.append(list);
  root.append(nav);

  const dotCenter = (chapter) => {
    const dot = chapter.dot.getBoundingClientRect();
    return dot.top + dot.height / 2 - list.getBoundingClientRect().top;
  };

  function update() {
    const middle = innerHeight / 2;
    nav.classList.toggle(
      'is-visible',
      root.getBoundingClientRect().top < middle &&
        root.getBoundingClientRect().bottom > 0,
    );
    let active = 0;
    chapters.forEach((chapter, i) => {
      const top = anchor(chapter);
      if (top !== null && top <= scrollY + middle) active = i;
    });
    chapters.forEach((chapter, i) => {
      chapter.link.classList.toggle('is-active', i === active);
      chapter.link.classList.toggle('is-past', i < active);
      if (i === active) chapter.link.setAttribute('aria-current', 'step');
      else chapter.link.removeAttribute('aria-current');
    });
    const start = dotCenter(chapters[0]);
    track.style.top = fill.style.top = `${start}px`;
    track.style.height = `${dotCenter(chapters.at(-1)) - start}px`;
    fill.style.height = `${dotCenter(chapters[active]) - start}px`;
  }

  let queued = false;
  on(
    'scroll',
    () => {
      if (!queued)
        frame(() => {
          update();
          queued = false;
        });
      queued = true;
    },
    { passive: true },
  );
  on('resize', update);
  on('year-timeline:ready', update);
  update();
}
