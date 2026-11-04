import React, {
  Suspense, lazy, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { Link } from 'gatsby';
import ArticleFooter from '../../components/articleFooter';
import logo from '../../images/dclogo.png';
import { routeFromUrl, viewHref } from './views';
import StoryMap from './StoryMap';
import './styles/dashboard.css';
import './host.css';
import '../../styles/darkStory.css';

const Dashboard = lazy(() => import('./Dashboard'));
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function CleryScrolly({ children, date }) {
  return (
    <section className="clery-scrolly" id="clery-crime-map" aria-label="Crimes reported to UCPD">
      <figure className="clery-map-stage"><StoryMap publicationDate={date} /></figure>
      <div className="clery-story-steps">{children}</div>
      <svg className="clery-story-connectors" aria-hidden="true" hidden>
        <path data-clery-case-line />
        <path data-clery-statute-line />
      </svg>
    </section>
  );
}

class DashboardBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="clery-loading" role="alert">
          The crime log viewer could not load. <a href={viewHref('dashboard')}>Reload the viewer</a>.
        </p>
      );
    }
    return this.props.children;
  }
}

// As with AC Transit, the query selects a view of one static article. The
// story renders on the server and owns the default URL; the viewer loads on demand.
export default function CleryStory({
  title = 'Clery', date, bylineName = [], bylineUrl = [], about = '', children,
}) {
  const [route, setRoute] = useState({ view: 'story', caseNumber: '' });
  const rootRef = useRef(null);

  useClientLayoutEffect(() => {
    const update = () => setRoute(routeFromUrl());
    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  const onClick = (event) => {
    const link = event.target.closest?.('a[data-clery-view]');
    if (!link || event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const url = new URL(link.href);
    window.history.pushState(null, '', url.pathname + url.search + url.hash);
    setRoute(routeFromUrl());
    rootRef.current?.scrollTo(0, 0);
  };

  const publicationDate = date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : '';

  return (
    <div className={`clery-root dark-story${route.view === 'story' ? '' : ' clery-root--viewer'}`} ref={rootRef} onClick={onClick}>
      <Link className="clery-masthead dark-story-masthead" to="/">
        <img src={logo} alt="The Daily Californian" />
      </Link>
      {route.view === 'story' ? (
        <>
          <main className="clery-story dark-story-content">
            <header className="clery-story-header dark-story-header">
              <h1>{title}</h1>
              {date && <time className="dark-story-date" dateTime={date}>{publicationDate}</time>}
              {bylineName?.length > 0 && (
                <p className="dark-story-byline">
                  By{' '}
                  {bylineName.map((author, index) => (
                    <React.Fragment key={author}>
                      <a href={bylineUrl?.[index] || ''} target="_blank" rel="noreferrer">{author}</a>
                      {index < bylineName.length - 2 ? ', ' : ''}
                      {index === bylineName.length - 2 ? ' & ' : ''}
                    </React.Fragment>
                  ))}
                </p>
              )}
            </header>
            {children}
          </main>
          <div className="clery-footer dark-story-footer"><ArticleFooter about={about} /></div>
        </>
      ) : (
        <DashboardBoundary key={`${route.view}:${route.caseNumber}`}>
          <Suspense fallback={<p className="clery-loading" role="status">Loading crime log viewer…</p>}>
            <Dashboard view={route.view} caseNumber={route.caseNumber} />
          </Suspense>
        </DashboardBoundary>
      )}
    </div>
  );
}
