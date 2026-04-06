import heroImage from '../../images/ophdreport.jpg';
import introImage from '../../images/1921-protest.png';

export const hero = {
  backgroundImages: [heroImage, introImage],
  backgroundImageSources: ['Image Source Here | Staff', 'XYZ | ABC'],
  title: 'Bug Bodycam Analysis Title Here',
  pubDate: 'January 1, 1970',
  byline: [
    'Jackson Woodward',
    'Ajith Araiza-Singh',
    'Brendan Raykoff',
  ],
  bylineURLs: [
    'https://www.dailycal.org/users/profile/jackson%20woodward/',
    'https://www.dailycal.org/users/profile/ajith%20araiza-singh/',
    'https://www.dailycal.org/users/profile/brendan%20raykoff/',
  ],
  storyIntro: 'At midnight on November 10th, 2025, four UC Berkeley students were arrested on felony vandalism charges while mounting a papier-mâché bug sculpture to Sather Gate... Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
};

export const story = {
  videoClipSrc: 'http://localhost:8067/bug-bodycam.mp4',
  videoClipType: 'video/mp4',
  fullVideoSrc: 'https://youtube.com/',
  videoSourceLabel: 'University of California, Berkeley PD',
  realVideoDuration: (55 * 60) + 3, // seconds
  slides: [
    {
      type: 'segment',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      clipSegment: [0, 10], // timestamps in the clipped video to play for this segment (seconds)
      realSegmentStart: 20, // timestamp in the full length video that this clip is from (seconds)
    },
    {
      type: 'segment',
      content: 'This is a second segment...',
      clipSegment: [30, 45],
      realSegmentStart: (20 * 60) + 10,
    },
  ],
};
