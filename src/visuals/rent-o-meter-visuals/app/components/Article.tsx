import { useEffect, useRef } from "react";
import { assetBase } from "../host";
import { strings } from "../strings";

const a = strings.article;
const GAP = 0.5; // the gap under the article, as a share of the scroll it would take without one
const GREY = [245, 245, 245]; // the article's #f5f5f5
const ICE = [217, 229, 245]; // --ice, the finder's ground

/**
 * The fakeout: a straight-faced story top, all the way down past the fold, that turns into the tool once
 * you scroll. Laid out like
 * the light story template on data.dailycal.org: wordmark bar, centered headline and date, photo
 * with a credit line, then the byline.
 */
export function Article() {
  const ref = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // A gap under the article, half as long as the scroll it takes to bring the form 40% of the way up the
  // screen without one, so the article and the form stay apart for a while. Over it the page color moves from
  // the article's grey to the finder's ice: starting once the text's end is a third of the way up the screen,
  // done when the form is 40% of the way up. The color goes on the parent as --wash, which the article, the
  // stage and the finder all paint with (styles.css).
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    let start = 0;
    let end = 1;
    let frame = 0;

    const paint = () => {
      frame = 0;
      const x = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      const t = x * x * (3 - 2 * x);
      const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
      host.style.setProperty("--wash", `rgb(${mix(GREY[0], ICE[0])}, ${mix(GREY[1], ICE[1])}, ${mix(GREY[2], ICE[2])})`);
      host.style.setProperty("--wash-t", t.toFixed(3));
    };
    const layout = () => {
      el.style.paddingBottom = "0px";
      const top = el.getBoundingClientRect().top + window.scrollY;
      const base = Math.max(1, top + el.offsetHeight - 0.4 * window.innerHeight);
      el.style.paddingBottom = `${Math.round(base * GAP)}px`;
      const text = textRef.current;
      const textEnd = text ? text.getBoundingClientRect().bottom + window.scrollY : top + el.offsetHeight;
      start = textEnd - window.innerHeight / 3;
      end = Math.max(start + 1, top + el.offsetHeight - 0.4 * window.innerHeight);
      paint();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    layout();
    window.addEventListener("resize", layout);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", layout);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      host.style.removeProperty("--wash");
      host.style.removeProperty("--wash-t");
    };
  }, []);

  return (
    <header className="article" ref={ref}>
      <div className="topbar">
        <img src={`${assetBase}dailycal-wordmark.webp`} alt={a.masthead} />
      </div>
      <div className="article-body">
        <h1 className="headline">{a.headline}</h1>
        <time className="date" dateTime={a.dateIso}>
          {a.date}
        </time>
        {/* no photo yet (links.hero is blank): leave the figure out rather than show a broken image */}
        {strings.links.hero && (
          <figure className="hero">
            <img src={strings.links.hero} alt={a.heroAlt} loading="eager" />
            <figcaption>{a.heroCaption}</figcaption>
          </figure>
        )}
        <p className="byline">
          {a.bylineBy} <span className="author">{a.byline}</span>
        </p>
        <div className="article-text" ref={textRef}>
          {a.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </header>
  );
}
