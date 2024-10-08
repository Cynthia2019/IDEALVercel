import * as d3 from "d3";
import {nnColorAssignment} from "@/util/constants";
import organizeByName from "@/util/organizeByName";

const circleOriginalSize = 3;
const circleFocusSize = 8;

const MARGIN = {
    TOP: 0,
    RIGHT: 50,
    BOTTOM: 20,
    LEFT: 50,
};

const SIDE_BAR_SIZE = 100;

const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT - SIDE_BAR_SIZE;
const HEIGHT = 700 - MARGIN.TOP - MARGIN.BOTTOM - SIDE_BAR_SIZE;
const LEGEND_WIDTH = 400;
const LEGEND_HEIGHT = 20;

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

class ScatterWithContour {
    constructor(element, legendElement, legendContainer, data, densityData, scatterData) {
        this.isDarkMode =
            window?.matchMedia &&
            window?.matchMedia("(prefers-color-scheme: dark)").matches;
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
            .attr("style", "max-width: 100%");

        this.legendSvg = d3
            .select(legendElement)
            .append("svg")
            .attr("width", LEGEND_WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
            .attr("height", LEGEND_HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
            .attr("viewBox", [
                -MARGIN.LEFT,
                -MARGIN.TOP / 4,
                LEGEND_WIDTH + MARGIN.LEFT + MARGIN.RIGHT,
                LEGEND_HEIGHT + MARGIN.TOP + MARGIN.BOTTOM,
            ])
            .attr("style", "max-width: 100%");
        this.legend = d3
            .select(legendContainer)
            .append("svg")
            .attr("width", 120)
            .append("g")
            .attr("class", "pairwise-plot-legend");
        //brush
        this.svg.append("g")
            .attr("class", "brush");

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
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("fill", "black");

        // Append group el to display both axes
        this.xAxisGroup = this.svg
            .append("g")
            .attr("transform", `translate(0, ${HEIGHT})`);

        // Append group el to display both axes
        this.yAxisGroup = this.svg.append("g");
        this.xScaleForBrush;
        this.yScaleForBrush;

        this.update({
            data: data,
            densityData: densityData,
            scatterData: scatterData,
            element: element,
            legendElement: legendElement,
            query1: this.query1,
            query2: this.query2,
            reset: false,
        });
    }

    update({
               data,
               densityData,
               scatterData,
               completeData,
               maxDataPointsPerDataset,
               element,
               setDataPoint,
               query1,
               query2,
               selectedData,
               setSelectedData,
               setNeighbors,
               reset,
               setReset,
               orig_datasets,
               max_num_datasets,
               clickedNeighbor,
               setOpenNeighbor,
               legendElement,
               legendContainer,
               showDensity,
               showScatter,
               setCaptured,
               scatter_by_dataset,
               interactionMode
           }) {
        let isZoomed = false;  // State variable to track zoom mode
        let zoomed_scatter_final_concat = [];
        // Function to get unique dataset names and filter scatter_by_dataset
        function filterScatterByDataset(scatterData, scatter_by_dataset) {
            // Get a list of unique dataset names from scatterData
            const uniqueDatasetNames = [...new Set(scatterData.map(d => d.name))];

            // Filter scatter_by_dataset to only include datasets present in uniqueDatasetNames
            let filteredScatterByDataset = {};
            uniqueDatasetNames.forEach(name => {
                if (scatter_by_dataset[name]) {
                    filteredScatterByDataset[name] = scatter_by_dataset[name];
                }
            });

            return filteredScatterByDataset;
        }

        // Apply the filter function at the start of update
        scatter_by_dataset = filterScatterByDataset(scatterData, scatter_by_dataset);


        function updateFinalData(scatter_by_dataset, maxDataPointsPerDataset) {
            let res = [];

            if (scatter_by_dataset === undefined) { return res; }

            // Iterate through each dataset in the dictionary
            Object.entries(scatter_by_dataset).forEach(([datasetName, data]) => {
                // Slice the data for each dataset to respect the maximum points limit
                const slicedData = data.slice(0, Math.min(maxDataPointsPerDataset, data.length));

                // Concatenate the sliced data into the scatter_finalData array
                res = res.concat(slicedData);
            });

            return res;
        }

        function updateScatterFinalData(scatter_by_dataset, maxDataPointsPerDataset) {
            let res = {};

            if (scatter_by_dataset === undefined) { return res; }

            // Iterate through each dataset in the dictionary
            Object.entries(scatter_by_dataset).forEach(([datasetName, data]) => {
                // Slice the data for each dataset to respect the maximum points limit
                const slicedData = data.slice(0, Math.min(maxDataPointsPerDataset, data.length));
                res[datasetName] = slicedData
            });

            return res;
        }

        function updateFilteredScatterData(scatter_by_dataset, maxDataPointsPerDataset, X0, X1, Y0, Y1) {
            let res = [];

            // Iterate through each dataset in the dictionary
            Object.entries(scatter_by_dataset).forEach(([datasetName, data]) => {
                // Filter data points within the specified x and y bounds
                let filteredData = data.filter(d =>
                    d[query1] >= X0 && d[query1] <= X1 &&
                    d[query2] >= Y0 && d[query2] <= Y1
                );

                // Sort by index if necessary to maintain order, assuming 'index' is a property
                // This might not be needed if the data doesn't require a specific rendering order
                filteredData.sort((a, b) => a.index - b.index);

                // Slice to limit the maximum points per dataset
                res = res.concat(filteredData.slice(0, Math.min(maxDataPointsPerDataset, filteredData.length)));
            });

            return res;
        }


        this.data = data;
        this.query1 = query1;
        this.query2 = query2;

        const legendCircleSize = 5.0;
        const legendSpacing = 4;

        d3.select(legendContainer).selectAll(".legend").remove();


        let finalData = data;
        // .slice(0, Math.min(maxDataPointsPerDataset, data.length));
        let density_finalData = [].concat(...densityData)
        let scatter_finalData = updateScatterFinalData(scatter_by_dataset, maxDataPointsPerDataset);
        let scatter_finalData_concat = updateFinalData(scatter_by_dataset, maxDataPointsPerDataset);
        let master_datasets = [];
        let min_density = [];

        //remove elements to avoid repeated append
        d3.selectAll(".legend").remove();
        d3.select(".tooltip").remove();
        d3.selectAll(".dataCircle").remove();
        d3.selectAll(".rectZoom").remove();
        d3.selectAll(".clipPath").remove();
        d3.selectAll(".mean-line").remove();
        d3.selectAll(".group").remove();
        d3.selectAll(".contour").remove();
        d3.selectAll(".xAxisGroup").remove();
        d3.selectAll(".yAxisGroup").remove();
        d3.selectAll(".x-label").remove();

        let xScale = d3
            .scaleLinear()
            .domain([
                d3.min(finalData, (d) => d[query1]),
                d3.max(finalData, (d) => d[query1]),
            ])
            .range([0, WIDTH]);

        let yScale = d3
            .scaleLinear()
            .domain([
                d3.min(finalData, (d) => d[query2]),
                d3.max(finalData, (d) => d[query2]),
            ])
            .range([HEIGHT, 0]);

        this.xScaleForBrush = xScale;
        this.yScaleForBrush = yScale;
        // Add a clipPath: everything out of this area won't be drawn.
        this.svg
            .append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .attr("x", 0)
            .attr("y", 0);

        let xAxisCall = d3
            .axisBottom(xScale)
            .tickFormat((x) => `${expo(x, 2)}`);
        this.xAxisGroup.transition().duration(500).call(xAxisCall);

        let yAxisCall = d3.axisLeft(yScale).tickFormat((y) => `${expo(y, 2)}`);
        this.yAxisGroup.transition().duration(500).call(yAxisCall);
        this.xLabel.text(this.query1);
        this.yLabel.text(this.query2);

        //clean up before updating visuals
        d3.selectAll(".xAxisGroup").remove();
        d3.selectAll(".yAxisGroup").remove();
        d3.selectAll(".x-label").remove();
        d3.selectAll(".tooltip_hist").remove();

        for (let i = 0; i <= max_num_datasets; i++) {
            d3.selectAll(".group" + i).remove();
            d3.selectAll(".mean-line" + i).remove();
        }

        let tooltip = d3
            .select(element)
            .append("div")
            .attr("class", "tooltip-scatter")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("visibility", "hidden");

        let datasets = [];
        let colors = {};
        let dataset_dic = {};

        for (let i = 0; i <= max_num_datasets; i++) {
            datasets.push([]);
        }

        let organizedData = organizeByName(density_finalData);
        organizedData.map((d, i) => {
            colors[d.name] = d.color;
            datasets[i] = d.data ? d.data : [];
            dataset_dic[i] = d.name;
        });

        master_datasets = datasets;

        // =============== Mouse Logic ================
        let mouseover_scatter = function (e, d) {
            d3.select(this)
                .attr("r", circleFocusSize)
                .style("stroke", "black")
                .style("stroke-width", 2)
                .style("fill-opacity", 1);
            setDataPoint(d);
            tooltip.style("visibility", "visible").transition().duration(200);
        };

        let mousemove_scatter = function (e, d) {
            tooltip
                .html(
                    "Dataset: " +
                    d["name"] +
                    "<br>symmetry: " +
                    d["symmetry"] +
                    `<br>C11: ` +
                    d["C11"].toExponential(4) +
                    `<br>C12: ` +
                    d["C12"].toExponential(4) +
                    `<br>C22: ` +
                    d["C22"].toExponential(4) +
                    `<br>C16: ` +
                    d["C16"].toExponential(4) +
                    `<br>C26: ` +
                    d["C26"].toExponential(4) +
                    `<br>C66: ` +
                    d["C66"].toExponential(4)
                )
                .style("top", e.pageY + 10 + "px")
                .style("left", e.pageX + 10 + "px");
            this.isDarkMode ?? tooltip.style("color", "black");
        };

        let mouseleave_scatter = function (e, d) {
            tooltip.style("visibility", "hidden").transition().duration(200);
            const circle = d3.select(this);
            d3.select(this)
                .attr(
                    "r",
                    circle.classed("highlighted")
                        ? circleFocusSize
                        : circleOriginalSize
                )
                .style("stroke", "none")
                .style("stroke-width", 2)
                .style("fill-opacity", 0.8);
        };

        let mouseleave_contour = function (e, d) {
            d3.select(this)
                .style("stroke", "grey")
                .style("stroke-width", 0)
                .attr("opacity", 0.5);
            setCaptured('NA');
        };

        let mouseover_contour = function (e, d) {
            let i = +d3.select(this).attr("class").replace('group', '');
            setCaptured(Math.floor(master_datasets[i].length * min_density[i] / d.value));
            d3.select(this.parentNode)
                .raise();
            d3.selectAll(".dataCircle").raise();
            // d3.selectAll(".clipPath").raise();
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 5)
                .attr("opacity", 1);

            // d3.selectAll(".xAxisGroup").raise();

        };
        // =================================================


        //=============== Contours Helper =========================

        let createDatasetNames = (data) => {
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
        }
        let createLegend = (baseColors, zoomed, curr_data) => {
            const numSamples = 5; // Number of samples in the gradient
            const legendWidth = LEGEND_WIDTH;
            const legendHeight = LEGEND_HEIGHT;
            const legendPadding = 20; // Padding between legends
            let density_offset = zoomed ? 0.2 : 0;

            this.legendSvg.selectAll("*").remove();
            baseColors.forEach((baseColor, index) => {
                // Calculate the starting y position for the current legend
                let yOffset = index * (legendHeight + legendPadding);

                for (let i = 0; i <= numSamples; i++) {
                    let hsl = d3.hsl(baseColor);
                    hsl.opacity = 0.5;

                    // Interpolating the lightness value between 0.9 (max) and 0.6 (min)
                    hsl.l = (0.9 - density_offset) - ((0.4 - (density_offset)) * (i / numSamples));
                    let color = hsl.toString();

                    // Draw the color rectangle for the current legend
                    this.legendSvg.append("rect")
                        .attr("x", i * (legendWidth / numSamples))
                        .attr("y", yOffset) // Use yOffset for the y position
                        .attr("width", legendWidth / numSamples)
                        .attr("height", legendHeight)
                        .style("fill", color);
                }
                // Add labels for the current legend
                this.legendSvg.selectAll(`.text-${index}`)
                    .data(d3.range(numSamples + 1))
                    .enter()
                    .append("text")
                    .attr("class", `text-${index}`)
                    .attr("x", (d, i) => i * (legendWidth / numSamples))
                    .attr("y", yOffset + legendHeight + 15)
                    .style("fill", "#000")
                    .style("font-size", "12px")
                    .text((d, i) => `${(i * curr_data[index].length / numSamples).toFixed(0)} points`);
            });
        }

        function getDensityColorFull(baseColor, density, maxDensity, zoomed) {
            let hsl = d3.hsl(baseColor);
            let density_offset = zoomed ? 2.5 : 1;
            // hsl.l = 1 is white, 0 is black
            // We need this seemingly verbose if / else to manually separate colors
            //
            if ((density / maxDensity) > 0.4 * density_offset) {
                hsl.l = 0.70
            } else if ((density / maxDensity) > 0.2 * density_offset) {
                hsl.l = 0.75
            } else if ((density / maxDensity) > 0.1 * density_offset) {
                hsl.l = 0.80
            } else if ((density / maxDensity) > 0.05 * density_offset) {
                hsl.l = 0.85
            } else {
                hsl.l = 0.90
            }

            hsl.opacity = 0.5;

            return hsl.toString();
        }

        function getDensityColorSample(baseColor, density, maxDensity, zoomed) {
            let hsl = d3.hsl(baseColor);
            // hsl.l = 1 is white, 0 is black
            // We need this seemingly verbose if / else to manually separate colors
            //
            let density_offset = zoomed ? 2.5 : 1;

            if ((density / maxDensity) > 0.4 * density_offset) {
                hsl.l = 0.65
            } else if ((density / maxDensity) > 0.2 * density_offset) {
                hsl.l = 0.70
            } else if ((density / maxDensity) > 0.10 * density_offset) {
                hsl.l = 0.75
            } else if ((density / maxDensity) > 0.05 * density_offset) {
                hsl.l = 0.80
            } else {
                hsl.l = 0.90
            }

            hsl.opacity = 0.5;

            return hsl.toString();
        }

        for (let i = 0; i <= max_num_datasets; i++) {
            d3.selectAll(".group" + i).remove()
        }

        // =========== Draw Initial Plots ==========
        if (showDensity) {
            // createLegend(Object.values(colors), false, datasets);
            // createDatasetNames(orig_datasets);
            min_density = [];
            for (let i = 0; i <= max_num_datasets; i++) {
                drawContour(i, xScale, yScale, this.svg, false, datasets)
            }
        } else {
            this.legendSvg.selectAll("*").remove();
            d3.select(legendContainer).selectAll(".legend").remove();
            for (let i = 0; i <= max_num_datasets; i++) {
                d3.selectAll(".group" + i)
                    .remove()
            }
        }
        d3.selectAll(".dataCircle").remove();
        if (showScatter) {
            drawCircles(xScale, yScale, this.svg, scatter_finalData_concat)
        } else {
            d3.selectAll(".dataCircle").remove();
        }
        // ==========================================

        // =========== Select Circle Logic ===========
        async function getKnnData(dataPoint) {
            const url = "https://metamaterials-srv.northwestern.edu./model/";
            let response = await fetch(url, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify({
                    dataPoint: [dataPoint],
                    data: scatter_finalData_concat.map((d) => [
                        d.C11,
                        d.C12,
                        d.C22,
                        d.C16,
                        d.C26,
                        d.C66,
                    ]),
                }),
            })
                .then((res) => res.json())
                .catch((err) => console.log("fetch error", err.message));
            return response;
        }

        let mousedown_scatter = function (e, d) {
            let columns = ["C11", "C12", "C22", "C16", "C26", "C66"];
            let inputDataPoint = columns.map((c) => d[c]);
            let target = d3.select(this);
            target.classed("selected", !target.classed("selected"));

            let selected = [];
            d3.selectAll(".selected").each((d, i) => selected.push(d));
            setSelectedData(selected);

            if (clickedNeighbor) {
                //get knn data
                target.classed("selected", true);
                getKnnData(inputDataPoint).then((data) => {
                    console.log('knndata', data);
                    let indices = data.indices;
                    let distances = data.distances;
                    // index should be the index of the data in the current active dataset
                    d3.selectAll(".dataCircle")
                        .data(scatter_finalData_concat)
                        .classed("highlighted", function (datum) {
                            return indices.includes(scatter_finalData_concat.indexOf(datum));
                        });
                    d3.selectAll(".dataCircle").classed(
                        "masked",
                        function (datum) {
                            return !this.getAttribute("class").includes(
                                "highlighted"
                            );
                        }
                    );

                    let neighborElements = d3.selectAll(".highlighted");
                    let masked = d3.selectAll(".masked");
                    masked
                        .attr("fill", (d) => d.color)
                        .attr("r", circleOriginalSize)
                        .classed("selected", false);

                    let neighbors = [];
                    neighborElements.each((d, i) => {
                        d["outline_color"] = nnColorAssignment[i];
                        d["distance"] =
                            distances[indices.indexOf(scatter_finalData_concat.indexOf(d))];
                        neighbors.push(d);
                    });
                    neighbors.sort((a, b) => a.distance - b.distance);
                    neighborElements
                        .attr("fill", (d) => d.outline_color)
                        .attr("r", circleFocusSize);
                    setNeighbors(neighbors);
                });
                setOpenNeighbor(true);
            }
        };
        // ==========================================

        const chartExtent = [
            [0, 0],
            [WIDTH, HEIGHT],
        ];


        // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
        let zoom = d3
            .zoom()
            .translateExtent([[0, 0], [WIDTH, HEIGHT]])
            .extent(chartExtent)
            .on("zoom", (event) => {
                isZoomed = true;  // Set zoom mode to true when zooming

                // recover the new scale
                let newXScale = event.transform.rescaleX(xScale);
                let newYScale = event.transform.rescaleY(yScale);

                // update axes with these new boundaries
                let xAxisCall = d3
                    .axisBottom(newXScale)
                    .tickFormat((x) => `${expo(x, 2)}`);
                let yAxisCall = d3
                    .axisLeft(newYScale)
                    .tickFormat((y) => `${expo(y, 2)}`);
                this.xAxisGroup.transition().duration(500).call(xAxisCall);
                this.yAxisGroup.transition().duration(500).call(yAxisCall);

                this.xScaleForBrush = newXScale;
                this.yScaleForBrush = newYScale;

                // resample data based on the current zoom level
                const [X0, X1] = xAxisCall.scale().domain();
                const [Y0, Y1] = yAxisCall.scale().domain();

                let zoomed_scatter_final = [].concat(
                        ...scatterData.filter(
                            (d) =>
                                d[query1] >= X0 &&
                                d[query1] <= X1 &&
                                d[query2] >= Y0 &&
                                d[query2] <= Y1
                        )
                            .sort((a, b) => a.index > b.index) // ensure always select the topmost indices
                            .slice(0, maxDataPointsPerDataset)
                    )
                ;

                zoomed_scatter_final_concat = updateFilteredScatterData(scatter_by_dataset, maxDataPointsPerDataset, X0, X1, Y0, Y1);

                let zoomed_density_final = [].concat(
                    ...densityData.filter(
                        (d) =>
                            d[query1] >= X0 &&
                            d[query1] <= X1 &&
                            d[query2] >= Y0 &&
                            d[query2] <= Y1
                    )
                        .sort((a, b) => a.index > b.index) // ensure always select the topmost indices

                );
                let new_datasets = [];
                let new_colors = {}

                for (let i = 0; i <= max_num_datasets; i++) {
                    new_datasets.push([])
                }
                let organizedData = organizeByName(zoomed_density_final);
                organizedData.map((d, i) => {
                    new_colors[d.name] = d.color;
                    new_datasets[i] = (d.data) ? (d.data) : [];
                });

                master_datasets = new_datasets;
                if (showDensity) {
                    // createLegend(Object.values(new_colors), true, new_datasets);
                    // createDatasetNames(orig_datasets);
                    min_density = [];
                    for (let i = 0; i <= max_num_datasets; i++) {
                        d3.selectAll(".group" + i).remove()
                        drawContour(i, newXScale, newYScale, this.svg, true, new_datasets)
                    }
                } else {
                    this.legendSvg.selectAll("*").remove();
                    d3.select(legendContainer).selectAll(".legend").remove();
                    for (let i = 0; i <= max_num_datasets; i++) {
                        d3.selectAll(".group" + i).remove()
                    }
                }

                d3.selectAll(".dataCircle").remove();
                if (showScatter) {
                    drawCircles(newXScale, newYScale, this.svg, zoomed_scatter_final_concat)
                } else {
                    d3.selectAll(".dataCircle").remove();
                }
            });
        //--------
        //end of zoom
        if (interactionMode == "brushing") {
            let brush = d3.brush().on("brush end", (event) => {
                if (event.sourceEvent?.type === "zoom") return; // ignore brush-by-zoom

                let currentData = isZoomed ? zoomed_scatter_final_concat : scatter_finalData_concat;

                if (event.selection) {
                    let _xScale = this.xScaleForBrush;
                    let _yScale = this.yScaleForBrush;
                    d3.selectAll(".dataCircle")
                        .data(currentData)
                        .each(function (d) {
                            const isInBrush = isBrushed(
                                event.selection,
                                _xScale(d[query1]),
                                _yScale(d[query2])
                            );

                            // Update the selection state and visual properties accordingly
                            d3.select(this)
                                .classed("selected", isInBrush)
                                .attr("r", circleOriginalSize)
                                .style("stroke", isInBrush ? "black" : "none")
                                .style("stroke-width", isInBrush ? 2 : 0)
                                .style("fill-opacity", isInBrush ? 1 : 0.8);
                        });

                    // Update the selected data array
                    let selected = [];
                    d3.selectAll(".dataCircle.selected").each((d) => selected.push(d));
                    setSelectedData(selected);
                } else {
                    // If there is no selection (brush has been cleared), un-highlight all points
                    d3.selectAll(".dataCircle")
                        .classed("selected", false)
                        .attr("r", circleOriginalSize)
                        .style("stroke", "none")
                        .style("stroke-width", 0)
                        .style("fill-opacity", 0.8);

                    // Clear the selected data array
                    setSelectedData([]);
                }
            });
            this.svg.select("g.brush").call(brush).on("wheel.zoom", null);
            this.svg.call(zoom).on("mousedown.zoom", null);

        } else if (interactionMode == "panning") {
            // Clear the brush selection and remove the brush box
            this.svg.select("g.brush").call(d3.brush().clear);
            this.svg.select("g.brush").on(".brush", null);

            // Enable zoom functionality
            this.svg.call(zoom);
        }


        // apply zoom and brush to svg

        function drawContour(i, xScale, yScale, svg, zoomed, datasets) {
            d3.selectAll(".group" + i).remove()
            let contourGroup = svg.append("g")
                .attr("clip-path", "url(#clip)")
                .attr("class", "clipPath");

            let contours = []
            if (datasets[i][1] && datasets[i][1].name == "freeform_2d.csv") {
                contours = d3
                    .contourDensity()
                    .x((d) => xScale(d[query1]))
                    .y((d) => yScale(d[query2]))
                    .size([WIDTH, HEIGHT]) // Adjust size as needed (height - 35)
                    .bandwidth(15)
                    .thresholds(1000)(datasets[i]);
            } else {
                contours = d3
                    .contourDensity()
                    .x((d) => xScale(d[query1]))
                    .y((d) => yScale(d[query2]))
                    .size([WIDTH, HEIGHT]) // Adjust size as needed (height - 67)
                    .bandwidth(25)
                    .thresholds(50)(datasets[i]);
            }

            min_density.push(d3.min(contours, d => d.value)); // Minimum density for the current dataset
            let maxDensity = d3.max(contours, d => d.value); // Maximum density for current datasets

            if (datasets[i].length == 1) {
                d3.selectAll(".group" + i)
                    .remove()
                min_density = []
            } else {
                if (datasets[i][1]) {
                    contourGroup
                        .selectAll("path")
                        .data(contours)
                        .enter()
                        .append("path")
                        .attr("fill", datasets[i][1].name == "freeform_2d.csv" ?
                            d => getDensityColorFull(colors[dataset_dic[i]], d.value, maxDensity, true)
                            : d => getDensityColorSample(colors[dataset_dic[i]], d.value, maxDensity, true))
                        .attr("d", d3.geoPath())
                        .attr("stroke-linejoin", "miter")
                        .attr("class", "group" + i)
                        // .attr("transform", `translate(75, -5)`)
                        .on("mouseover", mouseover_contour)
                        .on("mouseleave", mouseleave_contour)
                        .attr("stroke", "grey")
                        .attr("stroke-width", 0)
                        .attr("opacity", 0.5);
                    // contour.exit().remove();

                }

            }
        }

        // ============= Reset Logic ==============

        if (reset) {
            this.svg.call(zoom.transform, d3.zoomIdentity);
            d3.selectAll(".selected").classed("selected", false);
            setSelectedData([]);
            setReset(false);
        }


        // ============= Draw Plot Logic ================
        function drawCircles(xScale, yScale, svg, scatter_concat) {
            // Remove any existing circles and definitions to clean up before redrawing
            svg.selectAll(".dataCircle").remove();

            // Create a group for the circles if not already existing
            let circles = svg
                .append("g")
                .attr("clip-path", "url(#clip)")
                .attr("class", "clipPath")
                .selectAll(".dataCircle")
                .data(scatter_concat);

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
                .on("mousedown", mousedown_scatter)
                .on("mouseover", mouseover_scatter)
                .on("mousemove", mousemove_scatter)
                .on("mouseleave", mouseleave_scatter)
                .attr("cx", (d) => xScale(d[query1]))
                .attr("cy", (d) => yScale(d[query2]));
            circles.exit().transition().attr("r", 0).remove();

        }
    }
}

export default ScatterWithContour;
