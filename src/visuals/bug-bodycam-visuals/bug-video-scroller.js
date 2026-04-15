import React from 'react';
import { VideoScroller, VideoScrollerSegment } from './components/video-scroller-desktop';

export const BugVideoScroller = () => (
  <VideoScroller>
    <VideoScrollerSegment
      src="/bug-video/bug-bodycam.mp4"
      type="video/mp4"
      clipStart="50"
      clipTitle="This is clip 1"
    >
      Some analysis of the video clip goes here. This analysis is very important.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
      nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
      eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
      in culpa qui officia deserunt mollit anim id est laborum.
      <br />
      <br />
      Some more text down here...
    </VideoScrollerSegment>

    <VideoScrollerSegment
      src="/bug-video/bug-clipped.mp4"
      type="video/mp4"
      clipStart="50"
      clipTitle="Clip 2 here"
    >
      This is segment 2. This is also important Lorem ipsum dolor sit amet,
      consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
      dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
      ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
      in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
      officia deserunt mollit anim id est laborum.
      <br />
      <br />
      Some more text down here...
    </VideoScrollerSegment>

    <VideoScrollerSegment
      src="/bug-video/bug-bodycam.mp4"
      type="video/mp4"
      clipStart="50"
      clipTitle="This is clip 3"
    >
      Segment three. Lorum impusm dolor lorum ipsum ipsum ipsum... Lorem ipsum dolor
      sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
      exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
      aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
      fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
      culpa qui officia deserunt mollit anim id est laborum.
      <br />
      <br />
      Some more text down here...
    </VideoScrollerSegment>

    <VideoScrollerSegment
      src="/bug-video/bug-clipped.mp4"
      type="video/mp4"
      clipStart="50"
      clipTitle="This is clip 4"
    >
      Brendan Raykoff Ajith Ariaza-Singh Jackson Woodward are the goats.
      <br />
      <br />
      Some more text down here...
    </VideoScrollerSegment>
  </VideoScroller>
);
