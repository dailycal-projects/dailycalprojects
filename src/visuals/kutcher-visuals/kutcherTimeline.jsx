import * as React from 'react';
import { Timeline } from '../../lib/compat/material-ui';
import { TimelineItem } from '../../lib/compat/material-ui';
import { TimelineSeparator } from '../../lib/compat/material-ui';
import { TimelineConnector } from '../../lib/compat/material-ui';
import { TimelineContent } from '../../lib/compat/material-ui';
import { TimelineDot } from '../../lib/compat/material-ui';
import { TimelineOppositeContent } from '../../lib/compat/material-ui';
import Age4 from '../../assets/images/kutcher/Kira Kutcher - Age 4.jpg?url';
import Age6 from '../../assets/images/kutcher/Kira Kutcher - Age 6.jpg?url';
import FigureSkating from '../../assets/images/kutcher/Kira Kutcher - Age 11 Figure Skating Performance.jpg?url';
import DancePerformance from '../../assets/images/kutcher/Kira Kutcher - Age 11 School Dance Performance.jpg?url';
import Graduation from '../../assets/images/kutcher/Kira Kutcher - Age 18 High School Graduation.jpg?url';
import CollegeClass from '../../assets/images/kutcher/Kira Kutcher - Age 20 Attending College Class.jpg?url';
import BladeRave from '../../assets/images/kutcher/Kira Kutcher - Age 21 Attending Blade Rave.jpg?url';

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
