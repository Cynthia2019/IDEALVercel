import * as d3 from "d3";
import Header from "../components/shared/header";
import organizeByName from "../util/organizeByName";

const padding = 10// separation between adjacent cells, in pixels
const marginTop = 0 // top margin, in pixels
const marginRight = 0 // right margin, in pixels
const marginBottom = 0 // bottom margin, in pixels
const marginLeft = 0 // left margin, in pixels
const width = 968 // outer width, in pixels



class Hist {
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
            .attr("viewBox", [padding * 2, padding * 5, width, height + padding * 13])
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
           max_num_datasets,
           setTooltip,
           toggled) {
        
        function expo(x, f) {
            if (x < 1000 && x > -1000) return x;
            if (!toggled) {
                return (x / 1e6) + "e+6"
            } else {
                return (x / 1e9) + "e+9"
            }
            // return Number(x).toExponential(f);
        }
        let index = columns.indexOf(query1)
        let datasets = [];
        let dataset_dic = {};
        let tooltip = [];
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
        d3.selectAll(".x-label").remove();
        d3.selectAll(".tooltip_hist").remove();

        for (let i = 0; i < max_num_datasets; i++) {
            d3.selectAll(".group" + i).remove()
            d3.selectAll(".mean-line" + i).remove()
        }


        let mouseleave_rec = function (e, d) {
            // tooltip_hist.style("visibility", "hidden").transition().duration(200);
            d3.select(this)
                .style("stroke", "grey")
                .style("stroke-width", 0)
                .style("fill-opacity", 0.8);
        };

        let mouseover_hist = function (e, d) {
            // console.log(e)
            // console.log(d)
            // index = d3.select(this).attr("class")[5]
            d3.select(this)
                .raise()
                .style("stroke", "black")
                .style("stroke-width", 5)
                .style("fill-opacity", 1);

            // d3.selectAll('.mean-line' + index)
            //     .raise()
            //     .style("stroke-width", 10)
            //     .style("fill-opacity", 1)
            //     .style("stroke-dasharray", ("0, 0"))


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
        const cellWidth = (width - marginRight - (X.length - 1) * padding);
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
                    .attr("transform", (d, i) => `translate(${width / 3},${width + padding * 2})`)
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
                    .attr("transform", `translate(${-width / 10 - padding * 6},${cellHeight / 2 + padding}) rotate(270)`)
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
                    let temp_tooltip = {}
                    if (organizedData[i]) {
                        let temp_arr = finalData.map((d, i) => d[query1])
                        // temp_tooltip["max"] = d3.max(temp_arr)
                        // temp_tooltip["min"] = d3.min(temp_arr)
                        temp_tooltip["name"] = organizedData[i].name
                        temp_tooltip["color"] = organizedData[i].color
                        temp_tooltip["min"] = d3.min(temp_arr)
                        temp_tooltip["max"] = d3.max(temp_arr)
                        temp_tooltip["mean"] = d3.mean(temp_arr)
                        temp_tooltip["median"] = d3.median(temp_arr)
                        tooltip.push(temp_tooltip)
                    }
                    // console.log("bins")
                    // console.log(data[i] ? data[i].data.map((d, i) => d[query1]) : null)
                    // console.log(temp_tooltip)
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
                            // .on("mouseleave", mouseleave_rec)
                            // .on("mousemove", mousemove_hist)
                            .attr("transform", `translate(${-width / 10}, ${0})`)

                        d3.selectAll(".group" + i)
                            .on("mouseover", mouseover_hist)
                            .on("mouseleave", mouseleave_rec)
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
            .attr("transform", `translate(${padding * 6 + 5},${padding * 16 - 5})`)
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
            .attr("transform", `translate(${width / 15}, ${width + padding * 10 + 5})`)
            .attr("class", "xAxisGroup")
            .call(xAxis.scale(xScales[index]))

        xAxis_line
            .selectAll("text")
            .attr("font-size", 18)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")

        // console.log('final_tool_tip')
        // console.log(tooltip)
        setTooltip(tooltip);


        let transitionDuration = 200;

        const exitTransition = d3.transition().duration(transitionDuration);
        const updateTransition = exitTransition
            .transition()
            .duration(transitionDuration);

        tooltip.map((d, i) => {
            let mean = tooltip[i].mean
            // console.log('mean-line')
            // console.log(dataset_dic[i])
            // console.log(mean)
            // console.log(xScales[index](mean))
            d3.select('svg')
                .append('g')
                .append('line')
                .attr('class', 'mean-line' + i)
                .raise()
                .transition(updateTransition)
                .attr("x1", xScales[index](mean) + width / 15)
                .attr("y1", width + padding * 10 + 5)
                .attr("x2", xScales[index](mean) + width / 15)
                .attr("y2", padding * 16 - 5)
                .attr("stroke", colors[dataset_dic[i]])
                .attr("stroke-width", 6)
                .attr("fill", "None")
                .style("stroke-dasharray", ("5, 5"))

        })

        let tooltipContent = tooltip.map((d, i) => (
            "<b>Dataset: </b>" + d.name + "<br>" +
            "<b>Range: </b>" + expo(d.min, 0) + " to " + expo(d.max, 0) + "<br>" +
            "<b>Mean: </b>" + expo(d.mean, 0) + "<br>" +
            "<b>Median: </b>" + expo(d.median, 0) + "<br>"
        )
    )

        // let legend = d3.select('svg')
        //     .append('g')
        //     .append("line");
        //
        //
        //
        // legend//making a line for legend
        //     .raise()
        //     .attr("x1", width - 28)
        //     .attr("x2", width)
        //     .attr("y1", 10)
        //     .attr("y2", 10)
        //     .style("stroke-dasharray","5,5")//dashed array for line
        //     .style("stroke", "black");
        //
        // legend.append("text")
        //     .attr("x", width - 44)
        //     .attr("y", 9)
        //     .attr("dy", ".35em")
        //     .style("text-anchor", "end")
        //     .text("Mean");
        let tooltip_hist = d3
            .select(container.current)
            .append("div")
            .style("overflow-y", "auto")
            .style("width", '280px')
            .style("height", '200px')
            .attr("class", "tooltip_hist")
            .style("position", "fixed")
            .style("background-color", "white")
            .style("border", "solid")
            .style("stroke", "white")
            .style("box-shadow", "5px 5px 5px 0px rgba(0,0,0,0.3)")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("visibility", "visible")
            .html(tooltipContent.join("<br>"))
            .style("top", 60 + "px")
            .style("left", 500 + "px");

    }


}


export default Hist;