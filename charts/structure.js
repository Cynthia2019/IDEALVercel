import * as d3 from "d3";

const MARGIN = {
  TOP: 30,
  RIGHT: 30,
  BOTTOM: 30,
  LEFT: 30,
};
const SIDE = 230; 
const WIDTH = SIDE - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = SIDE - MARGIN.TOP - MARGIN.BOTTOM;

class Structure {
  constructor(element, data) {
    this.isDarkMode = data.isDarkMode ?? (window?.matchMedia && window?.matchMedia('(prefers-color-scheme: dark)').matches);

    let height = data.height ? data.height : HEIGHT
    let width = data.width ? data.width : WIDTH
    let marginLeft = data.marginLeft ? data.marginLeft : MARGIN.LEFT
    let marginTop = data.marginTop ? data.marginTop : MARGIN.TOP
    this.svg = d3
      .select(element)
      .append("svg")
      .attr("width", width + marginLeft * 2)
      .attr("height", height + marginTop * 2)
      .attr("viewBox", [0, 0,  width + marginLeft * 2, height + marginTop*2])
      .style("z-index", 10)
      .style("margin-top", "30px")
      .style("background-color", "white")
      .append("g")
        .attr("transform", `translate(${marginLeft}, ${marginTop})`);

    this.svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (marginTop / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", data.fontSize ? data.fontSize : "16px") 
      .style("font-family", 'Arial, sans-serif')
      .style("font-weight", 700)
      .text("Unit Cell Geometry")


    this.svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", height + marginTop - 10 )
      .attr("class", "volume-fraction")
      .attr("text-anchor", "middle")  
      .style("font-size", data.fontSize ? data.fontSize : "16px") 
      .style("font-family", 'Arial, sans-serif')
    
    this.update({
      data, 
      element,
    });
  }
  update({data, element}) {
    this.data = data.geometry
    this.color = data.outline_color
    let height = data.height ? data.height : HEIGHT
    let width = data.width ? data.width : WIDTH
    let marginLeft = data.marginLeft ? data.marginLeft : MARGIN.LEFT
    let res = []
    res = this.pixelate(this.data, this.color);
    const yScale = d3.scaleLinear().domain([0, 50]).range([height, 0]);

    const xScale = d3.scaleLinear().domain([0, 50]).range([0, width]);

    const size = (width + marginLeft * 2) / 50; 


    let ratio = this.calculateRatio(this.data)
    this.svg.select(".volume-fraction").text(`Volume Fraction: ${ratio}`).style("color", this.isDarkMode ? "white" : "black");

    d3.select(".tooltip-structure").remove();

    const pixels = this.svg.selectAll("rect").data(res);
    pixels
      .enter()
      .append("rect")
      .merge(pixels)
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y))
      .attr("width", size)
      .attr("height", size)
      .attr("fill", (d) => d.fill);

    pixels.exit().remove();

    const tooltip = d3
    .select(element)
    .append("div")
    .attr("class", "tooltip-structure")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("visibility", "hidden")
  
    tooltip.exit().remove();

    let mouseover = function (event, d) {
      tooltip.style("visibility", "visible");
    }
    let mousemove = function (event, d) {
      tooltip
        .html(`(${data['CM0'] || 'N/A'}, ${data['CM1'] || 'N/A'})`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
      this.isDarkMode ?? tooltip.style("color", "black");
    }
    let mouseleave = function (event, d) {
      tooltip.style("visibility", "hidden");
    }
    this.svg.on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
  
  }

  calculateRatio(data) {
    if(!data) return 0;
    let count_1 = 0; 
    const xSquares = 50;
    const ySquares = 50;
    let d = [];
    for (let i = 0; i < xSquares; i++) {
      for (let j = 0; j < ySquares; j++) {
        if (data[i * xSquares + j] == '1') count_1++;  
      }
    }
    return (count_1/(xSquares * ySquares)).toFixed(2)
  }
  
  pixelate(data, color) {
    if(!data) return [];
    const xSquares = 50;
    const ySquares = 50;
    let d = [];
    const background = this.isDarkMode ? color : "white"
    const pixelColor = this.isDarkMode ? "white" : color
    for (let i = 0; i < xSquares; i++) {
      for (let j = 0; j < ySquares; j++) {
        d.push({
          x: i,
          y: j,
          fill: data[i * xSquares + j] == "0" ? background : pixelColor,
        });
      }
    }
    return d;
  }
}

export default Structure;
