import * as d3 from "d3";
import { nnColorAssignment } from "@/util/constants";

const circleOriginalSize = 5;
const circleFocusSize = 8;

const legendSpacing = 4;

const MARGIN = {
  TOP: 0,
  RIGHT: 50,
  BOTTOM: 20,
  LEFT: 50,
};

const SIDE_BAR_SIZE = 100;

const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT - SIDE_BAR_SIZE;
const HEIGHT = 700 - MARGIN.TOP - MARGIN.BOTTOM - SIDE_BAR_SIZE;

function expo(x, f) {
  if (x < 1000 && x > -1000) return x;
  return Number(x).toExponential(f);
}

function isBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
}

class Scatter {
  constructor(element, legendElement, data, view) {
    this.svg = d3
      .select(element)
      .append("svg")
      .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
      .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
      .attr("viewBox", [
        -MARGIN.LEFT,
        -MARGIN.TOP,
        WIDTH + MARGIN.LEFT + MARGIN.RIGHT,
        HEIGHT + MARGIN.TOP + MARGIN.BOTTOM,
      ])
      .attr("style", "max-width: 100%")
      .append("g")
      .attr("class", "scatter-plot-plot")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    //Legend
    this.legend = d3
        .select(legendElement)
        .append("svg")
        .attr("width", 120)
        .append("g")
        .attr("class", "scatter-plot-legend");

    // Labels
    this.xLabel = this.svg
      .append("text")
      .attr("x", WIDTH / 2)
      .attr("y", HEIGHT + 40)
      .attr("text-anchor", "middle")
      .style("fill", "black");

    this.yLabel = this.svg
      .append("text")
      .attr("x", -HEIGHT / 2)
      .attr("y", -80)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .style("fill", "black");

    // Append group el to display both axes
    this.xAxisGroup = this.svg
        .append("g")
        .attr("transform", `translate(0, ${HEIGHT})`);

    // Append group el to display both axes
    this.yAxisGroup = this.svg.append("g");
    this.xScale;
    this.yScale;
    this.zoomedXScale;
    this.zoomedYScale;


    this.update({
      data: data,
      element: element,
      legendElement: legendElement,
      query1: this.query1,
      query2: this.query2,
      view: view,
      reset: false,
    });
  }
  //query1: x-axis
  //query2: y-axis
  update({
    data,
    element,
    legendElement,
    setDataPoint,
    query1,
    query2,
    selectedData,
    setSelectedData,
    setNeighbors, 
    view,
    reset,
    setReset,
  }) {
    this.data = data;
    this.query1 = query1;
    this.query2 = query2;
    let datasets = data;
    

    let finalData = [].concat(...datasets);

    //remove elements to avoid repeated append
    d3.selectAll(".legend").remove();
    d3.select(".tooltip").remove();
    d3.selectAll(".dataCircle").remove();
    d3.selectAll("defs").remove();
    d3.selectAll(".rectZoom").remove();
    d3.selectAll(".clipPath").remove();

    let yScale = d3
        .scaleLinear()
        .domain([
          d3.min(finalData, (d) => d[query2]),
          d3.max(finalData, (d) => d[query2]),
        ])
        .range([HEIGHT, 0]);

    let xScale = d3
      .scaleLinear()
      .domain([
        d3.min(finalData, (d) => d[query1]),
        d3.max(finalData, (d) => d[query1]),
      ])
      .range([0, WIDTH]);
    if (reset || this.zoomedXScale === undefined) {
      this.xScale = xScale;
    } else {
      this.xScale = this.zoomedXScale;
    }
    if (reset || this.zoomedYScale === undefined) {
      this.yScale = yScale;
    } else {
      this.yScale = this.zoomedYScale;
    }

    // Add a clipPath: everything out of this area won't be drawn.
    this.svg
        .append("defs")
        .append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .attr("x", 0)
        .attr("y", 0);

    let xAxisCall = d3
        .axisBottom(this.xScale)
        .tickFormat((x) => `${expo(x, 2)}`);
    this.xAxisGroup.transition().duration(500).call(xAxisCall);

    let yAxisCall = d3.axisLeft(this.yScale).tickFormat((y) => `${expo(y, 2)}`);
    this.yAxisGroup.transition().duration(500).call(yAxisCall);
    this.xLabel.text(this.query1);
    this.yLabel.text(this.query2);

    let tooltip = d3
        .select(element)
        .append("div")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("visibility", "hidden");

    let mouseover = function (e, d) {
      console.log("mouseover")
      d3.select(this)
          .attr("r", circleFocusSize)
          .style("stroke", "black")
          .style("stroke-width", 2)
          .style("fill-opacity", 1);
      setDataPoint(d);
      tooltip.style("visibility", "visible").transition().duration(200);
    };

    let mousemove = function (e, d) {
      tooltip
          .html(
              "Dataset: " +
              d["name"] +
              "<br>symmetry: " +
              d["symmetry"] +
              "<br>Material_0: " +
              d.CM0 +
              "<br>Material_1: " +
              d.CM1 +
              `<br>${query1}: ` +
              d[query1] +
              `<br>${query2}: ` +
              d[query2]
          )
          .style("top", e.pageY + 10 + "px")
          .style("left", e.pageX + 10 + "px");
    };

    let mouseleave = function (e, d) {
      tooltip.style("visibility", "hidden").transition().duration(200);
      const circle = d3.select(this)
      d3.select(this)
        .attr("r", circle.classed("highlighted") ? circleFocusSize : circleOriginalSize)
        .style("stroke", "none")
        .style("stroke-width", 2)
        .style("fill-opacity", 0.8);
    };

    async function getKnnData(data) {
      const env = process.env.NODE_ENV
   //   let url= 'http://localhost:8000/model?data='
      let url = 'https://metamaterials-srv.northwestern.edu/model?data='
      if (env == 'production') {
        url = 'https://metamaterials-srv.northwestern.edu/model?data='
      }
      let response = await fetch(
        `${url}[${data}]`,
        {
          method: "GET",
          mode: "cors",
        }
      )
        .then((res) => res.json())
        .catch((err) => console.log("fetch error", err.message));
      return response;
    }

    let mousedown = function (e, d) {
      let columns = ["C11", "C12", "C22", "C16", "C26", "C66"];
      let inputData = columns.map((c) => d[c]);
      let target = d3.select(this);
      if (view == "brush-on") {
        target.classed("selected", true);
      } else if (view == "brush-off") {
        target.classed("selected", false);
      }

      let selected = [];
      d3.selectAll(".selected").each((d, i) => selected.push(d));
      setSelectedData(selected);


      if (view == 'neighbor') {
        target.classed("selected", true);
        getKnnData(inputData).then((data) => {
          console.log("get knn data")
          let indices = data.indices
          let distances = data.distances
          d3.selectAll(".dataCircle")
            .data(finalData)
            .classed("highlighted", function (datum) {
              return indices.includes(datum.index);
            })
            .classed("masked", function (datum) {
              return !(indices.includes(datum.index));
            });

            let neighborElements = d3.selectAll('.highlighted')
            let masked = d3.selectAll('.masked')
            masked.attr('fill', d => d.color).attr('r', circleOriginalSize).classed('selected', false)
      
            let neighbors = [];
            neighborElements.each((d, i) => {
              d['outline_color'] = nnColorAssignment[i]
              console.log(d, indices.indexOf(d.index), d.index)
              d['distance'] = distances[indices.indexOf(d.index)]
              return neighbors.push(d)
            });
            neighbors.sort((a, b) => a.distance - b.distance)
            neighborElements.attr('fill', d => d.outline_color).attr('r', circleFocusSize)
            setNeighbors(neighbors);
        });
  
      }
    };
    let zoomedXScale = this.xScale;
    let zoomedYScale = this.yScale;

    // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
    let zoom = d3
      .zoom()
      .scaleExtent([0.1, 20]) // This control how much you can unzoom (x1) and zoom (x20)
      .extent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .on(
        "zoom",
        function (event) {
          // recover the new scale
          let newXScale = event.transform.rescaleX(this.xScale);
          let newYScale = event.transform.rescaleY(this.yScale);

          // update axes with these new boundaries
          let xAxisCall = d3
            .axisBottom(newXScale)
            .tickFormat((x) => `${expo(x, 2)}`);
          let yAxisCall = d3
            .axisLeft(newYScale)
            .tickFormat((y) => `${expo(y, 2)}`);
          this.xAxisGroup.transition().duration(500).call(xAxisCall);
          this.yAxisGroup.transition().duration(500).call(yAxisCall);

          d3.selectAll(".dataCircle")
            .data(finalData)
            .attr("cy", (d) => newYScale(d[query2]))
            .attr("cx", (d) => newXScale(d[query1]));

          zoomedXScale = newXScale;
          zoomedYScale = newYScale;
          this.zoomedXScale = newXScale;
          this.zoomedYScale = newYScale;
        }.bind(this)
      );


    this.xScale = zoomedXScale;
    this.yScale = zoomedYScale;

    let brush = d3
        .brush()
        .extent([
          [0, 0],
          [WIDTH, HEIGHT],
        ])
        .on(
            "start brush end",
            function brushed(event) {
              let xScale = this.xScale;
              let yScale = this.yScale;
              if (event.selection) {
                if (view == "brush-on") {
                  d3.selectAll(".dataCircle")
                      .data(finalData)
                      .classed("selected", function (d) {
                        return (
                            d3.select(this).classed("selected") ||
                            isBrushed(
                                event.selection,
                                xScale(d[query1]),
                                yScale(d[query2])
                            )
                        );
                      });
                } else if (view == "brush-off") {
                  d3.selectAll(".selected").classed("selected", function (d) {
                    return isBrushed(
                        event.selection,
                        xScale(d[query1]),
                        yScale(d[query2])
                    )
                        ? false
                        : true;
                  });
                }
                let selected = [];
                d3.selectAll(".selected").each((d, i) => selected.push(d));
                setSelectedData(selected);
              }
            }.bind(this)
        );

    let legend = this.legend.selectAll(".legend").data(data);

    legend.exit().remove();

    legend
        .enter()
        .append("circle")
        .attr("class", "legend")
        .attr("r", circleOriginalSize)
        .attr("cx", 10)
        .attr("cy", (d, i) => (circleOriginalSize * 2 + legendSpacing) * i + 30)
        .style("fill", (d) => d.color);
    //Create legend labels
    legend
        .enter()
        .append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", (d, i) => (circleOriginalSize * 2 + legendSpacing) * i + 30)
        .text((d) => d.name)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    legend.exit().remove();
    if (view === "brush-on" || view === "brush-off") {
      zoom.on("zoom", null);
      d3.selectAll(".rectZoom").remove();
      this.svg.call(brush);
    } else if (view === "zoom") {
      brush.on("start brush end", null);
      this.svg
          .append("rect")
          .attr("class", "rectZoom")
          .attr("width", WIDTH)
          .attr("height", HEIGHT)
          .call(zoom);
    }

    let circles = this.svg
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "clipPath")
        .selectAll(".dataCircle")
        .data(finalData);

    circles.exit().transition().attr("r", 0).remove();
    circles
        .enter()
        .append("circle")
        .join(circles)
        .attr("r", circleOriginalSize)
        .attr("class", "dataCircle")
        .attr("fill", (d) => d.color)
        .classed("selected", function (d) {
          return selectedData.includes(d);
        })
        .style("stroke", "none")
        .style("stroke-width", 2)
        .style("fill-opacity", 0.8)
        .on("mousedown", mousedown)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .attr("cx", (d) => this.xScale(d[query1]))
        .attr("cy", (d) => this.yScale(d[query2]));

    circles.exit().transition().attr("r", 0).remove();
    if (reset) {
      this.svg.call(zoom.transform, d3.zoomIdentity);
      d3.selectAll(".selected").classed("selected", false);
      setSelectedData([]);
      setReset(false);
    }
  }
}

export default Scatter;