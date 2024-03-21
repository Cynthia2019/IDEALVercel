import * as d3 from "d3";
import organizeByName from "@/util/organizeByName";

const MARGIN = {
    TOP: 20,
    RIGHT: 10,
    BOTTOM: 50,
    LEFT: 50,
};

const SIDE_BAR_SIZE = 100;

const WIDTH = 700 - MARGIN.LEFT - MARGIN.RIGHT - SIDE_BAR_SIZE;
const HEIGHT = 700 - MARGIN.TOP - MARGIN.BOTTOM - SIDE_BAR_SIZE;
const LEGEND_WIDTH = 600;
const LEGEND_HEIGHT = 20;

function expo(x, f) {
    if (x < 1000 && x > -1000) return x;
    return Number(x).toExponential(f);
}


class Contour_test {
    constructor(element, legendElement, data) {
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
            .attr("style", "max-width: 100%; overflow: visible");

        this.legendSvg = d3
            .select(legendElement)
            .append("svg")
            .attr("width", LEGEND_WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
            .attr("height", LEGEND_HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
            .attr("viewBox", [
                -MARGIN.LEFT,
                -MARGIN.TOP,
                LEGEND_WIDTH + MARGIN.LEFT + MARGIN.RIGHT,
                LEGEND_HEIGHT + MARGIN.TOP + MARGIN.BOTTOM,
            ])
            .attr("style", "max-width: 100%; overflow: visible");

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
        console.log('elements', element, legendElement)
        this.update({
            data: data,
            element: element,
            legendElement: legendElement,
            query1: this.query1,
            query2: this.query2,
            reset: false,
        });
    }
    //query1: x-axis
    //query2: y-axis
    update({
               data,
               completeData,
               maxDataPointsPerDataset,
               query1,
               query2,
               datasets,
               max_num_datasets,
               legendElement
           }) {
        this.data = data;
        this.query1 = query1;
        this.query2 = query2;
        console.log('elements update', this.element, this.legendElement)

        let finalData = [].concat(...data);

        //remove elements to avoid repeated append
        d3.selectAll(".legend").remove();
        d3.select(".tooltip").remove();
        d3.selectAll("defs").remove();
        d3.selectAll(".clipPath").remove();

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
            .append("defs")
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

        let mouseleave_contour = function (e, d) {
            // tooltip_hist.style("visibility", "hidden").transition().duration(200);
            d3.select(this)
                .style("stroke", "grey")
                .style("stroke-width", 0)
                .style("fill-opacity", 0.8);
        };

        let mouseover_contour = function (e, d) {
            d3.select(this.parentNode)
                .raise();
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 5)
                .style("fill-opacity", 1);
        };

        let createLegend = (baseColor, isFullDensity) => {
            const numSamples = 5; // Number of samples in the gradient
            const maxDensity = 1; // Assuming maxDensity is normalized to 1
            const legendWidth = LEGEND_WIDTH;
            const legendHeight = LEGEND_HEIGHT;

            this.legendSvg.selectAll("*").remove();

            // Generate sample density values and their corresponding colors
            for (let i = 0; i <= numSamples; i++) {
                let density = (i / numSamples) * maxDensity;
                let color = isFullDensity
                    ? getDensityColorFull(baseColor, density, maxDensity)
                    : getDensityColorSample(baseColor, density, maxDensity);

                // Draw the color rectangle
                this.legendSvg.append("rect")
                    .attr("x", i * (legendWidth / numSamples))
                    .attr("width", legendWidth / numSamples)
                    .attr("height", legendHeight)
                    .style("fill", color);
            }

            // Add labels (you could adjust the density values based on your specific scale)
                this.legendSvg.selectAll("text")
                .data(d3.range(numSamples + 1))
                .enter()
                .append("text")
                .attr("x", (d, i) => i * (legendWidth / numSamples))
                .attr("y", legendHeight + 15)
                .style("fill", "#000")
                .style("font-size", "12px")
                .text((d, i) => `${(i / numSamples).toFixed(2)} density`);
        }
        function getDensityColorFull(baseColor, density, maxDensity) {
            let hsl = d3.hsl(baseColor);
            // hsl.l = 1 is white, 0 is black
            // We need this seemingly verbose if / else to manually separate colors
            //
            if ((density / maxDensity) > 0.4) {
                hsl.l = 0.70
            } else if ((density / maxDensity) > 0.2) {
                hsl.l = 0.75
            } else if ((density / maxDensity) > 0.1) {
                hsl.l = 0.80
            } else if ((density / maxDensity) > 0.05) {
                hsl.l = 0.85
            } else {
                hsl.l = 0.90
            }

            hsl.opacity = 0.5;

            // console.log('hsl', hsl)
            return hsl.toString();
        }

        function getDensityColorSample(baseColor, density, maxDensity) {
            let hsl = d3.hsl(baseColor);
            // hsl.l = 1 is white, 0 is black
            // We need this seemingly verbose if / else to manually separate colors
            //
            // if ((density / maxDensity) > 0.2) {
            //     hsl.l = 0.50
            // } else
            if ((density / maxDensity) > 0.15) {
                hsl.l = 0.65
            } else if ((density / maxDensity) > 0.10) {
                hsl.l = 0.75
            } else if ((density / maxDensity) > 0.05) {
                hsl.l = 0.85
            } else {
                // console.log('density', (density / maxDensity))
                hsl.l = 0.90
            }

            hsl.opacity = 0.5;

            // console.log('hsl', hsl)
            return hsl.toString();
        }


        const chartExtent = [
            [0, 0],
            [WIDTH, HEIGHT],
        ];

        // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
        let zoom = d3
            .zoom()
            .scaleExtent([0.1, 100]) // This control how much you can unzoom (x1) and zoom (x20)
            .translateExtent(chartExtent)
            .extent(chartExtent)
            .on("zoom", (event) => {
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

                // resample data based on the current zoom level
                const [X0, X1] = xAxisCall.scale().domain();
                const [Y0, Y1] = yAxisCall.scale().domain();
                let newFinalData = [].concat(
                    ...completeData.map((dataset) => {
                        return dataset.data
                            .filter(
                                (d) =>
                                    d[query1] > X0 &&
                                    d[query1] < X1 &&
                                    d[query2] > Y0 &&
                                    d[query2] < Y1
                            )
                            .sort((a, b) => a.index > b.index) // ensure always select the topmost indices
                            .slice(0, maxDataPointsPerDataset);
                    })
                );
                d3.selectAll(".xAxisGroup").remove();
                d3.selectAll(".yAxisGroup").remove();
                d3.selectAll(".x-label").remove();

                let datasets = [];
                let colors = {}
                let dataset_dic = {}

                for (let i = 0; i <= max_num_datasets; i++) {
                    datasets.push([])
                }
                console.log('dataset', datasets);

                let organizedData = organizeByName(newFinalData);
                organizedData.map((d, i) => {
                    colors[d.name] = d.color;
                    datasets[i] = (d.data) ? (d.data) : [];
                    dataset_dic[i] = d.name;
                });

                // scott's estimation for bandwidth

                for (let i = max_num_datasets; i >= 0; i--) {
                    d3.selectAll(".group" + i).remove()

                    let contours = []
                    // const thresholds = 10; // Adjust the range and step as needed
                    if (datasets[i][1] && datasets[i][1].name == "freeform_2d.csv") {
                        contours = d3
                            .contourDensity()
                            .x((d) => xScale(d[query1]))
                            .y((d) => yScale(d[query2]))
                            .size([WIDTH, HEIGHT - 35]) // Adjust size as needed
                            .bandwidth(15)
                            .thresholds(1000)(datasets[i]);
                        createLegend(colors[dataset_dic[i]], true);
                    } else {
                        contours = d3
                            .contourDensity()
                            .x((d) => xScale(d[query1]))
                            .y((d) => yScale(d[query2]))
                            .size([WIDTH, HEIGHT - 67]) // Adjust size as needed
                            .bandwidth(25)
                            .thresholds(50)(datasets[i]);
                        createLegend(colors[dataset_dic[i]], false);
                    }

                    let maxDensity = d3.max(contours, d => d.value); // Maximum density for the current dataset

                    if (datasets[i].length == 1) {
                        d3.selectAll(".group" + i)
                            .remove()
                    } else {
                        if (datasets[i][1]) {
                            let contour = this.svg
                                .append("g")
                                .selectAll("path")
                                .data(contours)
                                .enter()
                                .append("path")
                                .attr("fill", datasets[i][1].name == "freeform_2d.csv" ?
                                    d => getDensityColorFull(colors[dataset_dic[i]], d.value, maxDensity)
                                    : d => getDensityColorSample(colors[dataset_dic[i]], d.value, maxDensity))
                                .attr("d", d3.geoPath())
                                // .attr("stroke", colors[dataset_dic[i]])
                                // .attr("stroke-width", (d, i) => (i % 10 ? 0 : 1))
                                .attr("stroke-linejoin", "miter")
                                .attr("class", "group" + i)
                                .attr("transform", `translate(60, -10)`)
                                .on("mouseover", mouseover_contour)
                                .on("mouseleave", mouseleave_contour);
                            contour.exit().remove();

                        }

                    }

                }
                finalData = newFinalData;

            });


        this.svg.call(zoom).on("mousedown.zoom", null);

        //clean up before updating visuals
        d3.selectAll(".xAxisGroup").remove();
        d3.selectAll(".yAxisGroup").remove();
        d3.selectAll(".x-label").remove();

        for (let i = 0; i <= max_num_datasets; i++) {
            d3.selectAll(".group" + i).remove()
        }

        datasets = [];
        let colors = {}
        let dataset_dic = {}

        for (let i = 0; i <= max_num_datasets; i++) {
            datasets.push([])
        }
        let organizedData = organizeByName(finalData);
        organizedData.map((d, i) => {
            colors[d.name] = d.color;
            datasets[i] = (d.data) ? (d.data) : [];
            dataset_dic[i] = d.name;
        });

        for (let i = max_num_datasets; i >= 0; i--) {
            let contours = []
            // const thresholds = 10; // Adjust the range and step as needed
            if (datasets[i][1] && datasets[i][1].name == "freeform_2d.csv") {
                contours = d3
                    .contourDensity()
                    .x((d) => xScale(d[query1]))
                    .y((d) => yScale(d[query2]))
                    .size([WIDTH, HEIGHT - 35]) // Adjust size as needed
                    .bandwidth(15)
                    .thresholds(1000)(datasets[i]);
                // createLegend(colors[dataset_dic[i]], true);
            } else {
                contours = d3
                    .contourDensity()
                    .x((d) => xScale(d[query1]))
                    .y((d) => yScale(d[query2]))
                    .size([WIDTH, HEIGHT - 67]) // Adjust size as needed
                    .bandwidth(25)
                    .thresholds(50)(datasets[i]);
                createLegend(colors[dataset_dic[i]], false);
            }

            let maxDensity = d3.max(contours, d => d.value); // Maximum density for the current dataset

            console.log('dataset', datasets)
            if (datasets[i].length == 1) {
                d3.selectAll(".group" + i)
                    .remove()
            } else {
                if (datasets[i][1]) {
                    let contour = this.svg
                        .append("g")
                        .selectAll("path")
                        .data(contours)
                        .enter()
                        .append("path")
                        .attr("fill", datasets[i][1].name == "freeform_2d.csv" ?
                            d => getDensityColorFull(colors[dataset_dic[i]], d.value, maxDensity)
                            : d => getDensityColorSample(colors[dataset_dic[i]], d.value, maxDensity))
                        .attr("d", d3.geoPath())
                        // .attr("stroke", colors[dataset_dic[i]])
                        // .attr("stroke-width", (d, i) => (i % 10 ? 0 : 1))
                        .attr("stroke-linejoin", "miter")
                        .attr("class", "group" + i)
                        .attr("transform", `translate(60, -10)`)
                        .on("mouseover", mouseover_contour)
                        .on("mouseleave", mouseleave_contour);
                    contour.exit().remove();

                }

            }

        }
    }
}

export default Contour_test;
