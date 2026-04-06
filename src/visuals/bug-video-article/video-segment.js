import React from 'react';
import { Link } from 'gatsby';
import * as styles from './bug.module.css';

export const VideoElement = ({ story, slideIdx, isVideoElementActive }) => {
  // Video properties
  const slide = story.slides[slideIdx];

  const {
    videoClipSrc, videoClipType, fullVideoSrc, realVideoDuration,
  } = story;
  const { clipSegment, realSegmentStart } = slide;

  const segmentDuration = clipSegment[1] - clipSegment[0];

  return (
    <>
      <video
        preload="auto"
        className={styles.videoPlayer}
        style={{
          filter: isVideoElementActive ? 'none' : 'grayscale(100%) brightness(50%)',
        }}
      >
        <source src={videoClipSrc} type={videoClipType} />
        <DoesNotSupportMessage
          feature="video playback"
          helpLink="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video#browser_compatibility"
        />
      </video>
      <div
        className={styles.videoPlaybackControls}
        style={{
          opacity: isVideoElementActive ? 1 : 0,
        }}
      >
        {/* Playback scrubber */}
        <div className={styles.videoControlsScrubber}>
          <div
            className={styles.videoControlsScrubberActiveSegment}
            style={{
              left: `${realSegmentStart / realVideoDuration * 100}%`,
              width: `${segmentDuration / realVideoDuration * 100}%`,
            }}
          />
        </div>

        {/* Labels */}
        <div
          className={styles.videoControlsLabel}
          style={{
            left: '15px',
          }}
        >
          {`${formatTime(realSegmentStart)} / ${formatTime(realVideoDuration)}`}
        </div>
        <div
          className={styles.videoControlsLabel}
          style={{
            right: '15px',
          }}
        >
          {
            isVideoElementActive
              ? <Link to={fullVideoSrc}>View full video</Link>
              : <span>View full video</span>
          }
        </div>
      </div>
    </>
  );
};

const DoesNotSupportMessage = ({ feature, helpLink }) => (
  <center>
    <h1>
      Your browser does not support&nbsp;
      {feature}
      .
    </h1>
    <br />
    <Link to={helpLink}>Learn More</Link>
  </center>
);

/**
 * Format a given timestamp in seconds to hour:minute:second format.
 */
function formatTime(t) {
  const hours = Math.floor(t / 3600);
  const minutes = Math.floor((t % 3600) / 60);
  const seconds = Math.floor(t % 60)
    .toString()
    .padStart(2, '0');

  if (hours > 0) {
    // Format as H:MM:SS
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds}`;
  }
  // Format as M:SS
  return `${minutes}:${seconds}`;
}
