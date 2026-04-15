import React, {
  forwardRef,
  useCallback,
  useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { Helmet } from 'react-helmet';
import * as styles from '../styling/dc-video-player.module.css';
import muteIcon from '../icons/volume-xmark-solid-full.svg';
import fullVolumeIcon from '../icons/volume-solid-full.svg';
import playIcon from '../icons/play-solid-full.svg';

export const DCVideoPlayer = forwardRef(({
  src,
  aspectRatio = null,
  type = 'video/mp4',
  preload = 'auto',
  preloadInHead = true,
  playsInline = true,
  alt = null,
  loop = false,
  pauseOnScrollOut = true,
}, ref) => {
  // MARK: Init
  aspectRatio = (typeof aspectRatio === 'string') ? parseFloat(aspectRatio) : aspectRatio;

  // Refs
  const videoRef = useRef(null);
  const scrubberRef = useRef(null);
  const viewedScrubberRef = useRef(null);

  // Video state
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Scrubber dragging logic
  const draggingScrubber = useRef(false);
  const scrubberBoundingBox = useRef(null);
  const wasVideoPlayingBeforeScrub = useRef(false);

  // MARK: Handle
  // Play video, with the option to mute it if autoplay doesn't work
  const playVideo = useCallback((muteIfFails = false) => {
    const video = videoRef.current;
    if (!video?.play) return Promise.resolve();

    const attempt = () => video.play().catch(() => undefined);

    if (!muteIfFails) return attempt();

    return video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      return attempt();
    });
  }, []);

  useImperativeHandle(ref, () => ({
    play: (muteIfFails = false) => playVideo(muteIfFails),
    pause: () => videoRef.current?.pause?.(),
    setControlsShown: (show) => setShowControls(show),
  }), [playVideo]);

  // MARK: Check in viewport
  // Is in viewport
  const inViewportRef = useRef(false);

  // Listen for in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewportRef.current = entry.isIntersecting;

        // Pause on outro
        if (pauseOnScrollOut && !entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
        }
      }, {
        threshold: 0.3,
      },
    );

    // Attach observer
    const video = videoRef.current;
    if (video) { observer.observe(video); }

    // Clean up observer
    return () => {
      if (video) observer.unobserve(video);
      observer.disconnect();
    };
  }, [pauseOnScrollOut]);

  // MARK: Manual scrubbing
  // On pointer down on scrubber
  const scrubberOnPointerDown = (evt) => {
    if (!videoRef.current || !showControls) return;

    draggingScrubber.current = true;
    evt.currentTarget.setPointerCapture(evt.pointerId);

    // Pause video while scrubbing, but resume after
    wasVideoPlayingBeforeScrub.current = !videoRef.current.paused;
    videoRef.current.pause();

    // Get scrubber bounding box
    const scrubber = scrubberRef.current;
    if (!scrubber) { return; }
    scrubberBoundingBox.current = scrubber.getBoundingClientRect();

    // Update scrubber position
    scrubberOnPointerMove(evt);
  };

  // On pointer up on scrubber
  const scrubberOnPointerUp = () => {
    draggingScrubber.current = false;
    scrubberBoundingBox.current = null;

    // Resume if was playing before
    if (wasVideoPlayingBeforeScrub.current && videoRef.current) {
      videoRef.current.play();
    }
  };

  // On pointer move on scrubber
  const scrubberOnPointerMove = (evt) => {
    if (!draggingScrubber.current || !videoRef.current || !scrubberBoundingBox.current || !viewedScrubberRef.current) { return; }

    const pointerX = evt.clientX;

    let scrubPercent = (pointerX - scrubberBoundingBox.current.left) / scrubberBoundingBox.current.width;
    scrubPercent = Math.max(Math.min(scrubPercent, 1.0), 0.0);

    // Update video (scrubber will update automatically)
    videoRef.current.currentTime = scrubPercent * videoRef.current.duration;
  };

  // MARK: Automatic scrubbing
  // Scrubber animate with video progress
  useEffect(() => {
    const video = videoRef.current;
    const scrubber = viewedScrubberRef.current;

    if (!video || !scrubber) return;

    let rafId = null;

    const update = () => {
      rafId = null; // mark as stopped

      if (video.duration) {
        const percent = video.currentTime / video.duration;
        scrubber.style.width = `${percent * 100}%`;
      }

      // only reschedule if still active
      if (!video.paused || draggingScrubber.current) {
        rafId = requestAnimationFrame(update);
      }
    };

    const startLoop = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    video.addEventListener('play', startLoop);
    video.addEventListener('seeking', startLoop); // catches scrub-while-paused

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      video.removeEventListener('play', startLoop);
      video.removeEventListener('seeking', startLoop);
    };
  }, []);

  // MARK: Mute button
  // On mute toggle pressed
  const onMuteButtonClick = (evt) => {
    if (!videoRef.current) { return; }
    evt.stopPropagation();

    const next = !videoRef.current.muted;
    setIsMuted(next);
    videoRef.current.muted = next;
  };

  // MARK: Play buttons
  // On play button pressed
  const onPlayButtonPressed = (evt) => {
    if (!videoRef.current) { return; }
    evt.stopPropagation();

    playVideo(false);
  };

  // Toggle playback (on screen clicked or space pressed)
  const togglePlay = useCallback(() => {
    if (!videoRef.current || draggingScrubber.current || !showControls) { return; }

    if (!videoRef.current.paused) {
      videoRef.current.pause();
    } else {
      playVideo(false);
    }
  }, [showControls, playVideo]);

  // Space bar listeners
  useEffect(() => {
    const onKeyDown = (evt) => {
      if (!videoRef.current) { return; }

      if (evt.code === 'Space' && inViewportRef.current && showControls) {
        evt.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    // Remove handlers after
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, showControls]);

  // MARK: UI
  // Sync UI states and video states
  const syncStates = useCallback(() => {
    if (videoRef.current) {
      setIsPlaying(!videoRef.current.paused);
    }
  }, []);

  return (
    <div
      className={styles.container}
    >
      {/* Head preload */}
      {preloadInHead && (
      <Helmet>
        <link rel="preload" href={src} as="video" type={type} />
      </Helmet>
      )}

      {/* Video */}
      <video
        className={styles.video}
        preload={preload}
        playsInline={playsInline}
        ref={videoRef}
        onContextMenu={(evt) => evt.preventDefault()}
        onPlay={syncStates}
        onPause={syncStates}
        onClick={togglePlay}
        aria-label={alt}
        style={{ aspectRatio }}
        loop={loop}
      >
        <source src={src} type={type} />
      </video>

      {/* Scrubber */}
      <div
        className={styles.scrubber}
        onPointerDown={scrubberOnPointerDown}
        onPointerMove={scrubberOnPointerMove}
        onPointerUp={scrubberOnPointerUp}
        onPointerCancel={scrubberOnPointerUp}
        ref={scrubberRef}
      >
        <div
          className={styles.scrubberViewed}
          ref={viewedScrubberRef}
          style={{ width: '0%' }}
        >
          {showControls
            && <div className={styles.scrubberHandle} />}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
      <button
        className={[styles.control, styles.volumeButton].join(' ')}
        onClick={onMuteButtonClick}
        type="button"
      >
        <img
          src={isMuted ? muteIcon : fullVolumeIcon}
          className={styles.controlIcon}
          style={{ filter: 'invert(1)' }}
        />
      </button>
      )}

      {!isPlaying && showControls && (
      <button
        className={[styles.control, styles.playButton].join(' ')}
        onClick={onPlayButtonPressed}
        type="button"
      >
        <img
          src={playIcon}
          className={styles.controlIcon}
          style={{ filter: 'invert(1)' }}
        />
      </button>
      )}
    </div>
  );
});
