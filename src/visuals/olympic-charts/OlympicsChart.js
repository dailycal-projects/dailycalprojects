import React, { Component } from 'react';
import { Treemap } from 'react-vis';
import {
  Label,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  Bar,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { allData } from './chartData.js';
import './olympicsTheme.css';

const chartData = allData;

class OlympicsChart extends Component {
  // Set initial state
  constructor(props) {
    super(props);
    this.state = {
      sport: null,
      viewSport: null,
      left: 1924,
      right: 2016,
    };
  }

  zoom() {
    let { refAreaLeft, refAreaRight } = this.state;
    if (
      refAreaLeft === refAreaRight
      || refAreaLeft == null
      || (refAreaRight == null) | (refAreaRight === '')
    ) {
      this.zoomOut();
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
    this.setState(() => ({
      refAreaLeft: '',
      refAreaRight: '',
      left: refAreaLeft,
      right: refAreaRight,
    }));
  }

  zoomOut() {
    this.setState(() => ({
      refAreaLeft: '',
      refAreaRight: '',
      left: 1924,
      right: 2016,
    }));
  }

  // Method to update sport
  updateSport(d) {
    if (d.data.title === this.state.sport) {
      this.setState({
        sport: null,
      });
    } else {
      this.setState({
        sport: d.data.title,
      });
    }
  }

  viewSport(d) {
    this.setState({
      viewSport: d.data.title,
    });
  }

  // Render Method
  render() {
    const {
      left, right, refAreaLeft, refAreaRight,
    } = this.state;

    const timeFrameData = chartData.filter((d) => d['Olympic Year'] >= left && d['Olympic Year'] <= right);

    // Aggregate per year
    const byYear = {};
    timeFrameData.forEach((d) => {
      if ((this.state.sport === null || d.Sport === this.state.sport)) {
        if (byYear[d['Olympic Year']] === undefined) {
          byYear[d['Olympic Year']] = {
            Gold: 0,
            Silver: 0,
            Bronze: 0,
            Medals: 0,
          };
        }
        byYear[d['Olympic Year']].Gold += d.Gold;
        byYear[d['Olympic Year']].Silver += d.Silver;
        byYear[d['Olympic Year']].Bronze += d.Bronze;
        byYear[d['Olympic Year']].Medals += d.Gold + d.Silver + d.Bronze;
      }
    });
    const yearData = [];
    Object.keys(byYear).forEach((d) => {
      yearData.push({
        Year: d,
        Gold: byYear[d].Gold,
        Silver: byYear[d].Silver,
        Bronze: byYear[d].Bronze,
        Medals: byYear[d].Medals,
      });
    });

    // Aggregate across time
    const byAthlete = {};
    timeFrameData.forEach((d) => {
      if (byAthlete[d.Name] === undefined) {
        byAthlete[d.Name] = {
          Sport: d.Sport,
          Gold: 0,
          Silver: 0,
          Bronze: 0,
        };
      }
      byAthlete[d.Name].Gold += d.Gold;
      byAthlete[d.Name].Silver += d.Silver;
      byAthlete[d.Name].Bronze += d.Bronze;
    });

    const athleteData = [];
    Object.keys(byAthlete).forEach((d) => {
      athleteData.push({
        Name: d,
        Sport: byAthlete[d].Sport,
        Gold: byAthlete[d].Gold,
        Silver: byAthlete[d].Silver,
        Bronze: byAthlete[d].Bronze,
      });
    });

    // Treemap Data
    const bySport = {};
    athleteData.forEach((d) => {
      if (this.state.sport === null || d.Sport === this.state.sport) {
        if (bySport[d.Sport] === undefined) {
          bySport[d.Sport] = 0;
        }
        bySport[d.Sport] += d.Gold + d.Silver + d.Bronze;
      }
    });
    const treeData = [];
    Object.keys(bySport).forEach((d) => treeData.push({
      title: d,
      size: bySport[d],
      style: {
        border: '1px solid white',
      },
    }));

    const targetSport = this.state.viewSport === null ? this.state.sport : this.state.viewSport;

    const filteredData = athleteData
      .filter((d) => {
        if (targetSport === null) return true;
        return d.Sport === targetSport;
      })
      .sort((a, b) => (
        3 * b.Gold
          - 3 * a.Gold
          + 2 * b.Silver
          - 2 * a.Silver
          + b.Bronze
          - a.Bronze
      ))
      .filter((d, i) => i < 10);

    const sportText = `Top medalists in ${
      this.state.viewSport === null
        ? this.state.sport === null ? 'all sports' : `${this.state.sport}` : `${this.state.viewSport}`}`;
    // Return DOM elements
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            width={800}
            height={400}
            data={yearData}
            onMouseDown={(e) => this.setState({
              refAreaLeft: e === null ? null : e.activeLabel,
            })}
            onMouseMove={(e) => this.state.refAreaLeft
                && this.setState({ refAreaRight: e.activeLabel })}
              // eslint-disable-next-line react/jsx-no-bind
            onMouseUp={this.zoom.bind(this)}
            margin={{
              top: 5, right: 0, left: 0, bottom: 40,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="Year"
              domain={[left - 2, right + 2]}
            >
              <Label
                value="Medals by year"
                position="bottom"
              />
            </XAxis>
            <YAxis type="number" />
            <Tooltip />
            <Bar dataKey="Gold" fill="#FED23B" stackId="a" />
            <Bar dataKey="Silver" fill="#C0C0C0" stackId="a" />
            <Bar dataKey="Bronze" fill="#B7823E" stackId="a" />

            {refAreaLeft && refAreaRight ? (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
              />
            ) : null}
          </BarChart>
        </ResponsiveContainer>

        <div style={{ display: 'flex' }}>
          <ResponsiveContainer width="100%" height={950}>
            <BarChart
              // className="chart"
              layout="vertical"
              data={filteredData}
              margin={{
                top: 5, right: 50, left: 30, bottom: 60,
              }}
            >
              <XAxis type="number">
                <Label value={sportText} offset={-10} position="insideBottom" />
              </XAxis>
              <YAxis type="category" dataKey="Name" />
              <Tooltip />
              <Bar dataKey="Gold" fill="#FED23B" stackId="a" />
              <Bar dataKey="Silver" fill="#C0C0C0" stackId="a" />
              <Bar dataKey="Bronze" fill="#B7823E" stackId="a" />

            </BarChart>
          </ResponsiveContainer>

          <div>
            <Treemap
              color="#215675"
              animation
              onLeafMouseOut={() => this.setState({
                viewSport: null,
              })}
              onLeafMouseOver={this.viewSport.bind(this)}
              onLeafClick={this.updateSport.bind(this)}
              hideRootNode
              data={{ children: treeData }}
              height={950}
              width={550}
            />
          </div>
        </div>
      </div>
    );
  }
}

// Export component for rendering
export default OlympicsChart;
