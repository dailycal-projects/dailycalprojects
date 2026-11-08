"use client";

/* The methodology, told as one figure that changes under the reader.

   The page is a scrollytelling section: a route diagram held in the middle of
   the frame on one side, passages scrolling past on the other, each passage
   naming the state the figure should be in. It follows the story page's
   mechanic deliberately -- the same scroll, the same sticky frame -- so a
   reader arriving from the story does not have to learn a second way of
   reading.

   The styling is a blackboard rather than a document: one dark plane that
   does not follow the site theme, no panels or cards, and every quantity
   named in the colour of the thing it measures, so the words `coverage
   factor` in a sentence and the green block they put on a bar are
   recognisably the same object. Prose is Georgia; only the formulae are set
   in a maths face.

   Figures in the closing table come from the pipeline artifacts; the
   histogram beside it is built by the same pass (w-histogram.json). */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";

import RouteFigure from "./figure";
import HISTOGRAM from "./w-histogram.json";
import { T, t } from "../../lib/i18n";
import { ViewLink, scrollRoot } from "../../lib/host";

const TRIGGER = 0.62;

function M({ children }) {
  const html = useMemo(
    () => katex.renderToString(children.trim(), { throwOnError: false, strict: "ignore" }),
    [children],
  );
  return <span className="mth-m" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Eq({ children }) {
  const html = useMemo(
    () => katex.renderToString(children.trim(), { displayMode: true, throwOnError: false, strict: "ignore" }),
    [children],
  );
  return <div className="mth-eq"><div className="mth-eq-body" dangerouslySetInnerHTML={{ __html: html }} /></div>;
}

/* A term in the colour of the thing it names in the figure. */
function C({ c, children }) {
  return <span className={`mth-c mth-c-${c}`}>{children}</span>;
}

/* Each entry is one passage and the figure state it puts on screen. A state
   repeated across passages simply holds, which is what lets a single idea run
   over two paragraphs without the diagram flickering. */
const STEPS = [
  {
    state: "observed",
    body: <p>{t("methodology.step.intro")}</p>,
  },
  {
    state: "observed",
    body: <p><T id="methodology.step.observed" c={[<C c="observed" />]} /></p>,
  },
  {
    state: "coverage",
    body: (
      <>
        <p>
          <T id="methodology.step.coverage" c={[
            <C c="coverage" />,
            <M>{String.raw`\textcolor{#83C167}{c_{route}} = N_{present}/N_{total}`}</M>,
            <M>{String.raw`N_{present}`}</M>,
          ]} />
        </p>
      </>
    ),
  },
  {
    state: "coverage",
    body: (
      <p>
        <T id="methodology.step.coverageApplied"
          c={[<M>{String.raw`\textcolor{#83C167}{c_{route}}`}</M>]} />
      </p>
    ),
  },
  {
    state: "calibration",
    body: (
      <p>
        <T id="methodology.step.calibration" c={[
          <C c="calibration" />,
          <M>{String.raw`r_{route}`}</M>,
          <M>{String.raw`\textcolor{#5CD0B3}{c_{pra}} = (r_{observed} \cdot \textcolor{#83C167}{c_{route}}) / r_{pra}`}</M>,
        ]} />
      </p>
    ),
  },
  {
    state: "donors",
    body: <p>{t("methodology.step.sparse")}</p>,
  },
  {
    state: "donorFill",
    body: <p>{t("methodology.step.donors")}</p>,
  },
  {
    state: "weeks",
    body: <p>{t("methodology.step.weeks")}</p>,
  },
  {
    state: "weeks",
    body: (
      <>
        <p><T id="methodology.step.weightIntro" c={[<M>w</M>]} /></p>
        <ul className="mth-list">
          <li>{t("methodology.step.exclude1")}</li>
          <li>{t("methodology.step.exclude2")}</li>
          <li>{t("methodology.step.exclude3")}</li>
        </ul>
        <p><T id="methodology.step.weightApplied" c={[<C c="schedule" />]} /></p>
        <Eq>
          {String.raw`r_{week} = r_{month}\bigl(\textcolor{#F0AC5F}{w \cdot p_{schedule}} + \textcolor{#58C4DD}{(1-w) \cdot p_{week}}\bigr)`}
        </Eq>
      </>
    ),
  },
  {
    state: "mix",
    body: <p><T id="methodology.step.mix" c={[<M>w</M>, <M>w</M>, <M>w</M>]} /></p>,
  },
  { state: "blend", body: <p>{t("methodology.step.blend")}</p> },
];

const CASES = [
  ["methodology.case0", "6,929", "62.3%"],
  ["methodology.case1", "1,754", "15.8%"],
  ["methodology.case2", "1,904", "17.1%"],
  ["methodology.case3", "527", "4.7%"],
];

// A round step that puts three or four gridlines under the tallest bar.
function niceStep(max) {
  return [100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000].find((s) => max / s <= 4) || 10000;
}

function Histogram() {
  const { all, y2019 } = HISTOGRAM;
  const max = Math.max(...all);
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const yTicks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const w = 560;
  const h = 262;
  const pad = { l: 64, r: 16, t: 24, b: 58 };
  const plotW = w - pad.l - pad.r;
  const bw = plotW / all.length;
  const y = (v) => pad.t + (1 - v / top) * (h - pad.t - pad.b);
  return (
    <figure className="mth-hist">
      <svg viewBox={`0 0 ${w} ${h}`}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <rect className="mth-hist-grid" x={pad.l} y={y(tick)} width={plotW} height={1} />
            <text className="mth-fig-tick mth-hist-ytick" x={pad.l - 8} y={y(tick) + 4}>
              {tick.toLocaleString()}
            </text>
          </g>
        ))}
        {all.map((value, i) => (
          <g key={i}>
            <rect className="mth-fig-bar" x={pad.l + i * bw + 1.5} width={bw - 3} y={y(value)}
              height={h - pad.b - y(value)}
              style={{ fill: "var(--mth-observed)", stroke: "var(--mth-observed)" }} />
            <rect className="mth-fig-bar" x={pad.l + i * bw + 1.5} width={bw - 3} y={y(y2019[i])}
              height={h - pad.b - y(y2019[i])}
              style={{ fill: "var(--mth-schedule)", stroke: "var(--mth-schedule)" }} />
          </g>
        ))}
        <rect className="mth-fig-axis" x={pad.l} y={pad.t} width={1} height={h - pad.t - pad.b} />
        <rect className="mth-fig-axis" x={pad.l} y={h - pad.b} width={plotW} height={1} />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <rect className="mth-fig-axis" x={pad.l + tick * plotW} y={h - pad.b} width={1} height={5} />
            <text className="mth-fig-tick" x={pad.l + tick * plotW} y={h - pad.b + 20}>
              {t("methodology.histogramTick", { t: tick })}
            </text>
          </g>
        ))}
        <text className="mth-fig-label mth-hist-xtitle" x={pad.l + plotW / 2} y={h - 8}>
          {t("methodology.histogramAxisX")}
        </text>
        <text className="mth-fig-label mth-hist-ytitle"
          transform={`translate(14 ${pad.t + (h - pad.t - pad.b) / 2}) rotate(-90)`}>
          {t("methodology.histogramAxisY")}
        </text>
      </svg>
      <figcaption>{t("methodology.histogramCaption")}</figcaption>
    </figure>
  );
}

