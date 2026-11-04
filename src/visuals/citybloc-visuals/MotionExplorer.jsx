import React from 'react';
import CityblocGraphic from './CityblocGraphic';
import { html, mount } from './motion-explorer-graphic';

export default function MotionExplorer() {
  return <CityblocGraphic title="MotionExplorer" html={html} mount={mount} />;
}
