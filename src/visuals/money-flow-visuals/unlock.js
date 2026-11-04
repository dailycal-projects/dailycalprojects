// 32-bit FNV-1a hash of a string.
const hash = (s) => [...s].reduce(
  // eslint-disable-next-line no-bitwise
  (h, c) => Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0,
  0x811c9dc5,
);

// Only the hash of the URL parameter is stored, so reading the source won't reveal it.
const KEY = 0x775b1561;

// True when the page URL has the unlocking parameter, whatever its value.
const isUnlocked = () => typeof window !== 'undefined'
  && [...new URLSearchParams(window.location.search).keys()].some((k) => hash(k) === KEY);

export default isUnlocked;