export default function Methodology() {
  const [active, setActive] = useState(0);
  const cardRefs = useRef([]);
  const sectionRef = useRef(null);

  const update = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const viewport = window.innerHeight;
    const box = section.getBoundingClientRect();
    if (box.bottom < -viewport || box.top > viewport * 2) return;
    const trigger = viewport * TRIGGER;
    let next = 0;
    cardRefs.current.forEach((card, index) => {
      if (card && card.getBoundingClientRect().top < trigger) next = index;
    });
    setActive(next);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => { frame = 0; update(); });
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

  return (
    <div className="mth">
      <header className="mth-hero">
        <h1>{t("methodology.title")}</h1>
        <p className="mth-links">
          <ViewLink view="explore">{t("methodology.linkExplore")}</ViewLink> ·{" "}
          <ViewLink view="story">{t("methodology.linkStory")}</ViewLink>
        </p>
      </header>

      <div className="mth-intro">
        <p>{t("methodology.intro1")}</p>
        <p><T id="methodology.intro2" c={[<em />]} /></p>
        <p>{t("methodology.intro3")}</p>
      </div>

      <section className="mth-scrolly" ref={sectionRef}>
        <div className="mth-sticky">
          <div className="mth-frame">
            <RouteFigure state={STEPS[active].state} />
            <p className="mth-legend">
              <span className="mth-c mth-c-observed">{t("methodology.legendObserved")}</span>
              <span className="mth-c mth-c-coverage">{t("methodology.legendCoverage")}</span>
              <span className="mth-c mth-c-calibration">{t("methodology.legendCalibration")}</span>
              <span className="mth-c mth-c-donor">{t("methodology.legendDonor")}</span>
              <span className="mth-c mth-c-schedule">{t("methodology.legendSchedule")}</span>
            </p>
          </div>
        </div>
        <div className="mth-steps">
          {STEPS.map((step, index) => (
            <div className="mth-step" key={index}>
              <div
                className={`mth-card${index === active ? " is-active" : ""}`}
                ref={(element) => { cardRefs.current[index] = element; }}
              >
                {step.body}
              </div>
            </div>
          ))}
          <div className="mth-tail" />
        </div>
      </section>

      <section className="mth-close">
        <p className="mth-turn">{t("methodology.closeTurn")}</p>
        <div className="mth-table-wrap">
          <table className="mth-table">
            <thead>
              <tr>
                <th>{t("methodology.colCase")}</th>
                <th className="num">{t("methodology.colRouteMonths")}</th>
                <th className="num">{t("methodology.colPercent")}</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map(([label, n, pct]) => (
                <tr key={label}>
                  <td>{t(label)}</td>
                  <td className="num">{n}</td>
                  <td className="num">{pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Histogram />
        <p className="mth-links"><ViewLink view="explore">{t("methodology.linkExploreArrow")}</ViewLink></p>
      </section>
    </div>
  );
}
