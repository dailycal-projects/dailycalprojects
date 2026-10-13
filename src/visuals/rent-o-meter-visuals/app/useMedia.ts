import { useEffect, useState } from "react";

/** Whether a CSS media query matches right now, kept current as the window changes. */
export function useMedia(q: string): boolean {
  const [on, setOn] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setOn(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, [q]);
  return on;
}
