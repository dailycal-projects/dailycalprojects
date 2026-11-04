import React from 'react';
import CityblocGraphic from './CityblocGraphic';
import { html, mount } from './agreement-graphic';

export default function Agreement() {
  return <CityblocGraphic title="Agreement" html={html} mount={mount} />;
}
