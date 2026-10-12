export default function initialize({ root, shared, on, frame }) {
  const intro = root.querySelector('.intro-scrolly');
  const canvas = intro?.querySelector('.parking-lot__canvas');
  if (!intro || !canvas) return;

  const stages = [...intro.querySelectorAll('[data-parking-step]')];
  const morphStage = stages.find(
    (stage) => stage.dataset.parkingStep === 'morph',
  );
  const categoryStages = stages.filter(
    (stage) => !['context', 'morph'].includes(stage.dataset.parkingStep),
  );
  const fillStage = stages.find(
    (stage) => stage.dataset.parkingStep === 'fill',
  );
  const labNames = new Set([
    'John Clarke',
    'Carolyn Bertozzi',
    'John Clauser',
    'Jennifer Doudna',
    'Saul Perlmutter',
    'George Smoot',
    'Steven Chu',
    'Yuan T. Lee',
    'Luis Alvarez',
    'Melvin Calvin',
    'Donald Glaser',
    'Emilio Segrè',
    'Owen Chamberlain',
    'Edwin McMillan',
    'Glenn Seaborg',
    'Ernest Lawrence',
  ]);
  const manhattanNames = new Set([
    'Ernest Lawrence',
    'Glenn Seaborg',
    'Emilio Segrè',
    'Owen Chamberlain',
    'Luis Alvarez',
    'Harold Urey',
    'Willard Libby',
  ]);
  const decadeChart = intro.querySelector('.decade-chart');
  const fieldStage = intro.querySelector('[data-decade-step="fields"]');
  const totalStage = intro.querySelector('[data-decade-step="totals"]');
  const econMedStage = intro.querySelector(
    '[data-decade-step="economics-medicine"]',
  );
  const portionStage = () =>
    intro.querySelector('[data-timeline-step="portion"]');
  const paaboStage = () =>
    intro.querySelector('[data-timeline-step="portion-paabo"]');
  const portionShare = { 1: 1, '1/2': 1 / 2, '1/3': 1 / 3, '1/4': 1 / 4 };
  function setPie(clone, share, amount) {
    if (amount <= 0.001) {
      if (clone.dataset.pie) {
        clone.style.background = '';
        clone.style.boxShadow = '';
        clone.style.backgroundColor = clone.dataset.color;
        delete clone.dataset.pie;
      }
      return;
    }
    const [r, g, b] = clone.dataset.color.match(/\d+/g);
    const angle = 360 - (360 - share * 360) * amount;
    clone.style.background = `conic-gradient(rgb(${r} ${g} ${b}) 0deg ${angle}deg, rgb(${r} ${g} ${b} / ${
      1 - 0.8 * amount
    }) ${angle}deg 360deg)`;
    clone.style.boxShadow = `inset 0 0 0 1.5px rgb(${r} ${g} ${b} / ${amount})`;
    clone.dataset.pie = 'true';
  }
  const isRecentEconMed = (source) =>
    (source.category === 'Economics' &&
      source.year >= 2000 &&
      source.year < 2010) ||
    (source.category === 'Physiology or Medicine' && source.year >= 2000);
  const ageStage = intro.querySelector('[data-story-step="age"]');
  const ageChart = intro.querySelector('.age-chart');
  const yearStage = () => intro.querySelector('[data-timeline-step="year"]');
  const facultyStage = () =>
    intro.querySelector('[data-timeline-step="faculty"]');
  const yearChart = intro.querySelector('.year-story');
  const facultyChart = intro.querySelector('.faculty-story');
  const mapChart = intro.querySelector('.map-story');
  const mapStage = intro.querySelector('[data-story-step="birth-map"]');
  const overlay = document.createElement('div');
  overlay.className = 'parking-bridge';
  overlay.setAttribute('aria-hidden', 'true');
  root.append(overlay);
  const axisBridge = document.createElement('div');
  axisBridge.className = 'parking-bridge__axis-line';

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  const progress = (stage) =>
    clamp(
      (innerHeight * 0.85 - stage.getBoundingClientRect().top) /
        (innerHeight * 0.7),
    );
  const morphProgress = () =>
    clamp(
      (innerHeight * 0.95 - morphStage.getBoundingClientRect().top) /
        (innerHeight * 1.15),
    );
  let sources = null;
  let clones = new Map();
  let queued = false;

  function capture() {
    const portraits = [...intro.querySelectorAll('.intro-portrait')];
    if (!portraits.length) return false;
    sources = new Map();
    clones = new Map();
    overlay.replaceChildren();
    overlay.append(axisBridge);
    for (const [index, portrait] of portraits.entries()) {
      const rect = portrait.getBoundingClientRect();
      const id = portrait.dataset.personId;
      sources.set(id, {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        size: rect.width,
        opacity: Number(getComputedStyle(portrait).opacity),
        category: portrait.dataset.category,
        year: Number(portrait.dataset.year),
        index,
      });
      const clone = document.createElement('div');
      clone.className = 'parking-bridge__item';
      clone.dataset.personId = id;
      clone.style.backgroundColor = getComputedStyle(portrait).backgroundColor;
      clone.dataset.color = clone.style.backgroundColor;
      const photo = document.createElement('img');
      photo.src = portrait.querySelector('img').src;
      photo.alt = '';
      clone.append(photo);
      overlay.append(clone);
      clones.set(id, clone);
    }
    return true;
  }

  function draw() {
    const morph = morphProgress();
    const figure = intro.querySelector('.intro-visual');
    if (morph <= 0 || figure.getBoundingClientRect().bottom <= 0) {
      intro.classList.remove('is-bridging');
      overlay.style.display = 'none';
      intro.classList.remove('is-faculty');
      canvas.querySelectorAll('.parking-lot__dot').forEach((dot) => {
        dot.style.opacity = 0;
      });
      canvas.querySelectorAll('.parking-lot__dot').forEach((dot) => {
        dot.style.pointerEvents = 'none';
      });
      canvas
        .querySelectorAll('.parking-lot__stripe, .parking-lot__stalls path')
        .forEach((line) => {
          line.style.strokeDashoffset = 1;
          line.style.opacity = 0;
        });
      canvas.querySelectorAll('.parking-lot__field').forEach((field) => {
        field.style.setProperty('--field-opacity', 0);
        field.style.opacity = 0;
      });
      if (decadeChart) decadeChart.style.opacity = 0;
      if (ageChart) ageChart.style.opacity = 0;
      if (yearChart) yearChart.style.opacity = 0;
      if (facultyChart) facultyChart.style.opacity = 0;
      if (mapChart) mapChart.style.opacity = 0;
      if (facultyChart) facultyChart.dataset.orbitReady = 'false';
      intro.querySelectorAll('.map-story__dot').forEach((dot) => {
        dot.style.pointerEvents = 'none';
      });
      intro
        .querySelectorAll(
          '.year-story__dot, .age-chart__person, .faculty-story__mark',
        )
        .forEach((dot) => {
          dot.style.pointerEvents = 'none';
          dot.setAttribute('tabindex', '-1');
        });
      canvas.style.opacity = 0;
      if (morph <= 0) sources = null;
      return;
    }
    if (!sources && !capture()) return;
    intro.classList.add('is-bridging');
    overlay.style.display = 'block';

    const mobile = innerWidth <= 700;
    const layout = mobile ? 'mobile' : 'desktop';
    const targetDots = [
      ...canvas.querySelectorAll(
        `.parking-lot__svg--${layout} .parking-lot__dot`,
      ),
    ];
    const targets = new Map(
      targetDots.map((dot) => [dot.dataset.personId, dot]),
    );
    const lotFill = fillStage ? ease(progress(fillStage)) : 0;
    canvas.classList.toggle('is-filled', lotFill >= 0.999);
    let highlight = null;
    for (const stage of categoryStages) {
      if (
        stage.dataset.parkingStep !== 'fill' &&
        stage.getBoundingClientRect().top < innerHeight * 0.55
      )
        highlight = stage.dataset.parkingStep;
    }
    const shrinking = clamp((morph - 0.04) / 0.7);
    const gathering = clamp((morph - 0.18) / 0.77);
    const dotSize = mobile ? 14 : 16;
    const canvasRect = canvas.getBoundingClientRect();
    const fieldPhase = fieldStage
      ? ease(
          clamp(
            (innerHeight * 0.88 - fieldStage.getBoundingClientRect().top) /
              (innerHeight * 1.08),
          ),
        )
      : 0;
    const econMedPhase = econMedStage
      ? ease(
          clamp(
            (innerHeight * 0.6 - econMedStage.getBoundingClientRect().top) /
              (innerHeight * 0.6),
          ),
        )
      : 0;
    const stagePhase = (stage, start, length) =>
      stage
        ? ease(
            clamp(
              (innerHeight * start - stage.getBoundingClientRect().top) /
                (innerHeight * length),
            ),
          )
        : 0;
    const portionPhase = stagePhase(portionStage(), 0.88, 1);
    const portionFill = stagePhase(portionStage(), -0.1, 0.4);
    const paaboPhase = stagePhase(paaboStage(), 0.88, 1);
    const totalPhase = totalStage
      ? ease(
          clamp(
            (innerHeight * 0.86 - totalStage.getBoundingClientRect().top) /
              (innerHeight * 0.95),
          ),
        )
      : 0;
    const agePhase = ageStage
      ? ease(
          clamp(
            (innerHeight * 0.88 - ageStage.getBoundingClientRect().top) /
              (innerHeight * 0.95),
          ),
        )
      : 0;
    const yearPhase = yearStage()
      ? ease(
          clamp(
            (innerHeight * 0.88 - yearStage().getBoundingClientRect().top) /
              (innerHeight * 1.08),
          ),
        )
      : 0;
    const facultyPhase = facultyStage()
      ? ease(
          clamp(
            (innerHeight * 0.88 - facultyStage().getBoundingClientRect().top) /
              (innerHeight * 1.05),
          ),
        )
      : 0;
    const mapPhase = mapStage
      ? clamp(
          (innerHeight * 0.85 - mapStage.getBoundingClientRect().top) /
            (innerHeight * 1.5),
        )
      : 0;
    const mapMotion = ease(clamp((mapPhase - 0.18) / 0.82));
    intro.classList.toggle('is-faculty', facultyPhase > 0.9);
    canvas.style.opacity = 1 - yearPhase;
    const stripe = canvas.querySelector(
      `.parking-lot__svg--${layout} .parking-lot__stripe`,
    );
    const decadeAxis = decadeChart?.querySelector(
      `.decade-chart__svg--${layout} .decade-chart__axis`,
    );
    if (stripe && decadeAxis && yearPhase > 0 && yearPhase < 0.995) {
      const from = stripe.getBoundingClientRect();
      const to = decadeAxis.getBoundingClientRect();
      axisBridge.style.display = 'block';
      axisBridge.style.left = `${mix(from.left, to.left, yearPhase)}px`;
      axisBridge.style.top = `${mix(from.top, to.top, yearPhase)}px`;
      axisBridge.style.width = `${mix(
        Math.max(from.width, 5),
        Math.max(to.width, 2.5),
        yearPhase,
      )}px`;
      axisBridge.style.height = `${mix(
        Math.max(from.height, 5),
        Math.max(to.height, 2.5),
        yearPhase,
      )}px`;
      const colorPhase = ease(clamp((yearPhase - 0.7) / 0.3));
      axisBridge.style.backgroundColor = `rgb(${Math.round(
        mix(208, 137, colorPhase),
      )} ${Math.round(mix(177, 147, colorPhase))} ${Math.round(
        mix(89, 142, colorPhase),
      )})`;
    } else axisBridge.style.display = 'none';
    if (decadeChart) {
      decadeChart.style.opacity =
        yearPhase * (1 - ease(clamp(mapPhase / 0.2))) * (1 - facultyPhase);
      decadeChart
        .querySelectorAll('.decade-chart__heading, .decade-chart__count')
        .forEach((label) => {
          label.style.opacity =
            (label.classList.contains('decade-chart__count')
              ? totalPhase
              : fieldPhase * (1 - portionFill * (1 - totalPhase))) *
            (1 - ease(clamp(agePhase / 0.38)));
        });
      decadeChart.querySelectorAll('.decade-chart__axis').forEach((line) => {
        line.style.strokeDashoffset = 1 - yearPhase;
        line.style.opacity = ease(clamp((yearPhase - 0.85) / 0.15));
      });
      decadeChart.querySelectorAll('.decade-chart__trend').forEach((line) => {
        line.style.strokeDashoffset = 1 - totalPhase;
      });
      decadeChart.querySelectorAll('.decade-chart__trend').forEach((line) => {
        line.style.opacity = 1 - ease(clamp(agePhase / 0.38));
      });
    }
    const fieldDots = [
      ...(decadeChart?.querySelectorAll(
        `.decade-chart__svg--${layout} .decade-chart__target--field`,
      ) || []),
    ];
    const totalDots = [
      ...(decadeChart?.querySelectorAll(
        `.decade-chart__svg--${layout} .decade-chart__target--total`,
      ) || []),
    ];
    const fieldTargets = new Map(
      fieldDots.map((dot) => [dot.dataset.personId, dot]),
    );
    const totalTargets = new Map(
      totalDots.map((dot) => [dot.dataset.personId, dot]),
    );
    if (ageChart) {
      ageChart.style.opacity =
        agePhase *
        (1 - ease(clamp(mapPhase / 0.2))) *
        (1 - ease(clamp(facultyPhase / 0.45)));
      ageChart
        .querySelectorAll(
          '.age-chart__heading, .age-chart__label, .age-chart__note, .age-chart__legend-line',
        )
        .forEach((label) => {
          label.style.opacity = ease(clamp((agePhase - 0.38) / 0.35));
        });
      ageChart.querySelectorAll('.age-chart__mean-line').forEach((line) => {
        line.style.strokeDashoffset = 1 - agePhase;
      });
    }
    intro
      .querySelectorAll(
        '.intro-scrolly__step--age .intro-scrolly__box, .intro-scrolly__step--year .intro-scrolly__box',
      )
      .forEach((box) => {
        box.style.removeProperty('opacity');
      });
    const ageTargets = new Map(
      [
        ...(ageChart?.querySelectorAll(
          `.age-chart__svg--${layout} .age-chart__person`,
        ) || []),
      ].map((target) => [target.dataset.personId, target]),
    );
    const ageArrival = ease(clamp((agePhase - 0.8) / 0.2));
    const ageInteractive =
      agePhase > 0.999 && mapPhase < 0.01 && facultyPhase < 0.01;
    ageTargets.forEach((target) => {
      target.style.opacity =
        0.6 *
        ageArrival *
        (mapPhase > 0 ? 0 : 1) *
        (1 - ease(clamp(facultyPhase / 0.6)));
      target.style.pointerEvents = ageInteractive ? 'all' : 'none';
      target.setAttribute('tabindex', ageInteractive ? '0' : '-1');
    });
    const yearTargets = new Map(
      [
        ...(yearChart?.querySelectorAll(
          `.year-story__svg--${layout} .year-story__dot`,
        ) || []),
      ].map((target) => [target.dataset.personId, target]),
    );
    const portionTargets = new Map(
      [
        ...(yearChart?.querySelectorAll(
          `.year-story__svg--${layout} .year-story__portion-target`,
        ) || []),
      ].map((target) => [target.dataset.personId, target]),
    );
    const facultyTargets = new Map(
      [
        ...(facultyChart?.querySelectorAll(
          `.faculty-story__svg--${layout} .faculty-story__mark`,
        ) || []),
      ].map((target) => [target.dataset.personId, target]),
    );
    shared.updateMapStory?.(mapPhase);
    const mapTargets = new Map(
      [
        ...(mapChart?.querySelectorAll(
          `.map-story__svg--${layout} .map-story__dot`,
        ) || []),
      ].map((target) => [target.dataset.personId, target]),
    );
    if (mapChart) {
      mapChart.style.opacity =
        (mapPhase > 0.22 ? 1 : 0) * (1 - ease(clamp(facultyPhase / 0.6)));
      const interactive = mapPhase >= 1 && facultyPhase < 0.01;
      mapChart.classList.toggle('is-map-interactive', interactive);
      mapChart
        .querySelectorAll('.map-story__coast, .map-story__borders')
        .forEach((line) => {
          line.style.strokeDashoffset =
            1 - ease(clamp((mapPhase - 0.22) / 0.6));
        });
      mapChart.querySelectorAll('.map-story__land').forEach((land) => {
        land.style.opacity =
          ease(clamp((mapPhase - 0.55) / 0.35)) *
          (land.dataset.zoomOpacity ?? 1);
      });
      mapChart.querySelectorAll('.map-story__heading').forEach((label) => {
        label.style.opacity = ease(clamp((mapPhase - 0.22) / 0.18));
      });
      mapChart.querySelectorAll('.map-story__borders').forEach((line) => {
        line.style.stroke = mapPhase > 0.8 ? '#fff' : '#aab9bd';
      });
      mapChart.querySelectorAll('.map-story__connector').forEach((line) => {
        line.style.strokeDashoffset = 1 - ease(clamp((mapPhase - 0.5) / 0.5));
      });
      mapChart.querySelectorAll('.map-story__labels').forEach((label) => {
        label.style.opacity =
          ease(clamp((mapPhase - 0.72) / 0.28)) *
          (label.dataset.stageOpacity ?? 1);
      });
      mapChart.querySelectorAll('.map-story__dot').forEach((dot) => {
        const visible =
          interactive &&
          dot.dataset.mapVisible !== 'false' &&
          Number(dot.dataset.mapOpacity ?? 1) > 0.01;
        dot.style.opacity = visible ? Number(dot.dataset.mapOpacity ?? 1) : 0;
        dot.style.pointerEvents = visible ? 'all' : 'none';
      });
    }
    if (yearChart) {
      const portionLabels = portionFill * (1 - totalPhase);
      yearChart.style.opacity = Math.max(
        yearPhase * (1 - fieldPhase),
        portionLabels,
      );
      yearChart
        .querySelectorAll('.year-story__heading--year')
        .forEach((el) => el.setAttribute('opacity', 1 - fieldPhase));
      yearChart
        .querySelectorAll(
          '.year-story__heading--portion, .year-story__portion-legend',
        )
        .forEach((el) => el.setAttribute('opacity', portionLabels));
      yearChart
        .querySelectorAll('.year-story__callout')
        .forEach((el) =>
          el.setAttribute('opacity', paaboPhase * (1 - totalPhase)),
        );
      yearChart.style.pointerEvents =
        yearPhase > 0.98 && fieldPhase < 0.05 ? 'auto' : 'none';
      const yearArrival = ease(clamp((yearPhase - 0.78) / 0.22));
      const yearInteractive = yearPhase > 0.999 && fieldPhase < 0.01;
      yearTargets.forEach((dot) => {
        dot.style.opacity = yearArrival * (1 - fieldPhase);
        dot.style.pointerEvents = yearInteractive ? 'all' : 'none';
        dot.setAttribute('tabindex', yearInteractive ? '0' : '-1');
      });
    }
    if (facultyChart) {
      facultyChart.style.opacity = facultyPhase;
      facultyChart.style.pointerEvents = facultyPhase > 0.95 ? 'auto' : 'none';
      const facultyInteractive = facultyPhase > 0.999;
      facultyChart.dataset.orbitReady = facultyInteractive ? 'true' : 'false';
      facultyChart.querySelectorAll('.faculty-story__mark').forEach((mark) => {
        mark.style.opacity = ease(clamp((facultyPhase - 0.78) / 0.22));
        mark.style.pointerEvents = facultyInteractive ? 'all' : 'none';
        mark.setAttribute('tabindex', facultyInteractive ? '0' : '-1');
      });
    }
    decadeChart.style.pointerEvents =
      fieldPhase > 0.98 && agePhase < 0.05 ? 'auto' : 'none';
    ageChart.style.pointerEvents = ageInteractive ? 'auto' : 'none';

    canvas
      .querySelectorAll('.parking-lot__stripe, .parking-lot__stalls path')
      .forEach((line, index) => {
        const lineProgress = clamp((morph - 0.12 - (index % 7) * 0.035) / 0.56);
        line.style.strokeDashoffset = 1 - ease(lineProgress);
        line.style.opacity =
          lineProgress > 0 ? 1 - ease(clamp(yearPhase / 0.18)) : 0;
      });
    canvas.querySelectorAll('.parking-lot__dots').forEach((group) => {
      group.style.opacity = 1;
    });
    canvas.querySelectorAll('.parking-lot__field').forEach((field) => {
      field.style.setProperty('--field-opacity', clamp((morph - 0.42) / 0.38));
      field.style.opacity =
        ease(clamp((morph - 0.7) / 0.25)) * (1 - ease(clamp(yearPhase / 0.18)));
    });

    for (const [id, source] of sources) {
      const dot = targets.get(id);
      if (!dot) continue;
      const target = dot.getBoundingClientRect();
      const fill = lotFill;
      const queueSlot = (source.index * 17) % sources.size;
      const queueRow = Math.floor(queueSlot / 16);
      const queueColumn = queueSlot % 16;
      const rowCount = Math.min(16, sources.size - queueRow * 16);
      const queueX =
        innerWidth / 2 +
        (queueColumn - (rowCount - 1) / 2) * (mobile ? 18 : 30);
      const queueY =
        canvasRect.top - (mobile ? 105 : 135) + queueRow * (mobile ? 22 : 27);
      const motion = Math.sin(Math.PI * gathering);
      const wanderX =
        Math.sin(source.index * 29.17) * (mobile ? 5 : 9) * motion;
      const wanderY =
        Math.cos(source.index * 47.83) * (mobile ? 4 : 7) * motion;
      const centerX = mix(
        mix(source.x, queueX, gathering) + wanderX,
        target.x + target.width / 2,
        fill,
      );
      const centerY =
        mix(
          mix(source.y, queueY, gathering) + wanderY,
          target.y + target.height / 2,
          fill,
        ) -
        Math.sin(fill * Math.PI) * 12;
      const size = mix(
        mix(source.size, dotSize, shrinking),
        target.width,
        fill,
      );
      const clone = clones.get(id);
      const portionTarget = portionTargets.get(id);
      setPie(clone, 1, 0);
      clone.style.pointerEvents =
        fieldPhase > 0.999 && agePhase < 0.01 ? 'auto' : 'none';
      const parked = fill >= 0.999 && yearPhase < 0.01;
      // Don't fade in the destination on the frame that replaces a moving portrait.
      dot.style.transition =
        parked && dot.dataset.wasParked === 'true'
          ? 'opacity .35s ease'
          : 'none';
      dot.dataset.wasParked = String(parked);
      dot.style.pointerEvents = parked ? 'all' : 'none';
      if (facultyPhase > 0 && ageTargets.has(id)) {
        const from = (
          mapTargets.get(id) || ageTargets.get(id)
        ).getBoundingClientRect();
        const to = facultyTargets.get(id)?.getBoundingClientRect();
        const position = ease(facultyPhase);
        const targetX = to ? to.x + to.width / 2 : from.x + from.width / 2;
        const targetY = to ? to.y + to.height / 2 : from.y + from.height / 2;
        const facultySize = to
          ? mix(from.width, to.width, position)
          : from.width;
        const x = mix(from.x + from.width / 2, targetX, position);
        const y = mix(from.y + from.height / 2, targetY, position);
        clone.style.width = `${facultySize}px`;
        clone.style.height = `${facultySize}px`;
        clone.style.transform = `translate3d(${x - facultySize / 2}px, ${
          y - facultySize / 2
        }px, 0)`;
        const mapSource = mapTargets.get(id);
        const sourceVisible =
          !mapSource ||
          (mapSource.dataset.mapVisible !== 'false' &&
            Number(mapSource.dataset.mapOpacity ?? 1) > 0.01);
        clone.style.opacity = sourceVisible
          ? to
            ? 1 - ease(clamp((facultyPhase - 0.78) / 0.22))
            : 1 - facultyPhase
          : 0;
        clone.style.setProperty(
          '--photo-opacity',
          to ? ease(clamp((facultyPhase - 0.35) / 0.45)) : 0,
        );
        dot.style.opacity = 0;
        continue;
      }
      if (mapPhase > 0 && mapTargets.has(id) && ageTargets.has(id)) {
        const from = ageTargets.get(id).getBoundingClientRect();
        const to = mapTargets.get(id).getBoundingClientRect();
        const mapSize = mix(from.width, to.width, mapMotion);
        const x = mix(from.x + from.width / 2, to.x + to.width / 2, mapMotion);
        const y = mix(
          from.y + from.height / 2,
          to.y + to.height / 2,
          mapMotion,
        );
        clone.style.width = `${mapSize}px`;
        clone.style.height = `${mapSize}px`;
        clone.style.transform = `translate3d(${x - mapSize / 2}px,${
          y - mapSize / 2
        }px,0)`;
        clone.style.opacity = mapPhase < 1 ? 1 : 0;
        clone.style.setProperty('--photo-opacity', 0);
        clone.style.pointerEvents = 'none';
        dot.style.opacity = 0;
        continue;
      }
      if (agePhase > 0 && totalTargets.has(id) && ageTargets.has(id)) {
        const from = totalTargets.get(id).getBoundingClientRect();
        const to = ageTargets.get(id).getBoundingClientRect();
        const position = ease(agePhase);
        const ageSize = mix(from.width, to.width, position);
        const ageX = mix(
          from.x + from.width / 2,
          to.x + to.width / 2,
          position,
        );
        const ageY = mix(
          from.y + from.height / 2,
          to.y + to.height / 2,
          position,
        );
        clone.style.width = `${ageSize}px`;
        clone.style.height = `${ageSize}px`;
        clone.style.transform = `translate3d(${ageX - ageSize / 2}px, ${
          ageY - ageSize / 2
        }px, 0)`;
        clone.style.opacity = 1 - ease(clamp((agePhase - 0.8) / 0.2));
        clone.style.setProperty('--photo-opacity', 0);
        dot.style.opacity = 0;
        continue;
      }
      if (fieldPhase > 0 && fieldTargets.has(id) && totalTargets.has(id)) {
        const yearRect = yearTargets.get(id)?.getBoundingClientRect() || target;
        const fieldRect = fieldTargets.get(id).getBoundingClientRect();
        const totalRect = totalTargets.get(id).getBoundingClientRect();
        const fieldX = fieldRect.x + fieldRect.width / 2;
        const fieldY = fieldRect.y + fieldRect.height / 2;
        const totalX = totalRect.x + totalRect.width / 2;
        const totalY = totalRect.y + totalRect.height / 2;
        let byFieldX = mix(yearRect.x + yearRect.width / 2, fieldX, fieldPhase);
        let byFieldY = mix(
          yearRect.y + yearRect.height / 2,
          fieldY,
          fieldPhase,
        );
        if (portionTarget) {
          const portionRect = portionTarget.getBoundingClientRect();
          byFieldX = mix(
            byFieldX,
            portionRect.x + portionRect.width / 2,
            portionPhase,
          );
          byFieldY = mix(
            byFieldY,
            portionRect.y + portionRect.height / 2,
            portionPhase,
          );
        }
        const decadeX = mix(byFieldX, totalX, totalPhase);
        const decadeY = mix(byFieldY, totalY, totalPhase);
        const decadeSize = mix(
          yearRect.width,
          mix(fieldRect.width, totalRect.width, totalPhase),
          fieldPhase,
        );
        clone.style.width = `${decadeSize}px`;
        clone.style.height = `${decadeSize}px`;
        clone.style.transform = `translate3d(${decadeX - decadeSize / 2}px, ${
          decadeY - decadeSize / 2
        }px, 0)`;
        const econMedDim = isRecentEconMed(source)
          ? 0
          : econMedPhase * (1 - portionPhase);
        const paaboDim =
          portionTarget?.dataset.highlight === 'paabo' ? 0 : paaboPhase;
        clone.style.opacity =
          1 - 0.85 * Math.max(econMedDim, paaboDim) * (1 - totalPhase);
        setPie(
          clone,
          portionShare[portionTarget?.dataset.portion] ?? 1,
          portionFill * (1 - totalPhase),
        );
        clone.style.setProperty('--photo-opacity', 0);
        dot.style.opacity = 0;
        continue;
      }
      if (yearPhase > 0 && yearTargets.has(id)) {
        const to = yearTargets.get(id).getBoundingClientRect();
        const position = ease(yearPhase);
        const yearSize = mix(target.width, to.width, position);
        const yearX = mix(
          target.x + target.width / 2,
          to.x + to.width / 2,
          position,
        );
        const yearY = mix(
          target.y + target.height / 2,
          to.y + to.height / 2,
          position,
        );
        clone.style.width = `${yearSize}px`;
        clone.style.height = `${yearSize}px`;
        clone.style.transform = `translate3d(${yearX - yearSize / 2}px, ${
          yearY - yearSize / 2
        }px, 0)`;
        clone.style.opacity = 1 - ease(clamp((yearPhase - 0.78) / 0.22));
        clone.style.setProperty(
          '--photo-opacity',
          1 - ease(clamp(yearPhase / 0.5)),
        );
        dot.style.opacity = 0;
        continue;
      }
      clone.style.width = `${size}px`;
      clone.style.height = `${size}px`;
      clone.style.transform = `translate3d(${centerX - size / 2}px, ${
        centerY - size / 2
      }px, 0)`;
      clone.style.opacity =
        fill >= 0.999 ? 0 : mix(source.opacity, 1, clamp(morph / 0.35));
      clone.style.setProperty('--photo-opacity', 1);
      const selected =
        highlight === 'lab'
          ? labNames.has(dot.dataset.personName)
          : ['manhattan', 'oppenheimer'].includes(highlight)
          ? manhattanNames.has(dot.dataset.personName)
          : highlight === 'economics-medicine'
          ? ['Economics', 'Physiology or Medicine'].includes(source.category)
          : highlight === 'literature'
          ? source.category === 'Literature'
          : true;
      dot.style.opacity = fill >= 0.999 ? (selected ? 1 : 0.12) : 0;
    }
  }

  function queueDraw() {
    if (queued) return;
    queued = true;
    frame(() => {
      queued = false;
      draw();
    });
  }
  on('scroll', queueDraw, { passive: true });
  on('resize', () => {
    sources = null;
    queueDraw();
  });
  on('intro-portraits:ready', queueDraw);
  on('parking-lot:ready', queueDraw);
  on('decade-chart:ready', queueDraw);
  on('age-chart:ready', queueDraw);
  on('year-timeline:ready', queueDraw);
  on('birth-map:ready', queueDraw);
  queueDraw();
}
