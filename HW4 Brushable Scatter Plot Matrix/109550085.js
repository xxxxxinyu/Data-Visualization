const cross = (a, b) => {
  const c = [], n = a.length, m = b.length;
  for (var i = -1; ++i < n;) 
    for (var j = -1; ++j < m;) 
      c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}

const render = data => {
  const width = 960,
      size = 270,
      padding = 20;
  
	var colExtent = {},
      cols = ['sepal length', 'sepal width', 'petal length', 'petal width'],
      n = cols.length;

  cols.forEach(col => {
    colExtent[col] = d3.extent(data, d => d[col]);
    colExtent[col][1] += 0.5;
  });
  
  const y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

  const yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6);

  const color = d3.scaleOrdinal()
    .domain(['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'])
    .range(['#E6842A', '#137B80', '#8E6C8A']);
   
  const x = d3.scaleLinear()	
    .range([padding / 2, size - padding / 2]);
  
  const xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n + padding / 2);

  const brush = d3.brush()
      .on("start", brushstart)
      .on("brush", brushmove)
      .on("end", brushend)
      .extent([[0,0], [size,size]]);

  const svg = d3.select("body")
  	.append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(cols)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", (d, i) => "translate(" + (n - i - 1) * size + ",0)")
      .each(function(d) { 
        x.domain(colExtent[d]); 
        d3.select(this).call(xAxis); 
      });

  svg.selectAll(".y.axis")
  	.data(cols)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", (d, i) => "translate(0," + i * size + ")")
      .each(function(d) { 
        y.domain(colExtent[d]); 	
        d3.select(this).call(yAxis); 
      });
  
  var cell = svg.selectAll(".cell")
    .data(cross(cols, cols))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", d => "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")")
      .each(plot);

  cell.filter(d => d.i === d.j)
    .append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".73em")
    .text(d => d.x);
	
  cell.call(brush);
  
  svg.append('text')
  	.attr('class', 'Iris-setosa_color')
  	.attr('y', 0)
  	.attr('x', 0)
  	.text('Iris-setosa');
  
  svg.append('rect')
  	.attr('class', 'Iris-setosa_color')
  	.attr('y', -6)
  	.attr('x', -15)
  	.attr('width', 10)
  	.attr('height', 5);
  
  svg.append('text')
  	.attr('class', 'Iris-versicolor_color')
  	.attr('y', 0)
  	.attr('x', 120)
  	.text('Iris-versicolor');
  
  svg.append('rect')
  	.attr('class', 'Iris-versicolor_color')
  	.attr('y', -6)
  	.attr('x', 105)
  	.attr('width', 10)
  	.attr('height', 5);
  
  svg.append('text')
  	.attr('class', 'Iris-virginica_color')
  	.attr('y', 0)
  	.attr('x', 270)
  	.text('Iris-virginica');
  
  svg.append('rect')
  	.attr('class', 'Iris-virginica_color')
  	.attr('y', -6)
  	.attr('x', 255)
  	.attr('width', 10)
  	.attr('height', 5);

  function plot(p) {
    const cell = d3.select(this);

    x.domain(colExtent[p.x]);
    y.domain(colExtent[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);
    
    if (p.x === p.y) {
      const histData = data.map(d => d[p.x]);
      
      const bins = d3.histogram()
      	.domain(x.domain())
      	.thresholds(x.ticks(6))(histData);
      
      const barWidth = (size - padding) / bins.length;
			
    	cell.selectAll(".bar")
      	.data(bins)
      	.enter().append("rect")
      		.attr("x", d => x(d.x0))
          .attr("y", d => size - padding / 2  - d.length / histData.length * (size - padding))
          .attr("width", barWidth)
          .attr("height", d => d.length / histData.length * (size - padding))
          .style("fill", "steelblue");
    }
    else {
    	cell.selectAll("circle")
      .data(data)
      .enter().append("circle")
        .attr("cx", d => x(d[p.x]))
        .attr("cy", d => y(d[p.y]))
        .attr("r", 4)
        .style("fill", d => color(d.class));
    }
  }

  var brushCell;

  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.move, null);
      brushCell = this;
      x.domain(colExtent[p.x]);
      y.domain(colExtent[p.y]);
    }
  }

  function brushmove(p) {
    const e = d3.brushSelection(this);
    svg.selectAll("circle").classed("hidden", d => {
      return !e
        ? false
        : (
          e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
          || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
        );
    });
  }

  function brushend() {
    var e = d3.brushSelection(this);
    if (e === null) svg.selectAll(".hidden").classed("hidden", false);
  }
};

d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv")
	.then(data => {
  	data.forEach(d => {
      d["sepal length"] = +d["sepal length"];
      d["sepal width"] = +d["sepal width"];
      d["petal width"] = +d["petal width"];
      d["petal length"] = +d["petal length"];
    });
  
		render(data);
  });
