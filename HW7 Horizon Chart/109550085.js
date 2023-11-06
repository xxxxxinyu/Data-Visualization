const margin = 60;
const interval = 100;
const intervalMargin = 50;
const colMargin = 50;

const svg = d3.select("#horizon-chart");

const width = +svg.attr('width');
const height = +svg.attr('height');

const bandColors = {
    "SO2": ["#FFD1A4", "#FFBB77", "#FFA042", "#FF8000", "#D26900"],
    "NO2": ["#D2A2CC", "#C07AB8", "#AE57A4", "#8F4586", "#6C3365"],
    "O3": ["#D9B3B3", "#C48888", "#AD5A5A", "#804040", "#613030"],
    "CO": ["#CDCD9A", "#B9B973", "#A5A552", "#808040", "#616130"],
    "PM10": ["#A3D1D1", "#81C0C0", "#5CADAD", "#408080", "#336666"],
    "PM2.5": ["#C7C7E2", "#A6A6D2", "#8080C0", "#5A5AAD", "#484891"]
};

const pollutants = ["SO2", "NO2", "O3", "CO", "PM10", "PM2.5"];
const pollutantDomains = { "SO2": 0.01, "NO2": 0.1, "O3": 0.05, "CO": 2.0, "PM10": 200, "PM2.5": 200 };

let data;

const Year = ["2017", "2018", "2019"];
const Band = ["1","2", "3", "4", "5"];

let selectYear = "2017";
let selectBand = "1";
let selectedOption;
let options;

const dropdownMenu = (selection, selected) => {
    let select = selection.selectAll("select").data([null]);
    select = select.enter().append("select")
        .merge(select)
            .on("change", function () {
                if (selected === "year") {
                    selectYear = this.value;
                }
                else if (selected === "band") {
                    selectBand = this.value;
                }

                renderChart();
            });

    selected === "year" ? selectedOption = selectYear : selectedOption = selectBand;
    selected === "year" ? options = Year : options = Band;

    const option = select.selectAll("option").data(options);
    option.enter().append("option")
        .merge(option)
            .attr("value", d => d)
            .property("selected", d => d === selectedOption)
            .text(d => d);
};

const renderChart = () => {
    svg.selectAll("*").remove();

    d3.select("#selectYear").call(dropdownMenu, "year");
    d3.select("#selectBand").call(dropdownMenu, "band");

    let year = +selectYear;
    let band = +selectBand;

    d3.csv("http://vis.lab.djosix.com:2023/data/air-pollution.csv").then(function (data) {
        const filteredData = data.filter(d => d["Measurement date"].split("-")[0] == year);
        
        let transformedData = {};
        for (let i = 0; i < filteredData.length; i++) {
            var districtArray = filteredData[i]["Address"].split(",");
            var district = districtArray[2].trim();
            district = district.split("-")[0];

            if (!transformedData[district]) {
                transformedData[district] = {};
            }
            
            for (let j = 0; j < pollutants.length; j++) {
                var pollutant = pollutants[j];

                if (!transformedData[district][pollutant]) {
                    transformedData[district][pollutant] = {};
                }

                if (transformedData[district][pollutant][filteredData[i]["Measurement date"].split(" ")[0]]) {
                    transformedData[district][pollutant][filteredData[i]["Measurement date"].split(" ")[0]]
                        .push(Math.max(parseFloat(filteredData[i][pollutant]), 0.0)); 
                }
                else {
                    transformedData[district][pollutant][filteredData[i]["Measurement date"].split(" ")[0]] = [
                        Math.max(parseFloat(filteredData[i][pollutant]), 0.0)
                    ];
                }            
            }
        }
        
        let columns = 6;
        let cnt = 0; 
        
        for (let district in transformedData) { 
            svg.append("text")
                .attr("class", "text")
                .attr("x", margin)
                .attr("y", margin + interval * (cnt % 25) - 10)
                .attr("text-anchor", "left")
                .attr("dy", "0.35em")
                .attr("font-size", "16px")
                .text(`${district}`);

            for (let pollutant in transformedData[district]) { 
                let aggreatedData = [];
                for (let date in transformedData[district][pollutant]) { 
                    aggreatedData.push({
                        date: new Date(date),
                        value: d3.median(transformedData[district][pollutant][date])
                    });
                }

                const row = Math.floor(cnt / columns);
                const col = cnt % columns;
                
                const xScale = d3.scaleTime()
                    .domain([new Date(`${year}-01-01`), new Date(`${year}-12-31`)])
                    .range([0, (width - margin * 2) / 6]);
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", `translate(${margin + col * ((width - margin * 2 - colMargin * (columns-1)) / columns) + col * colMargin}, ${margin + interval * (row+1) - intervalMargin})`)
                    .call(d3.axisBottom(xScale).ticks(5))
                    .select(".domain").remove();

                const yScale = d3.scaleLinear()
                    .domain([0, pollutantDomains[pollutant] / band])
                    .range([interval - intervalMargin, 0]);
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", `translate(${margin + col *  ((width - margin *2) / columns) + col * colMargin}, ${margin + interval * row})`);

                for (let k = 0; k < band; k++) {
                    svg.append("path")
                        .attr("class", "path")
                        .datum(aggreatedData)
                        .attr("fill", bandColors[pollutant][k])
                        .attr("d", d3.area()
                            .x(function (d) { return xScale(d.date); })
                            .y0(yScale(0))
                            .y1(function (d) { return yScale(Math.min(Math.max(d.value - pollutantDomains[pollutant] / band * k, 0), pollutantDomains[pollutant] / band)); })
                        )
                        .attr("transform", `translate(${margin + col * ((width - margin * 2 - colMargin * (columns-1)) / columns) + col * colMargin}, ${margin + interval * row})`);
                }

                cnt++;
            }
        }

        // color legend
        const colorLegendG = svg.append("g")
            .attr("class", "color-legend")
            .attr("transform", `translate(${margin}, 0)`);

        const colorLegend =  colorLegendG.selectAll(".color-legend")
            .data(pollutants)
            .enter().append("g")
                .attr("class", "color-legend")
                .attr("transform", (d, i) => `translate(${i * 80}, 10)`);

        colorLegend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => bandColors[d][0]);

        colorLegend.append("text")
            .attr("class", "text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .attr("font-size", "12px")
            .text(d => d);
    });
    
}

renderChart();