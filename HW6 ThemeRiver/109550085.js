const Width = 1200;
const Height = 500;

const margin = {
	left: 80,
  right: 20,
  top: 105,
  bottom: 40
};

const innerWidth = Width - margin.left- margin.right;
const innerHeight = Height - margin.top - margin.bottom;

let parsedData = []

const svg = d3.select('body')
	.append('svg')
		.attr('width', Width)
		.attr('height', Height);

const g = svg.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

const typeKeys = ["unit1", "unit2", "unit3",
                  "house2", "house3", "house4", "house5",];

const Order = ["Appearance", "Ascending", "Descending", "InsideOut", "None", "Reverse"]
const Offset = ["Diverging", "None", "Silhouette", "Wiggle"]

let selectOrder = "InsideOut"
let selectOffset = "Wiggle"
let selectedOption
let options

let myOrder = "stackOrderInsideOut"
let myOffset = "stackOffsetWiggle"

const dropdownMenu = (selection, selected) => {
	let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
  	.merge(select)
  		.on("change", function() {
				if(selected === 'order'){
        	selectOrder = this.value
          if(selectOrder == "Appearance"){
          	myOrder = "stackOrderAppearance"
          }
          else if(selectOrder == "Ascending"){
            myOrder = "stackOrderAscending"
          }
          else if(selectOrder == "Descending"){
            myOrder = "stackOrderDescending"
          }
          else if(selectOrder == "InsideOut"){
            myOrder = "stackOrderInsideOut"
          }
          else if(selectOrder == "None"){
            myOrder = "stackOrderNone"
          }
          else if(selectOrder == "Reverse"){
            myOrder = "stackOrderReverse"
          }
        } 
    		else if(selected === 'offset'){
        	selectOffset = this.value
          if(selectOffset == "Diverging"){
            myOffset = "stackOffsetDiverging";
          }
          else if(selectOffset == "None"){
            myOffset = "stackOffsetNone";
          }
          else if(selectOffset == "Silhouette"){
            myOffset = "stackOffsetSilhouette";
          }
          else if(selectOffset == "Wiggle"){
            myOffset = "stackOffsetWiggle";
          }
        }
    
    		render()
  		})
  
  selected === 'order'
  	? selectedOption = selectOrder
  	: selectedOption = selectOffset
  
  selected === 'order'
  	? options = Order
  	: options = Offset
  
  const option = select.selectAll('option').data(options)
  option.enter().append('option')
  	.merge(option)
  		.attr("vaule", d => d)
  		.property('selected', d => d === selectedOption)
  		.text(d => d)
}

