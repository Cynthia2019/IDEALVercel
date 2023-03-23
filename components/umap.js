import * as d3 from 'd3';
const SIZE = 600;

const MARGIN = {
    TOP: 50,
    RIGHT: 20,
    BOTTOM: 50,
    LEFT: 100,
};
const WIDTH = SIZE - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = SIZE - MARGIN.TOP - MARGIN.BOTTOM;
class Umap {
    constructor(container, data) {
        this.container = container;
        this.update(data);
    }

    update(data) {
        console.log(data)
        let datasets = [];
        let element = this.container;
        data.map((d, i) => {
            for (let data of d.data) {
                data.name = d.name;
                data.color = d.color;
            }
            datasets.push(d.data);
        });


        let finalData = [].concat(...datasets);

        const x = d3.scaleLinear().range([0, WIDTH]);
        const y = d3.scaleLinear().range([HEIGHT, 0]);

        d3.selectAll(".dot").remove();
        d3.selectAll(".g").remove();
        // d3.select(legendElement).selectAll(".legend").remove();
        d3.selectAll(".dataCircle").remove();
        // const svg = d3
        //     .select(element)
        //     .append("svg")
        //     .attr("width", width + margin.LEFT + margin.RIGHT)
        //     .attr("height", height + margin.TOP + margin.BOTTOM)
        //     .attr("viewBox", [-margin.LEFT, -margin.TOP, width + margin.LEFT + margin.RIGHT, height + margin.TOP + margin.BOTTOM])
        //     .attr("style", "max-width: 100%")
        //     .append("g")
        //     .attr("class", "umap-plot")
        //     .attr("transform", `translate(${margin.LEFT}, ${margin.TOP})`);
        let svg = d3
            .select(element)
            .append("svg")
            .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
            .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
            .append("g")
            .attr("class", "scatter-plot-plot")
            .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

        // x.domain([
        //     d3.min([data1, data2], (d) => d3.min(d, (i) => +i.x)),
        //     d3.max([data1, data2], (d) => d3.max(d, (i) => +i.x)),
        // ]);
        // y.domain([
        //     d3.min([data1, data2], (d) => d3.min(d, (i) => +i.y)),
        //     d3.max([data1, data2], (d) => d3.max(d, (i) => +i.y)),
        // ]);

        x.domain([
            d3.min(finalData, (d) => d.x),
            d3.max(finalData, (d) => d.x),
        ]);

        y.domain([
            d3.min(finalData, (d) => d.y),
            d3.max(finalData, (d) => d.y),
        ]);

        let circles = svg
            .append("g")
            .selectAll(".dataCircle")
            .data(finalData);

        circles.exit().transition().attr("r", 0).remove();

        circles
            .enter()
            .append("circle")
            .join(circles)
            .attr("r", 5)
            .attr("class", "dataCircle")
            .attr("fill", (d) => d.color)
            .style("stroke", "none")
            .style("stroke-width", 2)
            .style("fill-opacity", 0.8)
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y));

        circles.exit().transition().attr("r", 0).remove();

        // svg
        //     .selectAll('.dot')
        //     .data(data1)
        //     .enter()
        //     .append('circle')
        //     .attr('class', 'dot')
        //     .attr('r', 3.5)
        //     .attr('cx', (d) => x(+d.x))
        //     .attr('cy', (d) => y(+d.y))
        //     .style('fill', 'red');
        //
        //
        // svg
        //     .selectAll('.dot')
        //     .data(data2)
        //     .enter()
        //     .append('circle')
        //     .attr('class', 'dot')
        //     .attr('r', 3.5)
        //     .attr('cx', (d) => x(+d.x))
        //     .attr('cy', (d) => y(+d.y))
        //     .style('fill', 'blue');
        //
        svg
            .append('g')
            .attr('transform', `translate(0,${HEIGHT})`)
            .call(d3.axisBottom(x));

        svg.append('g').call(d3.axisLeft(y));

        // return <div id="umap" />;
    }

}

export default Umap;