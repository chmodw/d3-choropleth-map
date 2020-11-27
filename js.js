const margin = { top: 50, right: 70, bottom: 50, left: 80 };
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const chart = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
// .append("g")
// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
    let xScale = d3
      .scaleLinear()
      .domain([eduMin, eduMax])
      .rangeRound([width, height]);

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

    // chart
    //   .append("g")
    //   .attr("class", "counties")
    //   .selectAll("path")
    //   .data(topojson.feature(counties, counties.objects.counties).features)
    //   .enter()
    //   .append("path")
    //   .attr("class", "county")
    //   .attr("data-fips", (d) => d.id)
    //   .attr("data-education", function (d) {
    //     var result = educationData.filter(function (obj) {
    //       return obj.fips === d.id;
    //     });
    //     if (result[0]) {
    //       return result[0].bachelorsOrHigher;
    //     }
    //     // could not find a matching fips id in the data
    //     console.log("could find data for: ", d.id);
    //     return 0;
    //   })
    //   .attr("fill", function (d) {
    //     var result = educationData.filter(function (obj) {
    //       return obj.fips === d.id;
    //     });
    //     if (result[0]) {
    //       return colorScale(result[0].bachelorsOrHigher);
    //     }
    //     // could not find a matching fips id in the data
    //     return colorScale(0);
    //   });

    chart
      .append("path")
      .datum(
        topojson.mesh(counties, counties.objects.states, (a, b) => a !== b)
      )
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);
  })
  .catch((error) => {
    if (error) throw error;
  });
