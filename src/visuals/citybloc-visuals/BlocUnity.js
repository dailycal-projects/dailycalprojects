import React from 'react';
import CityblocGraphic from './CityblocGraphic';
import { html, mount } from './bloc-unity-graphic';

export default function BlocUnity() {
  return <CityblocGraphic title="BlocUnity" html={html} mount={mount} />;
}
