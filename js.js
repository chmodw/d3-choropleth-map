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

    let path = d3.geoPath();
    let xScale = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);
    let colorScale = d3
      .scaleThreshold()
      .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
      .range(d3.schemeGreens[9]);

    chart.append("g").attr("transform", "translate(610,20)");
    // .append(() => legend({ colorScale, title: data.title, width: 260 }));

    chart
      .append("g")
      .selectAll("path")
      .data(topojson.feature(counties, counties.objects.counties).features)
      .join("path")
      .attr("fill", (d) => colorScale(educationData.id))
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
