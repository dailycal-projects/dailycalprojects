import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import data from '../data/us-10m.json';
import calSmallImage from '../images/cal_small.png';
import uclaSmallImage from '../images/ucla_small.png';
import stanfordSmall from '../images/stanford_small.png';
import uscSmallImage from '../images/usc_small.png';
import uwSmallImage from '../images/uw_small.png';
import oregonSmallImage from '../images/oregon_small.png';
import uofaSmallImage from '../images/uofa_small.png';
import asuSmallImage from '../images/asu_small.png';
import coloradoSmallImage from '../images/colorado_small.png';
import utahSmallImage from '../images/utah_small.png';
import oregonStateSmallImage from '../images/oregonstate_small.png';
import wazzuSmallImage from '../images/wazzu_small.png';

const pac12Universities = [
  // Note: added some jitter (in lat and long) for Standford, Cal, UCLA, USC so images so not appear completely on top of each other
  {
    name: 'Stanford University', conf: 'acc', lat: 37.02766, long: -122.6726403, image: stanfordSmall, color: '#222222',
  },
  {
    name: 'University of California, Berkeley', conf: 'acc', lat: 38.070151, long: -122.020409, image: calSmallImage,
  },
  {
    name: 'University of California, Los Angeles', conf: 'bigTen', lat: 34.0699182, long: -117.4464298, image: uclaSmallImage,
  },
  {
    name: 'University of Southern California', conf: 'bigTen', lat: 34.0223519, long: -118.2876973, image: uscSmallImage,
  },
  {
    name: 'University of Washington', conf: 'bigTen', lat: 47.6543747, long: -122.3134321, image: uwSmallImage,
  },
  {
    name: 'University of Oregon', conf: 'bigTen', lat: 44.0448302, long: -123.0751858, image: oregonSmallImage,
  },
  {
    name: 'University of Arizona', conf: 'big12', lat: 32.2319166, long: -110.9554976, image: uofaSmallImage,
  },
  {
    name: 'Arizona State University', conf: 'big12', lat: 33.4229974, long: -111.9326962, image: asuSmallImage,
  },
  {
    name: 'University of Colorado, Boulder', conf: 'big12', lat: 40.0073499, long: -105.2685674, image: coloradoSmallImage,
  },
  {
    name: 'University of Utah', conf: 'big12', lat: 39.4696848, long: -114.1931986, image: utahSmallImage,
  },
  {
    name: 'Oregon State University', conf: 'pac2', lat: 44.5618097, long: -123.2848474, image: oregonStateSmallImage,
  },
  {
    name: 'Washington State University', conf: 'pac2', lat: 46.7328316, long: -117.1526069, image: wazzuSmallImage,
  },
];

const pacStates = ['California', 'Washington', 'Oregon', 'Arizona', 'Colorado', 'Utah'];

const conferences = {
  bigTen: ['Illinois', 'Indiana', 'California', 'Iowa', 'Washington', 'Oregon', 'Maryland', 'Ohio', 'Michigan', 'Minnesota', 'Nebraska', 'Pennsylvania', 'New Jersey', 'Wisconsin'],
  acc: ['North Carolina', 'Florida', 'South Carolina', 'Massachusetts', 'Georgia', 'Kentucky', 'California', 'Pennsylvania', 'Texas', 'Indiana', 'Virginia', 'New York'],
  pac2: ['Oregon', 'Washington'],
  big12: ['Arizona', 'Colorado', 'Utah', 'Florida', 'Iowa', 'Kansas', 'Ohio', 'Oklahoma', 'Texas', 'West Virginia'],
};

