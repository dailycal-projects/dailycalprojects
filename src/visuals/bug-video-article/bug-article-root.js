import React, { useRef } from 'react';
import { Link } from 'gatsby';
import * as styles from './bug.module.css';
import logo from '../../images/dclogoblack.png';
import { DesktopStory } from './desktop-story';
import { hero, story } from './story';
import { Hero } from './hero';

export const BugArticle = () => {
  const scrollContainerRef = useRef(null);

  return (
    <div className={styles.container} ref={scrollContainerRef}>
      {/* Top Bar */}
      <Link to="https://dailycal.org" style={{ textDecoration: 'none' }}>
        <header className={styles.topBar}>
          <img src={logo} alt="The Daily Californian" />
        </header>
      </Link>

      {/* Hero */}
      <Hero hero={hero} scrollContainerRef={scrollContainerRef} />

      {/* Story */}
      <DesktopStory story={story} scrollContainerRef={scrollContainerRef} />
    </div>
  );
};
