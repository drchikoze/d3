import d3 from 'd3';

export default class Gauge {
  constructor(container, configuration) {
    this.container = container;
    this.config = {
  		size						: 200,
  		clipWidth					: 200,
  		clipHeight					: 110,
  		ringInset					: 20,
  		ringWidth					: 20,

  		pointerWidth				: 10,
  		pointerTailLength			: 5,
  		pointerHeadLengthPercent	: 0.9,

  		minValue					: 0,
  		maxValue					: 10,

  		minAngle					: -90,
  		maxAngle					: 90,

  		transitionMs				: 750,

  		majorTicks					: 5,
  		labelFormat					: d3.format(',g'),
  		labelInset					: 10,

  		arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
  	};

    this.range = undefined;
  	this.r = undefined;
  	this.pointerHeadLength = undefined;
  	this.value = 0;

  	this.svg = undefined;
  	this.arc = undefined;
  	this.scale = undefined;
  	this.ticks = undefined;
  	this.tickData = undefined;
  	this.pointer = undefined;

  	this.donut = d3.layout.pie();

    this.configure(configuration);
  }

  deg2rad(deg){
		return deg * Math.PI / 180;
	}

  newAngle(d) {
		let ratio = this.scale(d);
		let newAngle = this.config.minAngle + (ratio * this.range);

		return newAngle;
	}

  configure(configuration) {
		let prop = undefined;
		for ( prop in configuration ) {
			this.config[prop] = configuration[prop];
		}

		this.range = this.config.maxAngle - this.config.minAngle;
		this.r = this.config.size / 2;
		this.pointerHeadLength = Math.round(this.r * this.config.pointerHeadLengthPercent);

		// a linear scale that maps domain values to a percent from 0..1
		this.scale = d3.scale.linear()
			.range([0,1])
			.domain([this.config.minValue, this.config.maxValue]);

    console.log('this.scale', this.scale);
    console.log('this.config', this.config);
		this.ticks = this.scale.ticks(this.config.majorTicks);
    const majorTicks = this.config.majorTicks;
		this.tickData = d3.range(this.config.majorTicks).map(function() {return 1 / majorTicks;});
    const minAngle = this.config.minAngle;
    const deg2rad = this.deg2rad;
    const range = this.range;
		this.arc = d3.svg.arc()
			.innerRadius(this.r - this.config.ringWidth - this.config.ringInset)
			.outerRadius(this.r - this.config.ringInset)
			.startAngle(function(d, i) {
				let ratio = d * i;
				return deg2rad(minAngle + (ratio * range));
			})
			.endAngle(function(d, i) {
				let ratio = d * (i+1);
				return deg2rad(minAngle + (ratio * range));
			});
	}

  centerTranslation() {
		return 'translate('+this.r +','+ this.r +')';
	}

  render(newValue) {
		this.svg = d3.select(this.container)
			.append('svg:svg')
				.attr('class', 'gauge')
				.attr('width', this.config.clipWidth)
				.attr('height', this.config.clipHeight);

		let centerTx = this.centerTranslation();

		let arcs = this.svg.append('g')
				.attr('class', 'arc')
				.attr('style', 'fill: steelblue')
				.attr('transform', centerTx);
    const arcColorFn = this.config.arcColorFn;
    // console.log('arcColorFn', arcColorFn);
    console.log('this.arc', this.arc);
		arcs.selectAll('path')
				.data(this.tickData)
			.enter().append('path')
				.attr('fill', function(d, i) {
					return arcColorFn(d * i);
				})
				.attr('d', this.arc);

		let lg = this.svg.append('g')
				.attr('class', 'label')
				.attr('transform', centerTx);
    const scale = this.scale;
    const minAngle = this.config.minAngle;
    const range = this.range;
    const labelInset = this.config.labelInset
    const r = this.r;

		lg.selectAll('text')
				.data(this.ticks)
			.enter().append('text')
        .attr('style', 'text-anchor: middle; font-size: 14px; font-weight: bold; fill: #666;')
				.attr('transform', function(d) {
					let ratio = scale(d);
					let newAngle = minAngle + (ratio * range);
					return 'rotate(' +newAngle +') translate(0,' +(labelInset - r) +')';
				})
				.text(this.config.labelFormat);

		let lineData = [ [this.config.pointerWidth / 2, 0],
						[0, -this.pointerHeadLength],
						[-(this.config.pointerWidth / 2), 0],
						[0, this.config.pointerTailLength],
						[this.config.pointerWidth / 2, 0] ];
		let pointerLine = d3.svg.line().interpolate('monotone');
		let pg = this.svg.append('g').data([lineData])
				.attr('class', 'pointer')
				.attr('transform', centerTx);

		this.pointer = pg.append('path')
      .attr('style', 'fill: #e85116; stroke: #b64011')
			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
			.attr('transform', 'rotate(' +this.config.minAngle +')');

		this.update(newValue === undefined ? 0 : newValue);
	}

  update(newValue, newConfiguration) {
		if ( newConfiguration  !== undefined) {
			this.configure(newConfiguration);
		}
		let ratio = this.scale(newValue);
		let newAngle = this.config.minAngle + (ratio * this.range);
		this.pointer.transition()
			.duration(this.config.transitionMs)
			.ease('elastic')
			.attr('transform', 'rotate(' +newAngle +')');
	}
}
