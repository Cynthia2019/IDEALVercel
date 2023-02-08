import * as d3 from "d3";
import Header from "./header";

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

class Hist {
// Hist 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/splom
    constructor(data, container, legendContainer) {
        this.container = container;
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
                // z: d => d.species
                colors: data.color
            }, container);
    }

    render(data, {
        columns = data.columns, // array of column names, or accessor functions
        x = columns, // array of x-accessors
        y = columns, // array of y-accessors
        z = () => 1, // given d in data, returns the (categorical) z-value
        height = width, // outer height, in pixels
        xType = d3.scaleLinear, // the x-scale type
        yType = d3.scaleLinear, // the y-scale type
        zDomain, // array of z-values
        fillOpacity = 0.7, // opacity of the dots
        colors = d3.schemeCategory10, // array of colors for z
    } = {}, container) {
        const X = d3.map(x, x => d3.map(data, typeof x === "function" ? x : d => +d[x]));
        const Y = d3.map(y, y => d3.map(data, typeof y === "function" ? y : d => +d[y]));
        const Z = d3.map(data, z);

        // Compute default z-domain, and unique the z-domain.
        if (zDomain === undefined) zDomain = Z;
        zDomain = new d3.InternSet(zDomain);

        // Omit any data not present in the z-domain.
        const I = d3.range(Z.length).filter(i => zDomain.has(Z[i]));

        // Compute the inner dimensions of the cells.
        const cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding) / X.length;
        const cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding) / Y.length;

        // Construct scales and axes.
        const xScales = X.map(X => xType(d3.extent(X), [0, cellWidth]));
        const yScales = Y.map(Y => yType(d3.extent(Y), [cellHeight, 0]));
        const zScale = d3.scaleOrdinal(zDomain, colors);

        this.svg = d3
            .select(container.current)
            .append('svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-marginLeft, -marginTop, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        this.cell = this.svg.append("g")
            .selectAll("g")
            .data(d3.cross(d3.range(X.length), d3.range(Y.length)))
            .join("g")
            .attr("fill-opacity", fillOpacity)
            .attr("transform", `translate(${cellWidth + padding},${(cellHeight - 2 * marginBottom)})`);
    }
    update(data, {
               columns, // array of column names, or accessor functions
               x = columns, // array of x-accessors
               y = columns, // array of y-accessors
               z = () => 1, // given d in data, returns the (categorical) z-value
               height = width, // outer height, in pixels
               xType = d3.scaleLinear, // the x-scale type
               yType = d3.scaleLinear, // the y-scale type
               zDomain, // array of z-values
               fillOpacity = 0.7, // opacity of the dots
               colors = {}, // array of colors for z
           } = {}, container,
           legendContainer,
           setDataPoint,
           query1,
           max_num_datasets) {
        console.log("updating")
        //console.log(data)
        let index = columns.indexOf(query1)
        let datasets = [];
        let dataset_dic = {};
        for (let i = 0; i < max_num_datasets; i++) {
            datasets.push([])
        }
        data.map((d, i) => {
            for (let data of d.data) {
                data.name = d.name;
                data.color = d.color;
            }
            colors[d.name] = d.color;
            datasets[i] = (d.data) ? (d.data) : [];
            dataset_dic[i] = d.name;
        });
        let finalData = [].concat(...datasets);
        //clean up before updating visuals
        d3.selectAll(".xAxisGroup").remove();
        d3.selectAll(".yAxisGroup").remove();
        d3.selectAll(".x-label").remove();


        for (let i = 0; i < max_num_datasets; i++) {
            d3.selectAll(".group" + i).remove()
        }

        let tooltip_hist = d3
            .select(container.current)
            .append("div")
            .attr("class", "tooltip_hist")
            .style("position", "fixed")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("visibility", "hidden")



        let mouseleave_rec = function (e, d) {
            tooltip_hist.style("visibility", "hidden").transition().duration(200);
            d3.select(this)
                .style("stroke", "grey")
                .style("stroke-width", 0)
                .style("fill-opacity", 0.8);
        };

        let mouseover_hist = function (e, d) {
            console.log("hist");
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 5)
                .style("fill-opacity", 1);
            tooltip_hist.style("visibility", "visible").transition().duration(200);

        };

        let mousemove_hist = function (e, d) {
            // console.log('hist_tool_tip')
            // console.log(e)
            // console.log(d)
            // let column = columns[parseInt(d)]
            let temp_arr = [...finalData.map(data => data[columns[index]])]
            tooltip_hist
                .html(
                    "<br>Bar Range: " +
                    (d.x0) +
                    " to " +
                    (d.x1) +
                    "<br>Distribution Mean: " +
                    d3.mean(temp_arr) +
                    "<br>Distribution Median: " +
                    d3.median(temp_arr)

                    // "<br>symmetry: " +
                    // finalData[d]["symmetry"]
                    // "<br>Material_0: " +
                    // finalData[d].CM0 +
                    // "<br>Material_1: "
                    // d.CM1 +
                    // `<br>${query1}: ` +
                    // d[query1] +
                    // `<br>${query2}: ` +
                    // d[query2]
                )
                .style("top", e.pageY - 110 + "px")
                .style("left", e.pageX + 10 + "px");
        };

        // Compute values (and promote column names to accessors).
        const X = d3.map(x, x => d3.map(finalData, typeof x === "function" ? x : d => +d[x]));
        const Y = d3.map(y, y => d3.map(finalData, typeof y === "function" ? y : d => +d[y]));
        const Z = d3.map(finalData, z);

        // Compute default z-domain, and unique the z-domain.
        if (zDomain === undefined) zDomain = Z;
        zDomain = new d3.InternSet(zDomain);

        // Omit any data not present in the z-domain.
        const I = d3.range(Z.length).filter(i => zDomain.has(Z[i]));

        // Compute the inner dimensions of the cells.
        const cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding);
        const cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding);

        // Construct scales and axes.
        const xScales = X.map(X => xType(d3.extent(X), [0, cellWidth]));
        const yScales = Y.map(Y => yType(d3.extent(Y), [cellHeight, 0]));
        const zScale = d3.scaleOrdinal(zDomain, colors);

        let all_bins = [];

        this.cell.each(function ([x, y]) {
            if (x == index && y == index) {
                d3.select(this)
                    .append("g")
                    .attr("class", "x-label")
                    .attr("font-size", 20)
                    .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .selectAll("text")
                    .data([columns[index]])
                    .join("text")
                    .attr("transform", (d, i) => `translate(${cellWidth / 2 - marginLeft / 2},${cellHeight + marginBottom + padding})`)
                    .attr("x", padding / 2)
                    .attr("y", padding / 2)
                    .text(d => d);

                d3.select(this)
                    .append("g")
                    .attr("class", "y-label")
                    .attr("font-size", 20)
                    .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .selectAll("text")
                    .data(["Frequency"])
                    .join("text")
                    .attr("transform", `translate(${0 - marginLeft},${cellHeight / 2 + padding}) rotate(270)`)
                    .attr("x", padding / 2)
                    .attr("y", padding / 2)
                    .text(d => d);


                for (let i = 0; i < max_num_datasets; i++) {
                    let a = columns;
                    let b = columns;
                    let X0 = d3.map(a, a => d3.map(datasets[i], typeof a === "function" ? a : d => +d[a]));
                    let Y0 = d3.map(b, b => d3.map(datasets[i], typeof b === "function" ? b : d => +d[b]));
                    const Z = d3.map(datasets[i], z);

                    // Omit any data not present in the z-domain.
                    let I0 = d3.range(Z.length).filter(i => zDomain.has(Z[i]));
                    const thresholds = 40
                    Y0 = d3.map(Y0[index], () => 1);
                    const bins = d3.bin().thresholds(thresholds).value(i => X0[index][i])(I0);
                    all_bins.push(...bins);
                    const Y1 = Array.from(bins, I0 => d3.sum(I0, i => Y0[i]));

                    // Compute default domains.
                    const xDomain = [bins[0].x0, bins[bins.length - 1].x1];
                    const yDomain = [0, d3.max(Y1)];

                    // Construct scales and axes.
                    const xRange = [0, cellWidth];
                    const yRange = [cellHeight, 0];
                    const xScale = xType(xDomain, xRange);
                    const yScale = yType(yDomain, yRange);

                    const insetLeft = 0.5;
                    const insetRight = 0.5;

                    //when two dataset are selected, shows one color, but shows none when 1 or none are selected

                    if (datasets[i].length == 0) {
                        d3.selectAll(".group" + i)
                            .remove()
                    } else {
                        let histogram = d3.select(this)
                            .append("g")
                            .attr("class", "group" + i)
                        histogram
                            .selectAll("rect")
                            .data(bins)
                            .join("rect")
                            .attr("fill", colors[dataset_dic[i]])
                            .attr("x", d => xScale(d.x0) + insetLeft)
                            .attr("width", d => (bins.length == 1) ? 5 : Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight))
                            .attr("y", (d, i) => yScale(Y1[i]))
                            .attr("height", (d, i) => yScale(0) - yScale(Y1[i]))
                            .on("mouseover", mouseover_hist)
                            .on("mouseleave", mouseleave_rec)
                            .on("mousemove", mousemove_hist)

                        histogram.exit().remove();
                    }

                }

            }
        })

        //draw axis
        let max_bin_len = d3.max(all_bins, (b) => {
            return b.length;
        })
        const hist_yScales = d3.scaleLinear()
            .domain([0, max_bin_len])
            .range([cellHeight, 0]);
        const xAxis = d3.axisBottom().tickFormat((x) => `${expo(x, 0)}`).ticks(3);
        const yAxis = d3.axisLeft().ticks(3);

        let yAxis_line = this.svg
            .append("g")
            .selectAll("g")
            .data([hist_yScales])
            .join("g")
            .attr("transform", `translate(${marginLeft + padding * 2.2},${marginTop * 3.5})`)
            .attr("class", "yAxisGroup")
            .call(yAxis.scale(hist_yScales));


        yAxis_line
            .selectAll("text")
            .attr("font-size", 20)
            .attr("font-family", "sans-serif")


        let xAxis_line = this.svg
            .append("g")
            .selectAll(".xAxisGroup")
            .data(xScales)
            .join("g")
            .attr("transform", `translate(${marginBottom * 2.9}, ${cellHeight + padding * 1.8})`)
            .attr("class", "xAxisGroup")
            .call(xAxis.scale(xScales[index]))

        xAxis_line
            .selectAll("text")
            .attr("font-size", 18)
            .attr("font-family", "sans-serif")


    }

}


export default Hist;