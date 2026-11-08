import colors from './js/category-colors';
import historicalNotes from './js/historical-notes';
import intro from './js/intro';
import parkingLot from './js/parking-lot';
import decade from './js/decade';
import ageChart from './js/age-chart';
import yearTimeline from './js/year-timeline';
import mapStory from './js/map-story';
import parkingBridge from './js/parking-bridge';
import storyIndex from './js/story-index';
import people from './data/laureates-full.json';
import facultyProfiles from './data/faculty-profiles.json';
import world from './data/world-50m.json';
import mapData from './data/map-ready.json';
import land from './data/land-10m.json';
import states from './data/us-states-10m.json';
import photos from './photos';

// All DOM queries and custom events belong to this mounted graphic. Window
// scroll/resize listeners and animation frames are released on Gatsby navigation.
export function mountNobel(root) {
  const events = new EventTarget();
  const frames = new Set();
  const listeners = [];
  let active = true;

  // Preserve the original React-owned nodes, including the MDX scroll passages.
  // Restoring their identity also makes effect remounts safe in Strict Mode.
  const originals = [root, ...root.querySelectorAll('*')].map((element) => ({
    element,
    children: [...element.childNodes],
    attributes: [...element.attributes].map(({ name, value }) => [name, value]),
  }));

  const dispose = () => {
    active = false;
    listeners.forEach(([target, name, callback, options]) => {
      target.removeEventListener(name, callback, options);
    });
    frames.forEach((id) => window.cancelAnimationFrame(id));
    const dialog = root.querySelector('dialog');
    if (dialog?.open) dialog.close();
    originals.forEach(({ element, children, attributes }) => {
      element.replaceChildren(...children);
      [...element.attributes].forEach(({ name }) =>
        element.removeAttribute(name),
      );
      attributes.forEach(([name, value]) => element.setAttribute(name, value));
    });
  };

  const listen = (target, name, callback, options) => {
    target.addEventListener(name, callback, options);
    listeners.push([target, name, callback, options]);
  };
  const frame = (callback) => {
    if (!active) return;
    const id = window.requestAnimationFrame((time) => {
      frames.delete(id);
      if (active) callback(time);
    });
    frames.add(id);
  };
  const context = {
    root,
    shared: { colors },
    listen,
    frame,
    on: (name, callback, options) =>
      listen(
        name === 'scroll' || name === 'resize' ? window : events,
        name,
        callback,
        options,
      ),
    emit: (event) => events.dispatchEvent(event),
    laureates: people.map((person) => ({
      ...person,
      photo: photos[person.photo],
    })),
    facultyProfiles,
    world,
    map: {
      ...mapData,
      people: mapData.people.map((person) => ({
        ...person,
        awardAffiliations: [...person.awardAffiliations],
      })),
    },
    land,
    states,
  };

  try {
    [
      historicalNotes,
      intro,
      parkingLot,
      decade,
      ageChart,
      yearTimeline,
      mapStory,
      parkingBridge,
      storyIndex,
    ].forEach((initialize) => initialize(context));
  } catch (error) {
    dispose();
    throw error;
  }
  return dispose;
}