const render = () => {
  g.selectAll("*").remove()
  
  d3.select('#selectOrder').call(dropdownMenu, 'order')
  d3.select('#selectOffset').call(dropdownMenu, 'offset')
  
  // stack the data
  const stackedData = d3.stack()
  	.keys(typeKeys)
  	.order(d3[myOrder])
  	.offset(d3[myOffset])
  	(parsedData)
  
  //console.log(stackedData);
  
  // X scale and Axis
	const xScale = d3.scaleTime()
  	.domain(d3.extent(parsedData, d => d.saledate))
  	.range([0, innerWidth])
  	.nice();
  
  const xAxis = d3.axisBottom(xScale)
  	.tickSize(-innerHeight)
  	.tickPadding(15);
  
  const xAxisG = g.append('g')
  	.attr("class", "x axis")
  	.attr("transform", `translate(0, ${innerHeight})`)
  	.call(xAxis)
  	.select(".domain").remove();
  
  // Y scale and Axis
  const formatter = d3.format("~s")
  const yScale = d3.scaleLinear()
  	.domain([-5000000, 5000000])
  	.range([innerHeight, 0])
  
  /*
  const yAxis = d3.axisLeft(yScale)
  	.tickSize(0)
  	.tickPadding(15)
  	.tickFormat(formatter)
  
  const yAxisG = g.append('g')
  	.attr("class", "y axis")
  	.call(yAxis)
  	.select(".domain").remove();
  */
  
  // color palette
  const color = d3.scaleOrdinal()
  	.domain(typeKeys)
  	.range(d3.schemeTableau10)
  
	// create the areas
  g.selectAll("allLayer")
  	.data(stackedData)
  	.join("path")
  		.attr("class", d => "stackedArea " + d.key)
  		.style("fill", d => color(d.key))
  		.style('opacity', 1)
  		.attr("d", d3.area()
        .x(d => xScale(d.data.saledate))
        .y0(d => yScale(d[0])) 
        .y1(d => yScale(d[1])) 
        .curve(d3.curveBasis)
    	)
      .on("mouseover", (event, d) => {
        const mouseX = d3.pointer(event)[0];
        const mouseY = d3.pointer(event)[1];
        const invertedX = xScale.invert(mouseX);
        const bisectDate = d3.bisector(d => d.saledate).left;
        const i = bisectDate(parsedData, invertedX, 1);
        const d0 = parsedData[i - 1];
        const d1 = parsedData[i];
        const closestData = invertedX - d0.saledate > d1.saledate - invertedX ? d1 : d0;
        const Format = d3.format(",");
        //console.log(closestData);
        const tooltip = d3.select("#tooltip");
        tooltip.style("left", mouseX + margin.left-80 + "px")
            .style("top", mouseY + margin.top+20 + "px")
            .text("MA of " + d.key + ": $" + Format(closestData[d.key]));

        tooltip.classed("hidden", false);
      })
      .on("mouseout", () => {
        d3.select('#tooltip').classed("hidden", true);
      });
  
  // color legend
  const colorLegendG = svg.append('g')
  	.attr("class", "color-legend")
  	.attr("transform", `translate(${margin.left+30}, 0)`)
  
  const colorLegend = colorLegendG.selectAll('.color-legend')
  	.data(typeKeys)
  	.enter().append('g')
  		.attr("class", "color-legend")
  		.attr("transform", (d, i) => `translate(${i * 120}, 0)`)
  		
  
  colorLegend.append('rect')
  	.attr("width", 15)
  	.attr("height", 15)
  	.style("fill", d => color(d))
  
  colorLegend.append('text')
  	.attr("x", 24)
  	.attr("y", 9)
  	.attr("dy", ".35em")
  	.text(d => d);
  
  colorLegend
  	.on("click", (event, d) => {
  		const opacity = g.selectAll("." + d).style("opacity");
      if (opacity === "1") {
          g.selectAll("." + d).style("opacity", 0.2);
      } else {
          g.selectAll("." + d).style("opacity", 1);
      }
  	})
  /*
  svg.append("text")
  	.attr("class", "chartlabel")
  	.attr("x", 45)
    .attr("y", 80)
  	.attr("text-anchor", "start")
  	.text("MC (millions)")
  */
};

d3.csv('http://vis.lab.djosix.com:2023/data/ma_lga_12345.csv')
  .then(data => {
		var parseDate = d3.timeParse("%d/%m/%Y");
  	var formatDate = d3.timeFormat("%Y-%m-%d");
  
  	var classes = [['house', '2'], 
                  ['house', '3'],
                  ['house', '4'],
                  ['house', '5'],
                  ['unit', '1'],
                  ['unit', '2'],
                  ['unit', '3']];
   
  	var Dates = Array.from(new Set(data.map(d => d.saledate)));
  
  	Dates.forEach(saledate => {
    	var entry = { saledate: saledate };
      
      classes.forEach(Class => {
      	var type = Class[0];
        var bedrooms = Class[1];
        
        var filtered = data.filter(d => 
            {return d.type === type && d.bedrooms == bedrooms && d.saledate === saledate});
        
        if(filtered.length > 0)
          entry[type + bedrooms] = +(filtered[0].MA);
        else
          entry[type + bedrooms] = 0;
      });
      parsedData.push(entry);
    });
  
  	parsedData.forEach(d => {
    	d.saledate = parseDate(d.saledate)
    });
  
  	parsedData.sort((a, b) => {return d3.ascending(a.saledate, b.saledate)})
  	//console.log(parsedData);
  	render();
})