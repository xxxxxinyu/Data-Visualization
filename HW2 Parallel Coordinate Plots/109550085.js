const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const column = ['sepal length', 'sepal width', 'petal length', 'petal width'];

const color = d => {
	if(d == 'Iris-setosa') return "#E6842A";
  else if(d == 'Iris-versicolor') return "#137B80";
  else return "#8E6C8A";
};

const render = data => {
 	const title = "Iris Parallel Coordinate Plot";
  
  const margin = { top: 120, right: 100, bottom: 70, left: 120};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const g = svg.append('g')
  	.attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  const x = d3.scalePoint()
  	.domain(column)
  	.range([0, innerWidth]);
  
  var y = {};
  var yAxis = {};
  
  for(var i in column) {
  	name = column[i];
    y[name] = d3.scaleLinear()
    	.domain(d3.extent(data, d => d[name]))
    	.range([innerHeight, 0])
    	.nice();
    yAxis[name] = d3.axisLeft(y[name])
    	.tickPadding(10);
  }
  
  var draging = {};
  
  const Position = d => 
  	draging[d] == null ? x(d) : draging[d];
  
  const path = d =>
  	d3.line()(column.map(p => [Position(p), y[p](d[p])]));
  
  const pathG = g.selectAll('path').data(data)
  	.enter().append('path')
      .attr('d', path)
      .attr('stroke', d => { return color(d.class); })
  
  const yAxisG = g.selectAll('.domain').data(column)
  	.enter().append('g')
  		.each(function(d) { d3.select(this).call(yAxis[d]); })
  		.attr('transform', d => 'translate(' + x(d) +',0)');
  
  const drag = d => {
  	draging[d] = Math.min(innerWidth+30, Math.max(-30, d3.event.x));
    pathG.attr('d', path);
    column.sort((p, q) => Position(p) - Position(q));
    x.domain(column);
    yAxisG.attr('transform', d => 'translate(' + Position(d) +',0)');
  };
  
  const transition = g =>
  	g.transition().duration(400);
  
  const dragend = d => {
  	delete draging[d];
    transition(pathG)
      .attr('d', path);
    transition(yAxisG)
      .attr('transform', p => 'translate(' + x(p) + ',0)');
  };

  yAxisG.call(d3.drag()
             .subject({x: x})
             .on('drag', drag)
             .on('end', dragend)
  );
  
  yAxisG.append('text')
  	.attr('class', 'axis-label')
  	.attr('y', -25)
  	.attr('text-anchor', 'middle')
  	.text(d => d);
  
  g.append('text')
  		.attr('class', 'title')
  		.attr('y', -65)
  		.attr('x', 110)
  		.text(title);
  
  g.append('text')
  		.attr('class', 'Iris-setosa_color')
  		.attr('y', 350)
  		.attr('x', 160)
  		.text('Iris-setosa');
  
  g.append('rect')
  		.attr('class', 'Iris-setosa_color')
  		.attr('y', 340)
  		.attr('x', 135)
  		.attr('width', 15)
  		.attr('height', 5)
  
  g.append('text')
  		.attr('class', 'Iris-versicolor_color')
  		.attr('y', 350)
  		.attr('x', 375)
  		.text('Iris-versicolor');
  
  g.append('rect')
  		.attr('class', 'Iris-versicolor_color')
  		.attr('y', 340)
  		.attr('x', 350)
  		.attr('width', 15)
  		.attr('height', 5);
  
  g.append('text')
  		.attr('class', 'Iris-virginica_color')
  		.attr('y', 350)
  		.attr('x', 610)
  		.text('Iris-virginica');
  
  g.append('rect')
  		.attr('class', 'Iris-virginica_color')
  		.attr('y', 340)
  		.attr('x', 585)
  		.attr('width', 15)
  		.attr('height', 5);
  
};

d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv')
  .then(loadedData =>{
  	const data = loadedData;
    data.forEach(d => {
      d["sepal length"] = +d["sepal length"];
      d["sepal width"] = +d["sepal width"];
      d["petal width"] = +d["petal width"];
      d["petal length"] = +d["petal length"];
    });

  	render(data);
});