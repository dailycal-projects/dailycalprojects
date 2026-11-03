import { useEffect, useRef, useState } from 'react';

// Retain the last card during its exit animation; a new target cancels removal.
export default function useHoverCard(active, identity) {
  const latest = useRef(active);
  latest.current = active;
  const [retained, setRetained] = useState(active);
  useEffect(() => {
    if (identity) {
      setRetained(latest.current);
      return undefined;
    }
    const timer = setTimeout(() => setRetained(null), 180);
    return () => clearTimeout(timer);
  }, [identity]);
  return { card: active || retained, exiting: !active };
}
