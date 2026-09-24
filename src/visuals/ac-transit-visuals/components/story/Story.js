"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureData, everything, loadVisualizationData } from "../ridership-data";
import StoryMap from "./StoryMap";
import { resolvePlaces } from "./prepare";
import { BOUNDS, MAP_ONE, MAP_THREE, MAP_TWO, resolveScenes } from "./steps";
import { T, t } from "../../lib/i18n";
import { ViewLink, scrollRoot } from "../../lib/host";

// Where in the viewport a passage has to reach before the map switches to it.
const TRIGGER = 0.62;
// Where the top of a scrub step's empty stretch has to reach to start moving
// the week.
const SCRUB_START = 0.1;
// The months the traffic passages name, which must be loaded exactly.
const SPEED_ANCHORS = ["2020-02", "2020-12", "2021-09", "2026-02"];

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

// A sticky map with passages scrolling over it. The passage that has crossed
// the trigger line owns the map; on a `scrub` step the week is instead
// interpolated across the gap before its passage, so scrolling through that
// empty stretch drives the time bar the way dragging it in the app would.
function ScrollySection({ data, places, steps, first = "85vh" }) {
  const apiRef = useRef(null);
  const stepRefs = useRef([]);
  const cardRefs = useRef([]);
  const sectionRef = useRef(null);
  const scenes = useMemo(
    () => (data && places ? resolveScenes(steps, data, places) : null),
    [data, places, steps],
  );

  const update = useCallback(() => {
    const api = apiRef.current;
    const section = sectionRef.current;
    if (!api || !scenes || !section) return;
    const viewport = window.innerHeight;
    const box = section.getBoundingClientRect();
    if (box.bottom < -viewport || box.top > viewport * 2) return;
    const trigger = viewport * TRIGGER;
    const cards = cardRefs.current.map((card) => card.getBoundingClientRect());
    let active = 0;
    cards.forEach((rect, index) => {
      if (rect.top < trigger) active = index;
    });
    let week = scenes[active].weekIndex;
    const next = active + 1;
    if (next < steps.length && steps[next].scrub) {
      // The scrub waits until the passage before it has all but left the
      // screen, so what that passage describes stays on the map while it is
      // being read, and finishes as the new passage reaches the trigger.
      const stepTop = stepRefs.current[next].getBoundingClientRect().top;
      const start = viewport * SCRUB_START;
      const end = trigger - (cards[next].top - stepTop);
      if (stepTop < start && start > end) {
        const progress = clamp01((start - stepTop) / (start - end));
        week = Math.round(scenes[active].weekIndex + (scenes[next].weekIndex - scenes[active].weekIndex) * progress);
      }
    }
    const rect = cards[active];
    const alpha = clamp01((viewport * 0.95 - rect.top) / (viewport * 0.2))
      * clamp01((rect.bottom - viewport * 0.04) / (viewport * 0.18));
    api.update(scenes[active], week, { rect, alpha });
    // Keep the address bar pointed at whichever passage owns the map, so
    // copying the URL at any point links straight back to that visual. Only
    // the section the trigger line crosses may write it: every section within
    // reach of the viewport runs this, and two of them each writing their own
    // passage would trade the hash back and forth on every scroll frame.
    // WebKit throws once replaceState passes 100 calls in 10 seconds, and the
    // throw surfaces as a page-level error, so a refused write is dropped --
    // the hash is a convenience, never worth the page.
    const owns = box.top <= trigger && box.bottom > trigger;
    const activeId = steps[active].id;
    if (owns && activeId && window.location.hash.slice(1) !== activeId) {
      try {
        window.history.replaceState(null, "", `#${activeId}`);
      } catch {
        // Throttled; the next step change tries again.
      }
    }
  }, [scenes, steps]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };
    const scroller = scrollRoot();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [update]);

  const initialBounds = BOUNDS[steps[0].scene.bounds];
  return (
    <section className="scrolly" ref={sectionRef}>
      <div className="scrolly-graphic">
        <StoryMap data={data} initialBounds={initialBounds} apiRef={apiRef} onReady={update} />
      </div>
      <div className="scrolly-steps">
        {steps.map((step, index) => (
          <div
            className={`scrolly-step${step.scrub ? " scrub" : ""}`}
            key={step.id}
            ref={(element) => { stepRefs.current[index] = element; }}
            style={index === 0 ? { paddingTop: first } : undefined}
          >
            <div
              className="scrolly-card"
              id={step.id}
              ref={(element) => { cardRefs.current[index] = element; }}
            >
              {step.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {step.link ? (
                <p className="scrolly-cta-wrap">
                  <ViewLink className="story-cta" view={step.link.view}>{step.link.label}</ViewLink>
                </p>
              ) : null}
            </div>
          </div>
        ))}
        <div className="scrolly-tail" />
      </div>
    </section>
  );
}

