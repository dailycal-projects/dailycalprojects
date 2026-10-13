import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { strings } from "../strings";

export type StoryScreen = { key: string; tone: string; body: ReactNode };

/** Instagram-story / Wrapped frame: progress bars, tap right to advance, tap left to go back.
 * Anything marked data-nonav (maps, lists, buttons) keeps its own clicks. */
export function Story({
  screens,
  index,
  setIndex,
  onClose,
}: {
  screens: StoryScreen[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const go = (d: number) => setIndex(Math.max(0, Math.min(screens.length - 1, index + d)));

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, select, textarea")) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const s = screens[index];
  return (
    <div className={`story tone-${s.tone}`}>
      <div className="story-top">
        <div className="bars" aria-hidden>
          {screens.map((sc, i) => (
            <span key={sc.key} className={i < index ? "bar done" : i === index ? "bar now" : "bar"} />
          ))}
        </div>
        <button className="story-x" onClick={onClose} aria-label={strings.story.backToStart}>
          ×
        </button>
      </div>
      <div
        className="story-scroll"
        ref={scroller}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-nonav], button, a, input, select")) return;
          const r = e.currentTarget.getBoundingClientRect();
          go(e.clientX - r.left < r.width * 0.3 ? -1 : 1);
        }}
      >
        <div className="screen" key={s.key}>
          {s.body}
        </div>
      </div>
      <div className="story-nav" data-nonav>
        <button onClick={() => go(-1)} disabled={index === 0} aria-label={strings.story.previous}>
          ←
        </button>
        <button onClick={() => go(1)} disabled={index === screens.length - 1} aria-label={strings.story.nextButton}>
          →
        </button>
      </div>
    </div>
  );
}
