import React from 'react';
import CityblocGraphic from './CityblocGraphic';
import { html, mount } from './split-sides-graphic';

export default function SplitSides() {
  return <CityblocGraphic title="SplitSides" html={html} mount={mount} />;
}