export default function Story() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // The story reads block groups, every era's corridors and the commute
    // profiles, so it loads everything the explorer would fetch on demand.
    loadVisualizationData()
      .then(async (loaded) => {
        await ensureData(loaded, everything(loaded));
        // The traffic section colours corridors by observed speed, which lives
        // in one file per month. Fetching all 89 would be megabytes for a
        // section that scrubs across six years, so it takes the months the
        // passages stop on plus a step every half year; the map falls back to
        // the nearest loaded month in between.
        const snapshots = loaded.service?.snapshots || [];
        const wanted = snapshots.filter((snap, index) => (
          index % 6 === 0 || SPEED_ANCHORS.includes(snap.id)
        ));
        await Promise.all(wanted.map((snap) => ensureData(loaded, { serviceMonth: snap })));
        return loaded;
      })
      .then((loaded) => { if (!cancelled) setData(loaded); })
      .catch((loadError) => { if (!cancelled) setError(loadError); });
    return () => { cancelled = true; };
  }, []);

  const places = useMemo(() => (data ? resolvePlaces(data) : null), [data]);

  // Land on whichever passage the URL names. Every step height is fixed in
  // vh regardless of `data`, so the target's position is stable on first
  // paint and this doesn't need to wait for the fetch above.
  useEffect(() => {
    const jumpToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ block: "start" });
    };
    jumpToHash();
    window.addEventListener("hashchange", jumpToHash);
    return () => window.removeEventListener("hashchange", jumpToHash);
  }, []);

  return (
    <article className="story">
      <header className="story-hero">
        <h1>{t("story.title")}</h1>
        <p className="story-byline">
          <T id="story.byline" c={[<a href="https://www.dailycal.org/users/profile/john%20schultz/" target="_blank" rel="noreferrer" />]} />
        </p>
        <p className="story-lede">{t("story.lede")}</p>
        {error ? (
          <p className="story-error">{t("story.error", { message: error.message })}</p>
        ) : null}
      </header>

      <ScrollySection
        data={data}
        places={places}
        steps={MAP_ONE}
      />

      <div className="story-body">
        <p><T id="story.visitApp" c={[<ViewLink view="explore" />]} /></p>

        <h2>{t("story.headingWhereDo")}</h2>
      </div>

      <ScrollySection
        data={data}
        places={places}
        steps={MAP_TWO}
        first="70vh"
      />

      <div className="story-body">
        <h2>{t("story.headingTraffic")}</h2>
      </div>

      <ScrollySection
        data={data}
        places={places}
        steps={MAP_THREE}
        first="70vh"
      />

      <div className="story-body">
        <p className="story-cta-wrap">
          <ViewLink className="story-cta" view="explore">{t("story.seeData")}</ViewLink>
          <ViewLink className="story-cta" view="methodology">{t("story.seeMethodologyEnd")}</ViewLink>
        </p>
        <p className="story-credit">
          <T id="story.transitland" c={[<a href="https://www.transit.land/terms" target="_blank" rel="noreferrer" />]} />
        </p>
      </div>

    </article>
  );
}
