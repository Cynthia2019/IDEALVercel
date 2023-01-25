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
        // Compute values (and promote column names to accessors)
        this.legend = d3
            .select(legendContainer)
            .append("svg")
            .attr("width", 120)
            .append("g")
            .attr("class", "pairwise-plot-legend");

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

        // let datasets = [];
        //
        // data.map((d, i) => {
        //     for (let data of d.data) {
        //         data.name = d.name;
        //         data.color = d.color;
        //     }
        //     datasets.push(d.data);
        // });
        //
        // let finalData = [].concat(...datasets);
        // Compute values (and promote column names to accessors).
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
            .attr("transform", ([i, j]) => `translate(${i * (cellWidth + padding)},${j * (cellHeight + padding)})`);

        //add rect box frames
        // this.cell.append("rect")
        //     .attr("fill", "none")
        //     .attr("stroke", "grey")
        //     .attr("stroke-width", 2)
        //     .attr("width", cellWidth)
        //     .attr("height", cellHeight)
        //     .attr("class", "cell")


        if (x === y) this.svg.append("g")
            .attr("font-size", 20)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .selectAll("text")
            .data([x[0]])
            .join("text")
            .attr("transform", (d, i) => `translate(${0 - marginLeft + padding * 1.5},${cellHeight * 2 + padding + marginTop * 9}) rotate(270)`)
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("dy", ".71em")
            .text(d => d);

        if (x === y) this.svg.append("g")
            .attr("font-size", 20)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .selectAll("text")
            .data([x[0]])
            .join("text")
            .attr("transform", (d, i) => `translate(${cellHeight + marginLeft + padding * 4},${cellHeight * 6 + marginBottom + padding * 2})`)
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .text(d => d);

    }

    renderAxis(data, {
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
        const cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding)
        const cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding)

        // Construct scales and axes.
        const xScales = X.map(X => xType(d3.extent(X), [0, cellWidth]));
        const yScales = Y.map(Y => yType(d3.extent(Y), [cellHeight, 0]));
        const zScale = d3.scaleOrdinal(zDomain, colors);
        const xAxis = d3.axisBottom().tickFormat((x) => `${expo(x, 0)}`).ticks(3);
        const yAxis = d3.axisLeft().tickFormat((x) => `${expo(x, 0)}`).ticks(3);

        console.log('scales')
        console.log(yScales)
        this.svg
            .append("g")
            .selectAll("g")
            .data(yScales)
            .join("g")
            .attr("transform", (d, i) => `translate(0,${i * (cellHeight)})`)
            .attr("class", "yAxisGroup")
            .call(yAxis.scale(yScales[0]));


        this.svg
            .append("g")
            .selectAll(".xAxisGroup")
            .data(xScales)
            .join("g")
            .attr("transform", (d, i) => `translate(${i * (cellWidth + padding)}, ${height - marginBottom + marginTop})`)
            .attr("class", "xAxisGroup")
            .call(xAxis.scale(xScales[0]))

    }

    update(data, {
               columns = data.columns, // array of column names, or accessor functions
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
           setDataPoint) {
        console.log("updating...");

        const circleFocusSize = 7;
        const circleSize = 3.5;
        const legendCircleSize = 5.0;
        const legendSpacing = 4;
        let datasets = [[], []];
        let dataset_dic = {}
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
        console.log("datasets")
        console.log(datasets)
        console.log("final")
        console.log(finalData)
        //clean up before updating visuals
        d3.selectAll(".xAxisGroup").remove();
        d3.selectAll(".yAxisGroup").remove();
        d3.selectAll(".legend").remove();
        d3.selectAll("circle").remove();
        d3.selectAll(".tooltip_circ").remove();

        for (let i = 0; i < 2; i++) {
            d3.selectAll(".group" + i).remove()
        }
        // this.renderAxis(finalData,
        //     {
        //         columns: [
        //             "C11",
        //             "C12",
        //             "C22",
        //             "C16",
        //             "C26",
        //             "C66"
        //         ],
        //         // z: d => d.species
        //         colors: data.color
        //     }, container);

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

        let tooltip_circ = d3
            .select(container.current)
            .append("div")
            .attr("class", "tooltip_circ")
            .style("position", "fixed")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("visibility", "hidden")

        let mouseover_circ = function (e, d) {
            d3.select(this)
                .attr("r", circleFocusSize)
                .style("stroke", "black")
                .style("stroke-width", 2)
                .style("fill-opacity", 1);
            setDataPoint(finalData[d]);
            tooltip_circ.style("visibility", "visible").transition().duration(200);
        };


        let mouseleave_circ = function (e, d) {
            tooltip_circ.style("visibility", "hidden").transition().duration(200);
            d3.select(this)
                .attr("r", circleSize)
                .style("stroke", "none")
                .style("stroke-width", 2)
                .style("fill-opacity", 0.8);
        };

        let mouseleave_rec = function (e, d) {
            tooltip_hist.style("visibility", "hidden").transition().duration(200);
            d3.select(this)
                .style("stroke", "grey")
                .style("stroke-width", 2)
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

        let mouseover_non_hist = function (e, d) {
            console.log("non-hist")
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 5)
                .style("fill-opacity", 1);
        };

        let mousedown_non_hist = function (e, d) {
            d3.select(container.current).remove()
            console.log("clicked")
            console.log(e)
            console.log(d)
            window.open(
                '/scatter',
                '_self' // <- This is what makes it open in a new window.
            );

        }

        let mousedown_hist = function (e, d) {
            d3.select(container.current).remove()
            window.open(
                '/hist',
                '_self' // <- This is what makes it open in a new window.
            );

        }

        let mousemove_circ = function (e, d) {
            console.log("move circle: ")
            console.log(datasets)
            // console.log("mousemove " + e.pageX / (cellWidth / 2));
            //console.log("mousemove" + (Math.floor(d / datasets[0].length)))
            //console.log("mousemove " + e.pageX);
            //console.log("mousemove " + e.pageY)
            // console.log("mousemove " + cellWidth)
            // console.log("mousemove " + cellHeight);
            tooltip_circ
                .html(
                    "Dataset: " +
                    dataset_dic[(Math.floor(d / datasets[0].length))] +
                    "<br>symmetry: " +
                    finalData[d]["symmetry"]
                    // "<br>Material_0: " +
                    // finalData[d].CM0 +
                    // "<br>Material_1: "
                    // d.CM1 +
                    // `<br>${query1}: ` +
                    // d[query1] +
                    // `<br>${query2}: ` +
                    // d[query2]
                )
                .style("top", e.pageY - 85 + "px")
                .style("left", e.pageX - 165 + "px");
        };

        let mousemove_hist = function (e, d) {
            let column = columns[parseInt(d)]
            let temp_arr = [...finalData.map(data => data[column])]
            tooltip_hist
                .html(
                    "Column: " +
                    column  +
                    "<br>Range: " +
                    (d3.min(temp_arr) > 0 ? d3.min(temp_arr) : 0) +
                    " to " +
                    (d3.max(temp_arr) > 0 ? d3.max(temp_arr) : 0) +
                    "<br>Mean: " +
                    d3.mean(temp_arr) +
                    "<br>Median: " +
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

        d3.select(legendContainer).selectAll(".legend").remove();


        let legend = this.legend.selectAll(".legend").data(data);

        legend.exit().remove();

        legend
            .enter()
            .append("circle")
            .attr("class", "legend")
            .attr("r", legendCircleSize)
            .attr("cx", 10)
            .attr("cy", (d, i) => (legendCircleSize * 2 + legendSpacing * 2) * i + 30)
            .style("fill", (d) => d.color);
        //Create legend labels
        legend
            .enter()
            .append("text")
            .attr("class", "legend")
            .attr("x", 20)
            .attr("y", (d, i) => (legendCircleSize * 2 + legendSpacing * 2) * i + 30)
            .text((d) => d.name)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

        legend.exit().remove();

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


        //
        // d3.selectAll(".hist")
        //     .on("mouseover", mouseover_hist)
        //
        // d3.selectAll(".non-hist")
        //     .on("mouseover", mouseover_non_hist)


        this.cell.each(function ([x, y]) {
            if (x == 0 && y == 0) {
                d3.select(this)
                    .selectAll(".cell")
                    .attr("class", "hist")
                    .on("mouseover", mouseover_hist)
                    .on("mouseleave", mouseleave_rec)
                    .on("mousemove", mousemove_hist)
                    .on("mousedown", mousedown_hist)
                for (let i = 0; i < 2; i++) {
                    let a = columns;
                    let b = columns;
                    let X0 = d3.map(a, a => d3.map(datasets[i], typeof a === "function" ? a : d => +d[a]));
                    let Y0 = d3.map(b, b => d3.map(datasets[i], typeof b === "function" ? b : d => +d[b]));
                    console.log("Y0")
                    console.log(Y0)
                    const Z = d3.map(datasets[i], z);

                    // Omit any data not present in the z-domain.
                    let I0 = d3.range(Z.length).filter(i => zDomain.has(Z[i]));
                    const thresholds = 40
                    Y0 = d3.map(Y0[y], () => 1);
                    const bins = d3.bin().thresholds(thresholds).value(i => X0[x][i])(I0);
                    const Y1 = Array.from(bins, I0 => d3.sum(I0, i => Y0[i]));
                    const normalize = true;
                    // if (normalize) {
                    //     const total = d3.sum(Y1);
                    //     for (let i = 0; i < Y1.length; ++i) Y1[i] /= total;
                    // }

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

                        histogram.exit().remove();
                    }

                }

            }
        })
        ;

    }

}


export default Hist;