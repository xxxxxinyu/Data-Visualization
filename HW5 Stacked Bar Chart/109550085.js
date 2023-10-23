let data;

d3.csv("http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv")
	.then(loadedData => {
  	data = loadedData.filter(d => d.scores_overall_rank <= 2010);
 
  	data.forEach(d => {
      d["rank"] = +d["scores_overall_rank"]/10;
      d["overall"] = +d["scores_overall"];
      d["scores_overall_rank"] = +d["scores_overall_rank"];
      d["teaching"] = +d["scores_teaching"]*0.295;
      d["research"] = +d["scores_research"]*0.29;
      d["citations"] = +d["scores_citations"]*0.3;
      d["industry income"] = +d["scores_industry_income"]*0.04;
      d["international outlook"] = +d["scores_international_outlook"]*0.075;
    });
  render();
});

const outerWidth = 1200;
const outerHeight = 2400;

const margin = {
	left: 280,
  top: 175,
  right: 30,
  bottom: 40
};

const innerWidth =
  outerWidth - margin.left - margin.right;
const innerHeight =
  outerHeight - margin.top - margin.bottom;

const xColumn = "overall";
const yColumn = "name";
const criteria = ['teaching', 
              	'research',
               	'citations',
               	'industry income',
               	'international outlook'];

const svg = d3.select('body')
	.append('svg')
		.attr('width', outerWidth)
		.attr('height', outerHeight);

const g = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const Order = ['Ascendingly', 'Descendingly', 'Alphabetically'];
const Sort = ['overall',
                'teaching', 
              	'research',
               	'citations',
               	'industry income',
               	'international outlook'];

let selectOrder = "Descendingly";
let selectSort = "Overall";
let selectedOption;
let options;

const dropdownMenu = (selection, selected) => {
	let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
  	.merge(select)
  		.on('change', function() {
    		if(selected === 'order') {
        	selectOrder = this.value;
          if(selectOrder == "Ascendingly") {
            data.sort((a, b) => {
              if(selectSort == "Overall") return d3.descending(a.scores_overall_rank, b.scores_overall_rank);
              else return d3.ascending(a[selectSort], b[selectSort])
            })
          }
          else if(selectOrder == "Descendingly") {
            console.log(selectSort);
            data.sort((a, b) => {
              if(selectSort == "Overall") {
                return d3.ascending(a.scores_overall_rank, b.scores_overall_rank);}
              else return d3.descending(a[selectSort], b[selectSort])
            })
          }
          else if(selectOrder == "Alphabetically") {
            data.sort((a, b) => {
              return d3.ascending(a.name, b.name)
            })
          }
        }
    		else if(selected === 'sort') {
        	selectSort = this.value;
          if(selectSort == "teaching") {
          	data.sort((a, b) => {
              if(selectOrder == "Ascendingly") return d3.ascending(a.teaching, b.teaching)
            	else if(selectOrder == "Descendingly") return d3.descending(a.teaching, b.teaching)
              else if(selectOrder == "Alphabetically") return d3.ascending(a.name, b.name);
            })
          }
          else if(selectSort == "research") {
          	data.sort((a, b) => {
              if(selectOrder == "Ascendingly") return d3.ascending(a.research, b.research)
            	else if(selectOrder == "Descendingly") return d3.descending(a.research, b.research)
              else if(selectOrder == "Alphabetically") return d3.ascending(a.name, b.name);
            })
          }
          else if(selectSort == "citations") {
          	data.sort((a, b) => {
            	if(selectOrder == "Ascendingly") return d3.ascending(a.citations, b.citations)
            	else if(selectOrder == "Descendingly") return d3.descending(a.citations, b.citations)
              else if(selectOrder == "Alphabetically") return d3.ascending(a.name, b.name);
            })
          }
          else if(selectSort == "industry income") {
          	data.sort((a, b) => {
              if(selectOrder == "Ascendingly") return d3.ascending(a['industry income'], b['industry income'])
            	else if(selectOrder == "Descendingly") return d3.descending(a['industry income'], b['industry income'])
            	else if(selectOrder == "Alphabetically") return d3.ascending(a.name, b.name);
            })
          }
          else if(selectSort == "international outlook") {
          	data.sort((a, b) => {
            	if(selectOrder == "Ascendingly") return d3.ascending(a['international outlook'], b['international outlook'])
            	else if(selectOrder == "Descendingly") return d3.descending(a['international outlook'], b['international outlook'])
            	else if(selectOrder == "Alphabetically") return d3.ascending(a.name, b.name);
            })
          }
          else if(selectSort == "overall") {
          	data.sort((a, b) => {
            	if(selectOrder == "Ascendingly") return d3.descending(a.scores_overall_rank, b.scores_overall_rank)
            	else if(selectOrder == "Descendingly") return d3.ascending(a.scores_overall_rank, b.scores_overall_rank)
              else if(selectOrder == "Alphabetically") return d3.ascending(a.name, b.name);
            })
          }
        }
    
    		render();
  		});
     		    
  selected === 'order'
    ? selectedOption = selectOrder
    : selectedOption = selectSort;
  
  selected === 'order'
    ? options = Order
    : options = Sort;

  const option = select.selectAll('option').data(options);
  option.enter().append('option')
  	.merge(option)
  		.attr('value', d => d)
  		.property('selected', d => d === selectedOption)
  		.text(d => d);
};

