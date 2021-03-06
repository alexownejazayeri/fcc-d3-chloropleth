// Exploring the dataset
const req = new XMLHttpRequest();
req.open("GET", 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json', true);
req.send();
req.onload = function () {
  const json = JSON.parse(req.responseText);
  const bachelors = json.map(d => d["bachelorsOrHigher"]);

  let tooltip = d3.select("#viz").append("div").attr("class", "toolTip").attr("id", "tooltip");


  //Min and max pct. bachelors
  const minBachelors = d3.min(bachelors);
  const maxBachelors = d3.max(bachelors);

  //Height and width constants for SVG area
  const h = 750;
  const w = 1000;

  const padding = 50;
  //Set color scheme with d3-scale-chromatic
  const scheme = d3.schemeBlues[9]; //max k is 9, chose this for greatest color variety

  //Adding SVG to <div id="viz">
  const svg = d3.select('#viz').
  append('svg').
  attr('height', h).
  attr('width', w);

  const path = d3.geoPath();

  const pcts = d3.range(minBachelors, maxBachelors);

  //Mapping bachelors pcts. to colors in purple range
  let color = d3.scaleThreshold().
  domain(d3.range(minBachelors, maxBachelors,
  (maxBachelors - minBachelors) / 9)) //Set step-size to 9 to match "k" above
  .range(scheme);

  //Took inspiration from this chloropleth
  //https://bl.ocks.org/mbostock/4060606

  d3.queue().
  defer(d3.json //sends http request to the url to load .json file and executes callback with parse json data objects
  , 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json' //County url containing topological US County data
  ).
  defer(d3.json,
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json').

  await(ready);

  function ready(error, counties, education) {
    if (error) {
      throw error;
    }

    svg.
    append('g').
    selectAll('path').
    data(topojson //https://github.com/topojson/topojson-client
    .feature(counties, counties.objects.counties).features).
    enter().
    append('path').
    attr("data-fips", d => {
      let arr = education.filter(item => item.fips === d['id']);
      return arr[0]['fips'];
    }).
    attr("data-education", d => {
      let arr = education.filter(item => item.fips === d['id']);
      return arr[0]['bachelorsOrHigher'];
    }).
    attr('fill', d => {
      //Iterating over education getting the corresponding data
      //point in counties to pull input for color()
      let arr = education.filter(item => item.fips === d['id']);
      return color(arr[0]['bachelorsOrHigher']);
    }).
    attr("class", "county").
    attr('d', path).
    attr("id", "county");

    svg.
    append('path').
    datum(
    topojson.mesh(counties, counties.objects.states, (a, b) => a !== b)).

    attr('class', 'states').
    attr('d', path);

    svg.selectAll("#county").
    on("mouseover", function (d) {
      let arr = education.filter(items => d['id'] === items['fips']);
      let info = arr[0]['state'] + "<br>" + arr[0]['bachelorsOrHigher'] + "%" + "<br>" + arr[0]['area_name'];
      tooltip.
      style("opacity", "0.95").
      attr('fill', 'yellowgreen').
      attr("data-education", arr[0]['bachelorsOrHigher']).
      html(info);
    }).
    on("mousemove", function (d) {
      tooltip.
      style("left", d3.event.pageX + 10 + "px").
      style("top", d3.event.pageY - 100 + "px");
    }).
    on("mouseout", d => tooltip.style("opacity", "0"));

    svg.append("g").
    attr("id", "legend").
    append("rect").
    attr("x", padding).
    attr("y", h - padding + 25).
    style("fill", "transparent").
    attr("height", "42").
    attr("width", "260");
    svg.select("#legend").
    append("rect").
    attr("x", padding + 15).
    attr("y", h - padding).
    attr("height", "25").
    attr("width", "30").
    style("fill", color(minBachelors));
    svg.select("#legend").
    append("text").
    attr("x", padding + 18).
    attr("y", h - padding + 35).
    text(minBachelors).
    style("font-size", "10px").
    attr("alignment-baseline", "middle");
    svg.select("#legend").
    append("rect").
    attr("x", padding + 45).
    attr("y", h - padding).
    attr("height", "25").
    attr("width", "30").
    style("fill", color(minBachelors + (maxBachelors - minBachelors) / 4));
    svg.append("g").
    append("text").
    attr("x", padding + 48).
    attr("y", h - padding + 35).
    text((minBachelors + (maxBachelors - minBachelors) / 4).toFixed(1)).
    style("font-size", "10px").
    attr("alignment-baseline", "middle");
    svg.select("#legend").
    append("rect").
    attr("x", padding + 75).
    attr("y", h - padding).
    attr("height", "25").
    attr("width", "30").
    style("fill", color(minBachelors + 2 * (maxBachelors - minBachelors) / 4));
    svg.append("g").
    append("text").
    attr("x", padding + 79).
    attr("y", h - padding + 35).
    text((minBachelors + 2 * (maxBachelors - minBachelors) / 4).toFixed(1)).
    style("font-size", "10px").
    attr("alignment-baseline", "middle");
    svg.select("#legend").
    append("rect").
    attr("x", padding + 105).
    attr("y", h - padding).
    attr("height", "25").
    attr("width", "30").
    style("fill", color(maxBachelors));
    svg.append("g").
    append("text").
    attr("x", padding + 108).
    attr("y", h - padding + 35).
    text(maxBachelors).
    style("font-size", "10px").
    attr("alignment-baseline", "middle");


  }};