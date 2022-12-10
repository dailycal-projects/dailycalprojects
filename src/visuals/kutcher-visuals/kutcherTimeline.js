import * as React from 'react';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import Age4 from './kutcher-images/Kira Kutcher - Age 4.png';
import Age6 from './kutcher-images/Kira Kutcher - Age 6.png';
import FigureSkating from './kutcher-images/Kira Kutcher - Age 11 Figure Skating Performance.png';
import DancePerformance from './kutcher-images/Kira Kutcher - Age 11 School Dance Performance.png';
import Graduation from './kutcher-images/Kira Kutcher - Age 18 High School Graduation.png';
import CollegeClass from './kutcher-images/Kira Kutcher - Age 20 Attending College Class.png';
import BladeRave from './kutcher-images/Kira Kutcher - Age 21 Attending Blade Rave.png';

export default function KutcherTimeline() {
  return (
    <Timeline position="alternate">
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          <strong> Age 4 </strong>
          <br />
          Born in the early 2000s, Kira Kutcher developed an early love for
          fashion.
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <br />
          <img
            src={Age4}
            alt="Kira Kutcher at age 4"
          />
          <br />
          Kira Kutcher | Courtesy
          <br />
          <br />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          <strong> Age 6 </strong>
          <br />
          Kutcher has put together a bold look complete with cat-eye sunglasses,
          a beaded anklet, a statement scarf and a pink purse.
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <br />
          <img
            src={Age6}
            alt="Kira Kutcher at age 6"
          />
          <br />
          Kira Kutcher | Courtesy
          <br />
          <br />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          <strong> Age 11 </strong>
          <br />
          A long-time figure skater, Kutcher has been attracted to flowy
          silhouettes from a young age. Such silhouettes can be seen in
          Kutcher’s style even today.
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <br />
          <img
            src={DancePerformance}
            alt="Kira Kutcher at school dance performance"
          />
          <br />
          Kira Kutcher | Courtesy
          <br />
          <br />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          <strong> Age 11 </strong>
          <br />
          In part inspired by The Black Swan, Kutcher has adopted the black
          palette into her wardrobe ever since middle school.
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <br />
          <img
            src={FigureSkating}
            alt="Kira Kutcher at figure skating performance"
          />
          <br />
          Kira Kutcher | Courtesy
          <br />
          <br />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          <strong> Age 18 </strong>
          <br />
          Kutcher’s signature winged eyeliner first began as a single stroke
          before growing in size.
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <br />
          <img
            src={Graduation}
            alt="Kira Kutcher at high school graduation ceremony"
          />
          <br />
          Kira Kutcher | Courtesy
          <br />
          <br />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          <strong> Age 20 </strong>
          <br />
          Kutcher is pictured in her metaphorical armor as she gets ready to
          attend class.
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <br />
          <img
            src={CollegeClass}
            alt="Kira Kutcher gets ready for class"
          />
          <br />
          Kira Kutcher | Courtesy
          <br />
          <br />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          <strong> Age 21 </strong>
          <br />
          Kutcher today, sporting multi-winged eye makeup along with her
          signature all-black style.
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <br />
          <img
            src={BladeRave}
            alt="Kira Kutcher attending Blade Rave"
          />
          <br />
          Kira Kutcher | Courtesy
          <br />
          <br />
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
