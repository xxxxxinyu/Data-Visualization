d3.csv("http://vis.lab.djosix.com:2023/data/spotify_tracks.csv")
    .then(data => {
        data.forEach(d => {
            d.track_id = d.track_id;
            d.artists = d.artists;
            d.album_name = d.album_name;
            d.track_name = d.track_name;
            d.popularity = +d.popularity;
            d.duration_s = (+d.duration_ms) / 1000;
            d.explicit = d.explicit;
            d.danceability = +d.danceability;
            d.energy = +d.energy;
            d.key = +d.key;
            d.loudness = +d.loudness;
            d.mode = +d.mode;
            d.speechiness = +d.speechiness;
            d.acousticness = +d.acousticness;
            d.instrumentalness = +d.instrumentalness;
            d.liveness = +d.liveness;
            d.valence = +d.valence;
            d.tempo = +d.tempo;
            d.time_signature = +d.time_signature;
            d.track_genre = d.track_genre;
        })

        ParsedData = [...new Map(data.map(item => [item.track_id, item])).values()]
        genre = [...new Set(ParsedData.map(d => d.track_genre))].sort();
        
        DrawRadar(ParsedData);
        DrawBarChart(ParsedData);
    })

const Width = 1440;
const Height = 600;

const margin = { top: 40, right: 20, bottom: 20, left: 20 };

const innerWidth = Width - margin.left - margin.right;
const innerHeight = Height - margin.top - margin.bottom;

const padding = 50;
const centerX = 500 / 2;
const centerY = 500 / 2;
const radius = Math.min(centerX, centerY) - padding;

const svg = d3.select("body")
    .append("svg")
    .attr("width", Width)
    .attr("height", Height);

const radarGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const barChartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left + 650}, ${margin.top})`);

let ParsedData;
let genre;
let features = ["danceability", "energy", "popularity", "acousticness", "valence", "instrumentalness", "liveness", "speechiness", "tempo"];
let selectedGenre = "Select Genre...";
let selectedFeature = "Select Feature...";
let selectedOption;
let options;

const dropdownMenu = (selection, selected) => {
    let select = selection.selectAll("select").data([null]);
    select = select.enter().append("select")
        .merge(select)
            .on("change", function() {
                if (selected === "genre") {
                    selectedGenre = this.value;
                    DrawRadar(ParsedData);
                    DrawBarChart(ParsedData);
                } else if (selected === "feature") {
                    selectedFeature = this.value;
                    DrawBarChart(ParsedData);
                }
            });

    selected === "genre" 
        ? selectedOption = selectedGenre
        : selectedOption = selectedFeature;
    selected === "genre"
        ? options = genre
        : options = features;

    const option = select.selectAll("option").data([null, ...options]);
    option.enter().append("option")
        .merge(option)
        .attr("value", (d, i) => (i == 0 ? null : d))
        .property("selected", d => d === selectedOption)
        .text(d => {
            if (selected === "genre") {
                return d == null ? "Select Genre..." : d;
            } else if (selected === "feature") {
                return d == null ? "Select Feature..." : d;
            }
        });
};

const DrawRadar = data => {
    radarGroup.selectAll("*").remove();
    d3.select("#selectGenre").call(dropdownMenu, "genre");

    let selectedData = data.filter(d => d.track_genre == selectedGenre);
        let dataset = [
            { name: "danceability", value: d3.mean(selectedData, d => d.danceability * 100) },
            { name: "energy", value: d3.mean(selectedData, d => d.energy * 100) },
            { name: "popularity", value: d3.mean(selectedData, d => d.popularity) },
            { name: "acousticness", value: d3.mean(selectedData, d => d.acousticness * 100) },
            { name: "valence", value: d3.mean(selectedData, d => d.valence * 100) },
            { name: "instrumentalness", value: d3.mean(selectedData, d => d.instrumentalness * 100) },
        ];

    const angleScale = d3.scaleLinear()
        .domain([0, dataset.length])
        .range([0, Math.PI * 2]);

    const valueScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, radius]);

    const gradient = radarGroup.append("defs")
        .append("radialGradient")
            .attr("id", "gradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%")
            .attr("fx", "50%")
            .attr("fy", "50%");
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#F6EFA6")
        .attr("stop-opacity", 1);
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#69B3A2")
        .attr("stop-opacity", 1);

    const polygon = radarGroup.append("g")
        .attr("class", "polygon")

    const hexagon = polygon.append("polygon")
        .attr("points", function() {
            let points = "";
            for (let i = 0; i < dataset.length; i++) {
                let angle = angleScale(i);
                let x = centerX + valueScale(100) * Math.sin(angle);
                let y = centerY + valueScale(100) * Math.cos(angle);
                points += x + "," + y + " ";
            }
            return points;
        })
        .attr("stroke", "#f6efa6")
        .attr("stroke-width", 5)
        .attr("fill", "url(#gradient)");

    for(let i = 0; i < dataset.length; i++) {
        let angle = angleScale(i);
        let x = centerX + valueScale(100) * Math.sin(angle);
        let y = centerY + valueScale(100) * Math.cos(angle);
        polygon.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", "#f6efa6")
            .attr("stroke-width", 1);
    }

    let line = d3.line()
        .x(function(d, i) { return centerX + valueScale(d.value) * Math.sin(angleScale(i)); })
        .y(function(d, i) { return centerY + valueScale(d.value) * Math.cos(angleScale(i)); })
        .curve(d3.curveLinearClosed);

    if (selectedGenre == "Select Genre...") {
        return;
    }

    radarGroup.append("path")
        .datum(dataset.map(d => ({ name: d.name, value: 0 })))
        .attr("fill", "#ffffff")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("d", line);

    radarGroup.select("path")
        .datum(dataset)
        .transition()
        .duration(800)
        .attr("d", line);

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const dataPoints = radarGroup.append("g")
        .attr("class", "dataPoints");

    for (let i = 0; i < dataset.length; i++) {
        let angle = angleScale(i);
        let x = centerX + valueScale(dataset[i].value) * Math.sin(angle);
        let y = centerY + valueScale(dataset[i].value) * Math.cos(angle);

        dataPoints.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 6)
            .attr("fill", "#42A5B3")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", function() {
                const value = dataset[i].value;
                const Name = dataset[i].name.charAt(0).toUpperCase() + dataset[i].name.slice(1);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(Name + ": " + value.toFixed(2))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
    }

    const labels = radarGroup.append("g")
        .attr("class", "labels");

    for (let i = 0; i < dataset.length; i++) {
        let angle = angleScale(i);
        let r = radius + padding / 2;
        let x = centerX + r * Math.sin(angle);
        let y = centerY + r * Math.cos(angle);
        let Name = dataset[i].name.charAt(0).toUpperCase() + dataset[i].name.slice(1);
        labels.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("fill", "333333")
            .text(Name);
    }
};

const DrawBarChart = data => {
    barChartGroup.selectAll("*").remove();
    d3.select("#selectFeature").call(dropdownMenu, "feature");

    let selectedData = data.filter(d => d.track_genre == selectedGenre);

    if (selectedFeature == "Select Feature...") {
        selectedFeature = "popularity";
    }

    let sortData = d3.sort(selectedData, (a, b) => d3.descending(a[selectedFeature], b[selectedFeature]))

    const yValue = d => d[selectedFeature];
    
    const xScale = d3.scaleBand()
        .domain(sortData.map(d => d.track_name))
        .range([0, 650])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(sortData, yValue))
        .range([innerHeight, 0]);

    const yAxis = d3.axisLeft(yScale);

    barChartGroup.append("g")
        .attr("class", "yAxis")
        .call(yAxis);

    let yLabel = selectedFeature.charAt(0).toUpperCase() + selectedFeature.slice(1);

    barChartGroup.selectAll(".yAxisLabel")
        .data([null])
        .enter().append("text")
            .attr("class", "yAxisLabel")
            .attr("x", -innerHeight / 2)
            .attr("y", -margin.left - 30)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("fill", "#333")
            .text(yLabel);

    barChartGroup.selectAll("rect").data(sortData)
        .enter().append("rect")
            .attr("x", d => xScale(d.track_name))
            .attr("width", xScale.bandwidth())
            .attr("height", d => 0)
            .attr("fill", "#F6B656")
            .attr("stroke", "#F6B656")
            .attr("stroke-width", 2)
            .transition() 
                .duration(800)  
            .attr("y", d => yScale(d[selectedFeature]))
            .attr("height", d => innerHeight - yScale(d[selectedFeature]));

    barChartGroup.selectAll("rect")
        .on("mouseover",  function(event, d) {
            const durationMinutes = Math.floor(d.duration_s / 60);
            const durationSeconds = Math.floor(d.duration_s % 60);

            d3.select("#popupTitle").text(d.track_name);
            d3.select("#popupContent").html(
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Artist: " + d.artists + "</div>" +
                    "<div style='flex: 1;'>Album: " + d.album_name + "</div>" +
                "</div>" +
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Durations: " + durationMinutes +  ":" + durationSeconds + "</div>" +
                    "<div style='flex: 1;'>Popularity: " + d.popularity + "</div>" +
                "</div>" + 
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Danceability: " + d.danceability + "</div>" +
                    "<div style='flex: 1;'>Energy: " + d.energy + "</div>" +
                "</div>" + 
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Key: " + d.key + "</div>" +
                    "<div style='flex: 1;'>Loudness(dB): " + d.loudness + "</div>" +
                "</div>" + 
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Mode: " + (d.mode == 0 ? "Major": "Minor") + "</div>" +
                    "<div style='flex: 1;'>Speechiness: " + d.speechiness + "</div>" +
                "</div>" + 
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Acousticness: " + d.acousticness + "</div>" +
                    "<div style='flex: 1;'>Instrumentalness: " + d.instrumentalness + "</div>" +
                "</div>" + 
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Liveness: " + d.liveness + "</div>" +
                    "<div style='flex: 1;'>Valence: " + d.valence + "</div>" +
                "</div>" + 
                "<div style='display: flex; flex-direction: row;'>" +
                    "<div style='flex: 1;'>Tempo(BPM): " + Math.floor(d.tempo) + "</div>" +
                    "<div style='flex: 1;'>Time Signature: " + d.time_signature + "</div>" +
                "</div>");

            d3.select("#popup")
                .style("display", "block")
                .style("width", "600px")
                .style("left", 700 + "px")
                .style("top", 150 + "px");
        });

    const closeBotton = d3.select("#popupClose");
    closeBotton.on("click", function() {
        d3.select("#popup").style("display", "none");
    });
        
};


