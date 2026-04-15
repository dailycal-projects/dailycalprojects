import React from 'react';
import { VideoScroller, VideoScrollerSegment } from './components/video-scroller';

export const BugVideoScroller = () => (
  <VideoScroller>
    <VideoScrollerSegment
      src="https://github.com/projectseditor/projects-media/raw/refs/heads/main/bug-bodycam/scuffle_cut.mp4"
      type="video/mp4"
      aspectRatio={3840 / 2160}
    >
      <p>
        Legal experts who reviewed the video said that the force exercised by Tinney appeared excessive,
        especially in initially grabbing the first student’s arm.
      </p>
      <p>
        “He should not have put his hands on them. There was zero reason to use any force against any
        of these kids,” Walker said in an email. “Officers may use reasonable force to enforce compliance
        when a person resists a lawful order, but I didn’t see any resistance by anyone and his orders
        were not lawful.”
      </p>
      <p>
        Some who reviewed the video had a more moderate take. A former officer and expert on police
        conduct, Roger Clark, said the use of force “would not rise to the level of concern.”
      </p>
    </VideoScrollerSegment>

    <VideoScrollerSegment
      src="https://github.com/projectseditor/projects-media/raw/refs/heads/main/bug-bodycam/verbal_abuse_clip.mp4"
      type="video/mp4"
      aspectRatio={3840 / 2160}
    >
      <p>The experts also said that Tinney’s remarks, while not in violation of department policy or the law, were unprofessional.</p>

      <p>“It seemed to me that he was personally offended that the students' message was directed at the Turning Point USA event which was going to be held the next day on campus,” Lederman said in her email, “I got the impression he really dislikes students, which is disturbing coming from a UC officer.”</p>
    </VideoScrollerSegment>
  </VideoScroller>
);
