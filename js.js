const margin = { top: 50, right: 70, bottom: 50, left: 80 };
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const chart = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + 50);

Promise.all([
  d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  ),
  d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  ),
])
  .then((data) => {
    const counties = data[0];
    const educationData = data[1];

    const eduMin = d3.min(educationData.map((item) => item.bachelorsOrHigher));
    const eduMax = d3.max(educationData.map((item) => item.bachelorsOrHigher));

    let path = d3.geoPath();

    // generating the color band
    const colorScale = d3
      .scaleThreshold()
      .domain(
        ((min, max, count) => {
          let array = [];
          let step = (max - min) / count;
          let base = min;
          for (let i = 1; i < count; i++) {
            array.push(base + i * step);
          }
          return array;
        })(eduMin, eduMax, colorbrewer.Greens[9].length)
      )
      .range(colorbrewer.Greens[9].reverse());
    chart.append("g");

    // generating the map
    chart
      .append("g")
      .selectAll("path")
      .data(topojson.feature(counties, counties.objects.counties).features)
      .join("path")
      .attr("fill", (d) => {
        var result = educationData.filter(function (obj) {
          return obj.fips === d.id;
        });
        if (result[0]) {
          return colorScale(result[0].bachelorsOrHigher);
        }
        // could not find a matching fips id in the data
        return colorScale(0);
      })
      .attr("d", path);

    // adding the state lines
    chart
      .append("path")
      .datum(
        topojson.mesh(counties, counties.objects.states, (a, b) => a !== b)
      )
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

    // creating the legend
    const legendX = d3.scaleLinear().domain([eduMin, eduMax]).range([0, 300]);

    const legendXAxis = d3
      .axisBottom()
      .scale(legendX)
      .tickSize(15, 0)
      .tickValues(colorScale.domain())
      .tickFormat(d3.format(".1f"));

    let legend = d3.select("#legend");

    legend
      .selectAll("rect")
      .data(
        colorScale.range().map(function (color) {
          let d = colorScale.invertExtent(color);
          if (d[0] == null) d[0] = legendX.domain()[0];
          if (d[1] == null) d[1] = legendX.domain()[1];
          return d;
        })
      )
      .enter()
      .insert("rect", ".tick")
      .attr("height", 10)
      .attr("x", (d) => legendX(d[0]))
      .attr("width", (d) => legendX(d[1]) - legendX(d[0]))
      .attr("fill", (d) => colorScale(d[0]));

    legend.append("g").call(legendXAxis);
  })
  .catch((error) => {
    if (error) throw error;
  });
