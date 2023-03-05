import * as d3 from "d3";
const MARGIN = {
  TOP: 30,
  RIGHT: 30,
  BOTTOM: 30,
  LEFT: 30,
};
const SIDE = 200; 
const WIDTH = SIDE - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = SIDE - MARGIN.TOP - MARGIN.BOTTOM;

class Structure {
  constructor(element, data) {
    this.svg = d3
      .select(element)
      .append("svg")
      .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
      .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
      .attr("viewBox", [0, 0,  WIDTH + MARGIN.LEFT + MARGIN.RIGHT, HEIGHT + MARGIN.TOP + MARGIN.BOTTOM])
      .style("z-index", 10)
      .style("margin-top", "30px")
      .append("g")
      .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.RIGHT})`);
    
    this.svg.append("text")
      .attr("x", (WIDTH / 2))             
      .attr("y", 0 - (MARGIN.TOP / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("font-family", 'Arial, sans-serif')
      .text("Unit Cell Geometry");

    
      this.svg.append("text")
      .attr("x", (WIDTH / 2))             
      .attr("y", HEIGHT + MARGIN.TOP )
      .attr("class", "volumn-ratio")
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("font-family", 'Arial, sans-serif')
    this.update(data);
  }
  update(data) {
    this.data = data?.geometry
    let res = []
    res = this.pixelate(this.data);
    const yScale = d3.scaleLinear().domain([0, 50]).range([HEIGHT, 0]);

    const xScale = d3.scaleLinear().domain([0, 50]).range([0, WIDTH]);

    const size = SIDE / 50; 

    let ratio = this.calculateRatio(this.data)
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

  pixelate(data) {
    if(!data) return [];
    const xSquares = 50;
    const ySquares = 50;
    let d = [];
    for (let i = 0; i < xSquares; i++) {
      for (let j = 0; j < ySquares; j++) {
        d.push({
          x: i,
          y: j,
          fill: data[i * xSquares + j] == "0" ? "white" : "black",
        });
      }
    }
    return d;
  }
}

export default Structure;
