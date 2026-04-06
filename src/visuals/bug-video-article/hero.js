import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'gatsby';
import * as styles from './bug.module.css';

export const Hero = ({ hero, scrollContainerRef }) => {
  const {
    backgroundImages, backgroundImageSources, title, byline, bylineURLs, pubDate, storyIntro,
  } = hero;
  const heroContainerRef = useRef(null);

  // Background Images
  const backgroundImageDarken = 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))';
  const [showIntroBackground, setShowIntroBackground] = useState(false);

  // Dynamic byline size
  const defaultBylineSeparator = ' • ';
  const [bylineSeparator, setBylineSeparator] = useState(defaultBylineSeparator);
  const bylineWidth = 435; // TODO px

  // Attach listeners
  useEffect(() => {
    // On resize, adjust byline separator
    const handleResize = () => {
      if (window.innerWidth * 0.85 < bylineWidth) {
        setBylineSeparator(<br />);
      } else {
        setBylineSeparator(defaultBylineSeparator);
      }
    };

    handleResize(); // set on mount
    window.addEventListener('resize', handleResize);

    // On scroll, adjust background image
    const scrollWrapper = scrollContainerRef.current;
    const heroContainer = heroContainerRef.current;

    const handleScroll = () => {
      const scrollPosition = scrollWrapper.scrollTop;
      const totalHeroHeight = heroContainer.offsetHeight;

      // There are 2 slides, so once the user scrolls 25%, switch to the second slide's image
      setShowIntroBackground(scrollPosition >= totalHeroHeight * 0.25);
    };

    scrollWrapper.addEventListener('scroll', handleScroll);

    // On unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      scrollWrapper.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.scrollGroupContainer} ref={heroContainerRef}>
      {/* Background images */}
      <div
        className={[styles.scrollGroupBackgroundContainer, styles.heroBackgroundImage].join(' ')}
        style={{
          backgroundImage: `${backgroundImageDarken}, url(${backgroundImages[0]})`,
        }}
      >
        {/* Second background image, for intro slide */}
        <div
          className={styles.heroIntroImage}
          style={{
            backgroundImage: `${backgroundImageDarken}, url(${backgroundImages[1]})`,
            opacity: showIntroBackground ? 1 : 0,
          }}
        />
        {/* Background image source label */}
        <div className={styles.heroImageSourceText}>
          {backgroundImageSources[showIntroBackground ? 1 : 0]}
        </div>
      </div>

      {/* Title slide */}
      <div className={styles.heroSlideContainer}>
        <div className={styles.heroTextbox}>
          {/* Title */}
          <h1>{title}</h1>

          {/* Byline */}
          <p>
            {byline.map((name, index) => (
              <>
                {index !== 0 && bylineSeparator}
                <Link to={bylineURLs[index]}>{name}</Link>
              </>
            ))}
          </p>
          <br />

          {/* Publish Date */}
          <p>
            <i>{pubDate}</i>
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className={styles.heroSlideContainer}>
        <div className={styles.heroTextbox}>
          <p>
            {storyIntro}
          </p>
        </div>
      </div>
    </div>
  );
};