const render = () => {
  g.selectAll("*").remove();
  
	const universities = data.map(d => d.name);
	
  d3.select('#selectOrder').call(dropdownMenu, 'order');
  d3.select('#selectSort').call(dropdownMenu, 'sort')
  
  const xScale = d3.scaleLinear()
  	.domain([0, 100])
  	.range([0, innerWidth]);
  
  const xAxis = d3.axisBottom(xScale)
  	.tickSizeOuter(0)
  	.ticks(5);
  	
  const xAxisG = g.append('g')
  	.attr('class', 'x axis')
  	.attr("transform", `translate(0, ${innerHeight})`)
  	.call(xAxis);
  
  const yScale = d3.scaleBand()
  	.domain(universities)
  	.range([0, innerHeight])
  	.padding([0.2]);
  
  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);
  
  const yAxisG = g.append('g')
  	.attr('class', 'y axis')
  	.call(yAxis);
  
  const colorScale = d3.scaleOrdinal()
  	.domain(criteria)
  	.range(d3.schemeSet2);
  
  const stackedData = d3.stack()
  	.keys(criteria)
  	(data);
  
  g.append('g').selectAll('g')
  	// Enter in the stack data = loop key per key = group per group
  	.data(stackedData)
  	.join('g')
  		.attr('fill', d => colorScale(d.key))
  		.attr('class', d => {
    		if(d.key == "industry income") return "Rect industry"; 
    		else if(d.key == "international outlook") return "Rect international";
    		else return "Rect " + d.key;})
  		.selectAll('rect')
  		// enter a second time = loop subgroup per subgroup to add all rectangles
  		.data(d => d)
  		.join('rect')
  			.attr('x', d => xScale(d[0]))
  			.attr('y', d => yScale(d.data.name))
  			.attr('width', d => xScale(d[1]) - xScale(d[0]))
  			.attr('height', yScale.bandwidth())
  		.on("mouseover", (event, d) => {
    		var parentData = d3.select(event.target.parentNode).datum();
    		var Text = parentData.key.charAt(0).toUpperCase() + parentData.key.slice(1).toLowerCase();
    		var value;
    		if(Text == "Teaching") value = d.data["scores_teaching"];
    		else if(Text == "Research") value = d.data["scores_research"];
    		else if(Text == "Citations") value = d.data["scores_citations"];
    		else if(Text == "Industry income") value = d.data["scores_industry_income"];
    		else if(Text == "International outlook") value = d.data["scores_international_outlook"];
    		
  			var xPosition = parseFloat(event.pageX) / 2 + innerWidth / 4;
    		var yPosition = parseFloat(event.pageY) + yScale.bandwidth()/2;

    		d3.select('#tooltip')
    			.style("left", xPosition + "px")
    			.style("top", yPosition + "px")
    			.style("font-size", "20px")
    			.text(Text + " score of " + d.data["name"] + ": " + value); 
    		d3.select('#tooltip').classed("hidden", false);
  		})
  		.on("mouseout", () => {
  			d3.select('#tooltip').classed("hidden", true);
  		});
  	
  // color legend
  const colorLegendG = svg.append('g')
  .attr('class', 'color-legend')
  .attr('transform', `translate(${margin.left-100}, 25)`);

  const colorLegend = colorLegendG.selectAll('.color-legend')
    .data(colorScale.domain())
    .enter().append('g')
    .attr('class', 'color-legend')
    .attr('transform', (d, i) => `translate(0, ${i * 25})`);

  colorLegend.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', d => colorScale(d));

  colorLegend.append('text')
    .attr('x', 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .text(d => d.toUpperCase());
  
  colorLegend
    .on("mouseover", (event, d) => {
      g.selectAll('.Rect').style('opacity', 0.2);
    	if(d == "industry income") g.selectAll('.industry').style('opacity', 1);
    	else if(d == "international outlook") g.selectAll('.international').style('opacity', 1);
    	else g.selectAll('.' + d).style('opacity', 1);
    })
  	.on("mouseout", (event, d) => {
  		g.selectAll('.Rect').style('opacity', 1);
  	});
};

