import React, {
  Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { Link } from 'gatsby';
import ArticleFooter from '../../components/articleFooter';
import logo from '../../images/dclogo.png';
import Story from './components/story/Story';
import { setHost } from './lib/host';
import './styles/app.css';
import './styles/story.css';
import './styles/methodology.css';
import 'katex/dist/katex.min.css';
import './host.css';

/*
The AC Transit ridership story, with the explorer and methodology it links
to. Ported from the standalone Next app (nextjsvis), where each is a page of
its own; here they share one article and the URL names the view:

  /<slug>                    the story (the default)
  /<slug>?view=explore       the explorer
  /<slug>?view=methodology   the methodology

A query rather than a path because Netlify serves this one static page
whatever the query, so a shared or reloaded link needs no redirect. The hash
stays free for the story, which writes the passage in view into it.
*/

// The story is what the page renders at build time, so it ships with the page;
// the other two load when someone opens them.
const Explorer = lazy(() => import('./components/RidershipExplorer'));
const Methodology = lazy(() => import('./components/methodology/Methodology'));
const VIEWS = ['story', 'explore', 'methodology'];

// Layout effects warn during the server render; the effect is client-only anyway.
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function viewFromUrl() {
  const view = new URLSearchParams(window.location.search).get('view');
  return VIEWS.includes(view) ? view : 'story';
}

// `about` is the footer's "About this story" text and `date` the publication
// date, both set in the article's MDX.
const AcTransitStory = ({ about, date }) => {
  const [view, setView] = useState('story');
  const rootRef = useRef(null);

  const go = useCallback((next) => {
    const { pathname } = window.location;
    window.history.pushState(null, '', next === 'story' ? pathname : `${pathname}?view=${next}`);
    setView(next);
    if (rootRef.current) rootRef.current.scrollTo(0, 0);
  }, []);

  // Register the scroll container from the ref rather than an effect: React
  // runs children's effects before their parent's, and the story attaches its
  // scroll listener in one.
  const attach = useCallback((element) => {
    rootRef.current = element;
    setHost(element, element ? go : null);
  }, [go]);

  // The build renders the story because it cannot see the query string, so
  // the first client render has to match that; switch before the first paint.
  useClientLayoutEffect(() => {
    setView(viewFromUrl());
    const onPop = () => setView(viewFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="acpra acpra-root" ref={attach}>
      {view === 'story' ? (
        <>
          <Link to="/" className="acpra-masthead">
            <img src={logo} alt="The Daily Californian" />
          </Link>
          <Story date={date} />
          <div className="acpra-footer">
            <ArticleFooter about={about} />
          </div>
        </>
      ) : (
        <Suspense fallback={null}>
          {view === 'explore' ? <Explorer /> : <Methodology />}
        </Suspense>
      )}
    </div>
  );
};

export default AcTransitStory;
