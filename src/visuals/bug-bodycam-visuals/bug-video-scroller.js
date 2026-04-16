import React from 'react';
import { VideoScroller, VideoScrollerSegment } from './components/video-scroller';

export const externalSourceLink = 'https://www.youtube.com/watch?v=rbhCGXOTsng';

export const BugVideoScroller = () => (
  <VideoScroller>
    <VideoScrollerSegment
      src="https://github.com/projectseditor/projects-media/raw/refs/heads/main/bug-bodycam/scuffle_cut.mp4"
      type="video/mp4"
      aspectRatio={3840 / 2160}
      externalSourceLink={externalSourceLink}
    >
      <p>Legal experts who reviewed the video said the force Tinney exercised appeared excessive, especially when he initially grabbed the first protester’s arm.</p>

      <p>“He should not have put his hands on them. There was zero reason to use any force against any of these kids,” said Jayme Walker, a lawyer with expertise in police misconduct, in an email. “Officers may use reasonable force to enforce compliance when a person resists a lawful order, but I didn’t see any resistance by anyone and his orders were not lawful.”</p>

      <p>Of the multiple experts that the Daily Cal spoke with, only one — former officer and expert on police conduct Roger Clark — defended Tinney’s use of force, saying “it would not rise to the level of concern.”</p>
    </VideoScrollerSegment>

    <VideoScrollerSegment
      src="https://github.com/projectseditor/projects-media/raw/refs/heads/main/bug-bodycam/verbal_abuse_clip.mp4"
      type="video/mp4"
      aspectRatio={3840 / 2160}
      externalSourceLink={externalSourceLink}
    >
      <p>Most experts also said Tinney’s remarks were unprofessional despite not violating department policy or law.</p>

      <p>“It seemed to me that he was personally offended that the students’ message was directed at the Turning Point USA event which was going to be held the next day on campus,” said Rachel Lederman, senior counsel at the Partnership for Civil Justice Fund, in an email. In reference to Tinney’s language, Lederman said, “I got the impression he really dislikes students, which is disturbing coming from a UC officer.”</p>
    </VideoScrollerSegment>
  </VideoScroller>
);
