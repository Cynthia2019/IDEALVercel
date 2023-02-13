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
    console.log(data)
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
      .append("g")
      .attr("transform", `translate(${marginLeft}, ${marginTop})`);
    
    this.svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (marginTop / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("font-family", 'Arial, sans-serif')
      .text("Unit Cell Geometry");

    this.svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", height + marginTop )
      .attr("class", "volumn-ratio")
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("font-family", 'Arial, sans-serif')
    
    this.update(data);
  }
  update(data) {
    this.data = data.geometry
    this.color = data.outline_color
    let height = data.height ? data.height : HEIGHT
    let width = data.width ? data.width : WIDTH
    let marginLeft = data.marginLeft ? data.marginLeft : MARGIN.LEFT
    let marginTop = data.marginTop ? data.marginTop : MARGIN.TOP
    let res = []
    res = this.pixelate(this.data, this.color);
    const yScale = d3.scaleLinear().domain([0, 50]).range([height, 0]);

    const xScale = d3.scaleLinear().domain([0, 50]).range([0, width]);

    const size = (width + marginLeft * 2) / 50; 


    let ratio = this.calculateRatio(this.data, data.color)
    const volumn_ratio = this.svg.select(".volumn-ratio")
  
    this.svg.select(".volumn-ratio").text(`Volumn Ratio: ${ratio}`);


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
    for (let i = 0; i < xSquares; i++) {
      for (let j = 0; j < ySquares; j++) {
        d.push({
          x: i,
          y: j,
          fill: data[i * xSquares + j] == "0" ? "white" : color,
        });
      }
    }
    return d;
  }
}

export default Structure;
