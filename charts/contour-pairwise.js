import * as d3 from "d3";
import organizeByName from "@/util/organizeByName";

const padding = 20// separation between adjacent cells, in pixels
const marginTop = 10 // top margin, in pixels
const marginRight = 20 // right margin, in pixels
const marginBottom = 50 // bottom margin, in pixels
const marginLeft = 100 // left margin, in pixels
const width = 968 // outer width, in pixels
function expo(x, f) {
    if (x < 1000 && x > -1000) return x;
    return Number(x).toExponential(f);
}


class Contour {
    constructor(data, container, legendContainer) {
        this.isDarkMode = window?.matchMedia && window?.matchMedia('(prefers-color-scheme: dark)').matches;
        this.container = container;
        // Compute values (and promote column names to accessors)
        this.legend = d3
            .select(legendContainer)
            .append("svg")
            .attr("width", 120)
            .append("g")
            .attr("class", "contour-plot-legend");

        this.render(data,
            {
                columns: [
                    "C11",
                    "C12",
                    "C22",
                    "C16",
                    "C26",
                    "C66"
                ],
                colors: data.color
            }, container);
    }

    render(data, {
        columns = data.columns, // array of column names, or accessor functions
        x = columns, // array of x-accessors
        y = columns, // array of y-accessors
        height = width, // outer height, in pixels
        fillOpacity = 0.7, // opacity of the dots
    } = {}, container) {

        const X = d3.map(x, x => d3.map(data, typeof x === "function" ? x : d => +d[x]));
        const Y = d3.map(y, y => d3.map(data, typeof y === "function" ? y : d => +d[y]));

        // Compute the inner dimensions of the cells.
        const cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding) / X.length;
        const cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding) / Y.length;


        this.svg = d3
            .select(container.current)
            .append('svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-marginLeft, -marginTop, width, height])
            .attr("style", "outline: thin solid red;")
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        this.cell = this.svg.append("g")
            .selectAll("g")
            .data(d3.cross(d3.range(X.length), d3.range(Y.length)))
            .join("g")
            .attr("fill-opacity", fillOpacity)
            .attr("transform", ([i, j]) => `translate(${i * (cellWidth + padding)},${j * (cellHeight + padding)})`);


        //add rect box frames
        this.cell.append("rect")
            .attr("fill", "white")
            .attr("stroke", "grey")
            .attr("stroke-width", 2)
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("class", "cell");


        if (x === y) this.svg.append("g")
            .attr("font-size", 18)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .selectAll("text")
            .data(x)
            .join("text")
            .attr("transform", (d, i) => `translate(${0 - marginLeft + padding },${i * (cellHeight + padding) + marginTop * 9}) rotate(270)`)
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("dy", ".71em")
            .text(d => d);

        if (x === y) this.svg.append("g")
            .attr("font-size", 18)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .selectAll("text")
            .data(y)
            .join("text")
            .attr("transform", (d, i) => `translate(${i * (cellWidth + padding) + marginBottom - padding / 2},${cellHeight * 6 + marginBottom + padding * 4.5})`)
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .text(d => d);


    }

    renderAxis(data, {
        columns = data.columns, // array of column names, or accessor functions
        x = columns, // array of x-accessors
        y = columns, // array of y-accessors
        height = width, // outer height, in pixels
        xType = d3.scaleLinear, // the x-scale type
        yType = d3.scaleLinear, // the y-scale type
    } = {}, container) {
        const X = d3.map(x, x => d3.map(data, typeof x === "function" ? x : d => +d[x]));
        const Y = d3.map(y, y => d3.map(data, typeof y === "function" ? y : d => +d[y]));


        // Compute the inner dimensions of the cells.
        const cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding) / X.length;
        const cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding) / Y.length;

        // Construct scales and axes.
        const xScales = X.map(X => xType(d3.extent(X), [0, cellWidth]));
        const yScales = Y.map(Y => yType(d3.extent(Y), [cellHeight, 0]));
        const xAxis = d3.axisBottom().tickFormat((x) => `${expo(x, 0)}`).ticks(3);
        const yAxis = d3.axisLeft().tickFormat((x) => `${expo(x, 0)}`).ticks(3);

        this.svg
            .append("g")
            .selectAll("g")
            .data(yScales)
            .join("g")
            .attr("transform", (d, i) => `translate(0,${i * (cellHeight + padding)})`)
            .attr("class", "yAxisGroup")
            .style("font-size","14px")
            .each(function (yScale) {
                d3.select(this).call(yAxis.scale(yScale));
            })

        this.svg
            .append("g")
            .selectAll(".xAxisGroup")
            .data(xScales)
            .join("g")
            .attr("transform", (d, i) => `translate(${i * (cellWidth + padding)}, ${height - marginBottom - marginTop})`)
            .attr("class", "xAxisGroup")
            .style("font-size","14px")
            .each(function (xScale, columns) {
                d3.select(this).call(xAxis.scale(xScale))
            })
    }

    update(data, {
               columns = data.columns, // array of column names, or accessor functions
               x = columns, // array of x-accessors
               y = columns, // array of y-accessors
               z = () => 1, // given d in data, returns the (categorical) z-value
               height = width, // outer height, in pixels
               xType = d3.scaleLinear, // the x-scale type
               yType = d3.scaleLinear, // the y-scale type
               fillOpacity = 0.7, // opacity of the dots
               colors = {}, // array of colors for z
           } = {}, container,
           legendContainer,
           setDataPoint,
           router,
           max_num_datasets) {

        let datasets = [];
        let dataset_dic = {}
        for (let i = 0; i < max_num_datasets; i++) {
            datasets.push([])
        }
        let organizedData = organizeByName(data);
        organizedData.map((d, i) => {
            colors[d.name] = d.color;
            datasets[i] = (d.data) ? (d.data) : [];
            dataset_dic[i] = d.name;
        });

        let finalData = [].concat(...datasets);

        //clean up before updating visuals
        d3.selectAll(".xAxisGroup").remove();
        d3.selectAll(".yAxisGroup").remove();
        d3.selectAll(".legend").remove();
        d3.selectAll("contour").remove();

        for (let i = 0; i < max_num_datasets; i++) {
            d3.selectAll(".group" + i).remove()
        }
        this.renderAxis(finalData,
            {
                columns: [
                    "C11",
                    "C12",
                    "C22",
                    "C16",
                    "C26",
                    "C66"
                ],
                colors: data.color
            }, container);


        let mouseleave_rec = function (e, d) {
            d3.select(this)
                .style("fill", "white")
                .style("stroke", "grey")
                .style("stroke-width", 2)
                .style("fill-opacity", 0.8);

        };

        let mouseover_dist = function (e, d) {

            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 5)
                .style("fill-opacity", 1);

        };

        let mouseover_non_dist = function (e, d) {

            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 4)
                .style("fill-opacity", 1);
        };

        let mousedown_non_dist = function (e, d) {
            d3.select(container.current).remove()
            router.push({
                pathname: "/scatter",
                query: {
                    contour_query1 : x[d[0]],
                    contour_query2 : x[d[1]]
                }
            });

        }

        let mousedown_dist = function (e, d) {
            d3.select(container.current).remove()
            router.push({
                pathname: "/hist",
                query: {
                    contour_query1 : x[d[0]]
                }
            });

        }


        // Compute values (and promote column names to accessors).
        const X = d3.map(x, x => d3.map(finalData, typeof x === "function" ? x : d => +d[x]));
        const Y = d3.map(y, y => d3.map(finalData, typeof y === "function" ? y : d => +d[y]));


        // Compute the inner dimensions of the cells.
        const cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding) / X.length;
        const cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding) / Y.length;

        // Construct scales and axes.
        const xScales = X.map(X => xType(d3.extent(X), [0, cellWidth]));
        const yScales = Y.map(Y => yType(d3.extent(Y), [cellHeight, 0]));


        this.cell.each(function ([x, y]) {
            if (x != y) {
                d3.select(this)
                    .select(".cell")
                    .attr("class", "non_dist")
                    .on("mouseover", mouseover_non_dist)
                    .on("mousedown", mousedown_non_dist)
                    .on("mouseout", mouseleave_rec)

            } else {
                d3.select(this)
                    .selectAll(".cell")
                    .attr("class", "dist")
                    .on("mouseover", mouseover_dist)
                    .on("mouseleave", mouseleave_rec)
                    .on("mousedown", mousedown_dist)

                for (let i = 0; i < max_num_datasets; i++) {
                    let a = columns;
                    let b = columns;

                    let X0 = d3.map(a, a => d3.map(datasets[i], typeof a === "function" ? a : d => +d[a]));
                    let Y0 = d3.map(b, b => d3.map(datasets[i], typeof b === "function" ? b : d => +d[b]));

                    const thresholds = d3.range(4, 10, 1); 

                    // Compute default domains.
                    const xDomain = [d3.min(X0[i]), d3.max(X0[i])];
                    const yDomain = [d3.min(Y0[i]), d3.max(Y0[i])];
                    

                    // Construct scales and axes.
                    const xRange = [0, cellWidth];
                    const yRange = [cellHeight, 0];
                    const xScale = xType(xDomain, xRange);
                    const yScale = yType(yDomain, yRange);

                    const contours = d3.contourDensity()
                                        .thresholds(thresholds)
                                        .bandwidth(30) 
                                        .x(i => xScale(X0[x][i]))
                                        .y(i => yScale(Y0[y][i]))


                    //when two dataset are selected, shows one color, but shows none when 1 or none are selected

                    if (datasets[i].length == 0) {
                        d3.selectAll(".group" + i)
                            .remove()
                    } else {
                        let rect = d3.select(this)
                            .append("g")
                            .attr("class", "group" + i)
                        rect.append("g")
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-linejoin", "round")
                      .selectAll()
                      .data(contours)
                      .join("path")
                        .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 1)
                        .attr("d", d3.geoPath());
                        rect.exit().remove();
                    }

                }

            }
        })
        ;

    }

}


export default Contour;