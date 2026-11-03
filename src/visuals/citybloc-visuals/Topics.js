import React from 'react';
import CityblocGraphic from './CityblocGraphic';
import { html, mount } from './topics-graphic';

export default function Topics() {
  return <CityblocGraphic title="Topics" html={html} mount={mount} />;
}
