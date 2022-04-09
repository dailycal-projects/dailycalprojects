import React, { Component } from 'react';
import Sunburst from './Sunburst';
import data from './sunburstData';

class Budget2020Sunburst extends Component {
  render() {
    return (
      <div className="center">
        <Sunburst
          data={data}
          width="400"
          height="400"
          count_member="size"
          font_size={8}
          labelFunc={(node) => node.data.name}
        />
      </div>
    );
  }
}

export default Budget2020Sunburst;
