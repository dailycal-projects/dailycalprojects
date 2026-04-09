import React, { useImperativeHandle, useRef } from 'react';
import {
  MediaPlayer, MediaProvider, Poster,
} from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import * as styles from './bug.module.css';

export const VideoPlayer = ({
  src, poster, alt, title,
}, ref) => {
  const playerRef = useRef(null);

  // Expose API to parent
  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.play(),
    seek: (time) => {
      if (playerRef.current) {
        playerRef.current.currentTime = time;
      }
    },
  }));

  return (
    <MediaPlayer title={title} src={src} preload="auto" className={styles.videoElement}>
      <MediaProvider>
        <Poster
          className={['vds-poster', styles.videoPoster].join(' ')}
          src={poster}
          alt={alt}
        />
      </MediaProvider>
      <DefaultVideoLayout
        icons={defaultLayoutIcons}
        slots={{
          settingsMenu: null,
          pipButton: null,
          googleCastButton: null,
        }}
      />
    </MediaPlayer>
  );
};
