import d3 from 'd3';
import topojson from 'topojson';
import Datamap from 'datamaps/dist/datamaps.usa.min'
import React from 'react';
import ReactDOM from 'react-dom';
import statesDefaults from '../data/states-defaults';
import objectAssign from 'object-assign';

import Gauge from './d3Components/gauge.js';

export default class MyTestD3Component extends React.Component {
  constructor(props){
    super(props);
    this.datamap = null;
  }
  linearPalleteScale(value){
    const dataValues = this.props.regionData.map(function(data) { return data.value });
    const minVal = Math.min(...dataValues);
    const maxVal = Math.max(...dataValues);
    return d3.scale.linear().domain([minVal, maxVal]).range(["#EFEFFF","#02386F"])(value);
  }
  redducedData(){
    const newData = this.props.regionData.reduce((object, data) => {
      object[data.code] = { value: data.value, fillColor: this.linearPalleteScale(data.value) };
      return object;
    }, {});
    return objectAssign({}, statesDefaults, newData);
  }
  renderMap(){
    return new Datamap({
      element: ReactDOM.findDOMNode(this),
      scope: 'usa',
      data: this.redducedData(),
      geographyConfig: {
        borderWidth: 0.5,
        highlightFillColor: '#FFCC80',
        popupTemplate: function(geography, data) {
          if (data && data.value) {
            return '<div class="hoverinfo"><strong>' + geography.properties.name + ', ' + data.value + '</strong></div>';
          } else {
            return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
          }
        }
      }
    });
  }
  currentScreenWidth(){
    return window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
  }
  componentDidMount(){

    const gauge = new Gauge('#datamap-container', {
  		size: 300,
  		clipWidth: 300,
  		clipHeight: 300,
  		ringWidth: 60,
  		maxValue: 10,
  		transitionMs: 4000,
  	});

    gauge.render();
    gauge.update(Math.random() * 10);
    // const dataArray = [20, 40, 50]
    // const mapContainer = d3.select('#datamap-container')
    //                         .append('svg')
    //                         .attr('width', 500)
    //                         .attr('height', 500);
    // const bars = mapContainer.selectAll('rect')
    //                         .data(dataArray)
    //                         .enter()
    //                           .append('rect')
    //                           .attr('width', d => d * 10)
    //                           .attr('height', 50)
    //                           .attr('y', (d, i) => i * 100);

    // const initialScreenWidth = this.currentScreenWidth();
    // const containerWidth = (initialScreenWidth < 600) ?
    //   { width: initialScreenWidth + 'px',  height: (initialScreenWidth * 0.5625) + 'px' } :
    //   { width: '600px', height: '350px' }
    //
    // mapContainer.style(containerWidth);
    // this.datamap = this.renderMap();
    // window.addEventListener('resize', () => {
    //   const currentScreenWidth = this.currentScreenWidth();
    //   const mapContainerWidth = mapContainer.style('width');
    //   if (this.currentScreenWidth() > 600 && mapContainerWidth !== '600px') {
    //     d3.select('svg').remove();
    //     mapContainer.style({
    //       width: '600px',
    //       height: '350px'
    //     });
    //     this.datamap = this.renderMap();
    //   }
    //   else if (this.currentScreenWidth() <= 600) {
    //     d3.select('svg').remove();
    //     mapContainer.style({
    //       width: currentScreenWidth + 'px',
    //       height: (currentScreenWidth * 0.5625) + 'px'
    //     });
    //     this.datamap = this.renderMap();
    //   }
    // });
  }
  componentDidUpdate(){
    // this.datamap.updateChoropleth(this.redducedData());
  }
  componentWillUnmount(){
    // d3.select('svg').remove();
  }
  render() {
    require('./MyTestD3Component.scss');
    return (
      <div>
        <div className='test'>this is css test</div>
        <div id="datamap-container"> hello d3</div>
      </div>
    );
  }
}

MyTestD3Component.propTypes = {
    regionData: React.PropTypes.array
};
