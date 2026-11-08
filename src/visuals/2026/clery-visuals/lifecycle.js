// Listeners and scheduled work belong to the mounted view, not the page.
export function createScope() {
  const cleanups = new Set();
  let active = true;
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    const remove = () => {
      target.removeEventListener(type, handler, options);
      cleanups.delete(remove);
    };
    cleanups.add(remove);
    return remove;
  };
  const frame = (callback) => {
    const id = requestAnimationFrame(() => {
      cleanups.delete(cancel);
      if (active) callback();
    });
    const cancel = () => cancelAnimationFrame(id);
    cleanups.add(cancel);
  };
  return {
    listen,
    frame,
    dispose() {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
      cleanups.clear();
    },
  };
}
