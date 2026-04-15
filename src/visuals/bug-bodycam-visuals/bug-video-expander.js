import React from 'react';
import { VideoExpander } from './components/video-expander';

const URL = 'https://github.com/projectseditor/projects-media/raw/refs/heads/main/bug-bodycam/website_cut_final.mp4';

export const BugVideoExpander = () => (
  <VideoExpander src={URL} aspectRatio={3840 / 2160} />
);
