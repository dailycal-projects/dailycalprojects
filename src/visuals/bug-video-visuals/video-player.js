import React, {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import {
  MediaPlayer, MediaProvider, Poster,
} from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import * as styles from './styling/video-player.module.css';

export const VideoPlayer = forwardRef(({
  src, poster, alt, title, playsInline = true, listenForSpace = true,
}, ref) => {
  const playerRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [isPaused, setIsPaused] = useState(true);

  // Expose API to parent
  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.play?.(),
    pause: () => playerRef.current?.pause?.(),
    setControlsShown: (show) => setShowControls(show),
    isPaused: () => isPaused,
  }), [isPaused]);

  // Pause listener
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);

    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    // Detach listeners
    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, []);

  // Space bar play/pause listener
  useEffect(() => {
    if (!listenForSpace) return;

    const player = playerRef.current;
    if (!player) return;

    const onSpace = (evt) => {
      // Don't run listener if user is typing somewhere
      if (evt.code === 'Space'
          && evt.target.tagName !== 'INPUT'
          && evt.target.tagName !== 'TEXTAREA'
          && !evt.target.isContentEditable
      ) {
        // Toggle player play/pause
        evt.preventDefault();

        if (isPaused) player.play();
        else player.pause();
      }
    };

    window.addEventListener('keydown', onSpace);

    // Detach listener
    return () => window.removeEventListener('keydown', onSpace);
  }, [isPaused, listenForSpace]);

  return (
    <MediaPlayer
      title={title}
      src={src}
      preload="auto"
      className={styles.videoElement}
      playsInline={playsInline}
      ref={playerRef}
    >
      {/* Poster image */}
      <MediaProvider>
        <Poster
          className={['vds-poster', styles.videoPoster].join(' ')}
          src={poster}
          alt={alt}
        />
      </MediaProvider>

      {/* Centered play button */}
      {showControls && isPaused && (
      <button
        className={styles.playButton}
        onClick={() => playerRef.current?.play?.()}
      />
      )}

      {/* Media controls */}
      {showControls && (
      <DefaultVideoLayout
        icons={defaultLayoutIcons}
        slots={{
          settingsMenu: null,
          pipButton: null,
          googleCastButton: null,
        }}
      />
      )}
    </MediaPlayer>
  );
});
