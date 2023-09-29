const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let data;
let options;
let selectedX;
let selectedY;
let selectedOption;

const dropdownMenu = (selection, selectedAxis) => {
  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
    .merge(select)
  		.on('change', function() {
  				if(selectedAxis === 'x'){
          	selectedX = this.value;
            render();
          }
    			else {
          	selectedY = this.value;
            render();
          }
  		});
  
  selectedAxis === 'x' 
    ? selectedOption = selectedX
  	: selectedOption = selectedY;
  
  const option = select.selectAll('option').data(options);
  option.enter().append('option')
    .merge(option)
  		.attr('value', d => d)
  		.property('selected', d => d === selectedOption)
  		.text(d => d);
};

const render = () => {
  d3.select('#x-menu')
	.call(dropdownMenu, 'x');
  
  d3.select('#y-menu')
	.call(dropdownMenu, 'y');
  
  const margin = { top: 15, right:200, bottom: 145, left: 130 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
    
  const xValue = d => d[selectedX];
  const yValue = d => d[selectedY];
  const colorValue = d => d.class;
  
  const xScale = d3.scaleLinear()
  	.domain(d3.extent(data, xValue))
  	.range([0, innerWidth])
  	.nice();
  
  const yScale = d3.scaleLinear()
  	.domain(d3.extent(data, yValue))
  	.range([innerHeight, 0])
  	.nice();
  
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(colorValue))
    .range(['#E6842A', '#137B80', '#8E6C8A']);
  
  const g = svg.selectAll('.container').data([null])
  const gEnter = g
  	.enter().append('g')
  		.attr('class', 'container')
  		.attr('transform', `translate(${margin.left},${margin.top})`);
  
  drawAxis({
    g: g,
    gEnter: gEnter,
    containerInnerWidth: innerWidth,
    containerInnerHeight: innerHeight,
    xScale: xScale,
    yScale: yScale
  })
  
  drawScatterPlot({
    g: g,
    gEnter: gEnter,
    containerInnerWidth: innerWidth,
    containerInnerHeight: innerHeight,
    xScale: xScale,
    yScale: yScale,
    xValue: xValue,
    yValue: yValue,
    radius: 10,
    colorScale: colorScale,
    colorValue: colorValue
  })
  
  colorLegend({
  	colorScale: colorScale,
    colorLegendLabel: 'Class',
    colorLegendX: 777,
    colorLegendY: 70,
  })
}

/* Draw Axis */
const drawAxis = (props) => {
	const {
    g,
    gEnter,
    containerInnerWidth,
    containerInnerHeight,
    xScale,
    yScale
  } = props;
  
  const xAxis = d3.axisBottom(xScale)
  	.tickSize(-containerInnerHeight)
  	.tickPadding(15);
  
  const yAxis = d3.axisLeft(yScale)
  	.tickSize(-containerInnerWidth)
  	.tickPadding(10);
  
  const xAxisG = g.select('.x-axis');
  const xAxisGEnter = gEnter
  	.append('g')
  		.attr('class', 'x-axis');
  xAxisG
  	.merge(xAxisGEnter)
  		.attr('transform', `translate(0,${containerInnerHeight})`)
  		.call(xAxis)
    	.selectAll('.domain').remove();
  
  xAxisGEnter
  	.append('text')
      .attr('class', 'axis-label')
      .attr('y', 80)
      .attr('fill', 'black')
  	.merge(xAxisG.select('.axis-label'))
  		.attr('x', containerInnerWidth / 2)
      .text(selectedX);
  
  const yAxisG = g.select('.y-axis');
  const yAxisGEnter = gEnter
  	.append('g')
  		.attr('class', 'y-axis');
  yAxisG
  	.merge(yAxisGEnter)
  		.call(yAxis)
    	.selectAll('.domain').remove();
  
	yAxisGEnter
  	.append('text')
      .attr('class', 'axis-label')
      .attr('y', -75)
      .attr('fill', 'black')
      .attr('transform', `rotate(-90)`)
      .style('text-anchor', 'middle')
  	.merge(yAxisG.select('.axis-label'))
  		.attr('x', -containerInnerHeight / 2)
      .text(selectedY);
}
 

const drawScatterPlot = (props) => {
	const {
    g,
    gEnter,
    containerInnerWidth,
    containerInnerHeight,
    xScale,
    yScale,
    xValue,
    yValue,
    radius,
    colorScale,
    colorValue
  } = props;
  
  const circles = g.merge(gEnter)
  	.selectAll('circle').data(data);
  circles
    .enter().append('circle')
  		.attr('cx', containerInnerWidth / 2)
  		.attr('cy', containerInnerHeight / 2)
  		.attr('r', 0)
		.merge(circles)
  		.attr('fill', d => colorScale(colorValue(d)))
  	.transition().duration(2000)
  	.delay((d, i) => i * 10)
  		.attr('cy', d => yScale(yValue(d)))
  		.attr('cx', d => xScale(xValue(d)))
  		.attr('r', radius);
}

const colorLegend = (props) => {
  const {
  	colorScale,
    colorLegendLabel,
    colorLegendX,
    colorLegendY,
    tickSpacing = 30,
    tickPadding = 15,
    colorLegendLabelX = -30,
    colorLegendLabelY = -24
  } = props;
  
  const colorLegendG = svg
    .selectAll('g.color-legend')
    .data([null])
    .join('g')
    .attr('class', 'color-legend')
    .attr(
      'transform',
      `translate(${colorLegendX},${colorLegendY})`
    );

  colorLegendG
    .selectAll('text.color-legend-label')
    .data([null])
    .join('text')
    .attr('x', colorLegendLabelX)
    .attr('y', colorLegendLabelY)
    .attr('class', 'color-legend-label')
    .attr('font-family', 'sans-serif');

  colorLegendG
    .selectAll('g.tick')
    .data(colorScale.domain())
    .join((enter) =>
      enter
        .append('g')
        .attr('class', 'tick')
        .call((selection) => {
          selection.append('circle');
          selection.append('text');
        })
    )
    .attr(
      'transform',
      (d, i) => `translate(0, ${i * tickSpacing})`
    )
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif')
    .call((selection) => {
      selection
        .select('circle')
        .attr('r', 10)
        .attr('fill', colorScale);
      selection.select('text')
        .attr('dy', '0.32em')
        .attr('x', tickPadding)
        .text((d) => d);
    });
}
  
d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv')
  .then(loadedData =>{
  	data = loadedData;
    data.forEach(d => {
      d["sepal length"] = +d["sepal length"];
      d["sepal width"] = +d["sepal width"];
      d["petal width"] = +d["petal width"];
      d["petal length"] = +d["petal length"];
    });
  	data.pop();
  	selectedX = data.columns[1];
  	selectedY = data.columns[0];
		options = Object.values(data.columns);
  	options = options.slice(0,4);
  
  	render();
});