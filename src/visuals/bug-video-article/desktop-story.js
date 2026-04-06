import React, { useEffect, useState } from 'react';
import * as styles from './bug.module.css';
import { VideoElement } from './video-segment';

export const DesktopStory = ({ story, scrollContainerRef }) => {
  console.log(null);

  const [videoElementActive, setVideoElementActive] = useState(true);

  /* useEffect(() => {
    let active = true;

    const x = window.setInterval(() => {
      setVideoElementActive(!active);
      active = !active;
    }, 1000);

    return () => window.clearInterval(x);
  }, []); */

  return (
    <div className={styles.scrollGroupContainer} onClick={() => setVideoElementActive(!videoElementActive)}>
      {/* Video container */}
      <div className={styles.scrollGroupBackgroundContainer}>
        <VideoElement story={story} slideIdx={0} isVideoElementActive={videoElementActive} />
      </div>
      hello!
    </div>
  );
};