const stateNames = {
  1: 'Alabama',
  2: 'Alaska',
  4: 'Arizona',
  5: 'Arkansas',
  6: 'California',
  8: 'Colorado',
  9: 'Connecticut',
  10: 'Delaware',
  11: 'District of Columbia',
  12: 'Florida',
  13: 'Georgia',
  15: 'Hawaii',
  16: 'Idaho',
  17: 'Illinois',
  18: 'Indiana',
  19: 'Iowa',
  20: 'Kansas',
  21: 'Kentucky',
  22: 'Louisiana',
  23: 'Maine',
  24: 'Maryland',
  25: 'Massachusetts',
  26: 'Michigan',
  27: 'Minnesota',
  28: 'Mississippi',
  29: 'Missouri',
  30: 'Montana',
  31: 'Nebraska',
  32: 'Nevada',
  33: 'New Hampshire',
  34: 'New Jersey',
  35: 'New Mexico',
  36: 'New York',
  37: 'North Carolina',
  38: 'North Dakota',
  39: 'Ohio',
  40: 'Oklahoma',
  41: 'Oregon',
  42: 'Pennsylvania',
  44: 'Rhode Island',
  45: 'South Carolina',
  46: 'South Dakota',
  47: 'Tennessee',
  48: 'Texas',
  49: 'Utah',
  50: 'Vermont',
  51: 'Virginia',
  53: 'Washington',
  54: 'West Virginia',
  55: 'Wisconsin',
  56: 'Wyoming',
};

const Map = () => {
  const beforeMapRef = useRef();
  const afterMapRef = useRef();
  const [selectedOption, setSelectedOption] = useState('pac2');
  const [, setSelectedStates] = useState([]);

  const generateMap = (ref, mapData, unis) => {
    const svg = d3.select(ref.current)
      .attr('width', '100%')
      .attr('height', 'auto')
      .attr('viewBox', '0 0 600 375')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const projection = d3.geoAlbersUsa().scale(600).translate([300, 200]);
    const path = d3.geoPath().projection(projection);
    const states = feature(data, data.objects.states).features;

    svg.selectAll('*').remove();

    svg.selectAll('path')
      .data(states)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', (d) => (mapData.includes(stateNames[d.id]) ? '#176893' : '#cbd4e3'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on('mouseover', function handleMouseOver() {
        d3.select(this).attr('fill', '#fed23b');
      })
      .on('mouseout', function handleMouseOut(_event, d) {
        d3.select(this).attr('fill', mapData.includes(stateNames[d.id]) ? '#176893' : '#cbd4e3');
      });

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)');

    svg.selectAll('.m')
      .data(unis)
      .enter()
      .append('image')
      .attr('width', 27)
      .attr('height', 27)
      .attr('href', (d) => d.image)
      .attr('transform', (d) => {
        const p = projection([d.long, d.lat]);
        return `translate(${p[0] - 10}, ${p[1] - 10})`;
      })
      .on('mouseover', (_event, d) => {
        tooltip.style('visibility', 'visible').text(d.name);
      })
      .on('mousemove', (event) => {
        tooltip.style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });
  };

  const generateBeforeMap = () => {
    generateMap(beforeMapRef, pacStates, pac12Universities);
  };

  const generateAfterMap = () => {
    const filteredUniversities = pac12Universities.filter((d) => selectedOption === d.conf);
    generateMap(afterMapRef, conferences[selectedOption], filteredUniversities);
  };

  const handleOptionChange = (event) => {
    const selected = event.target.value;
    setSelectedOption(selected);
    setSelectedStates(conferences[selected]);
  };

  useEffect(() => {
    generateBeforeMap();
  }, []);

  useEffect(() => {
    generateAfterMap();
  }, [selectedOption]);

  return (
    <div style={{
      flex: '1',
      minWidth: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: 0,
      margin: 0,
    }}
    >
      <h2>The dissolution of the Pac-12 conference</h2>

      <div style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
        <div style={{
          flex: '1',
          minWidth: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 0,
          margin: 0,
        }}
        >
          <h4 style={{ marginBottom: '0px' }}>The modern Pac-12 before dissolution</h4>
          <svg
            ref={beforeMapRef}
            style={{
              width: '100%', height: 'auto', marginTop: 33, padding: 0,
            }}
          />
        </div>
        <div style={{
          flex: '1',
          minWidth: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 0,
          margin: 0,
        }}
        >
          <h4 style={{ marginBottom: '0px' }}>Which Pac-12 universities are now headed to</h4>
          <div style={{ marginTop: '10px' }}>
            <select onChange={handleOptionChange} value={selectedOption}>
              <option value="pac2">Pac-2</option>
              <option value="acc">ACC</option>
              <option value="bigTen">Big Ten</option>
              <option value="big12">Big 12</option>
            </select>
          </div>
          <svg
            ref={afterMapRef}
            style={{
              width: '100%', height: 'auto', margin: 0, padding: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Map;
