import { useEffect, useRef, useState } from "react";

/** Rendered width of an element, kept current with a ResizeObserver. */
export function useWidth<T extends HTMLElement>(fallback = 360) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width || fallback));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, w] as const;
}
