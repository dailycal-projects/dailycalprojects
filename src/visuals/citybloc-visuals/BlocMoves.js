import React from 'react';
import CityblocGraphic from './CityblocGraphic';
import { html, mount } from './bloc-moves-graphic';

export default function BlocMoves() {
  return <CityblocGraphic title="BlocMoves" html={html} mount={mount} />;
}
