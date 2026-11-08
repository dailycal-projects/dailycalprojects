import React from 'react';
import CityblocGraphic from './CityblocGraphic';
import { html, mount } from './dissents-graphic';

export default function Dissents() {
  return <CityblocGraphic title="Dissents" html={html} mount={mount} />;
}
