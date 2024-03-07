import * as d3 from "d3";
import {nnColorAssignment} from "@/util/constants";
import organizeByName from "@/util/organizeByName";

const circleOriginalSize = 3;
const circleFocusSize = 8;

const MARGIN = {
    TOP: 50,
    RIGHT: 10,
    BOTTOM: 50,
    LEFT: 50,
};

const SIDE_BAR_SIZE = 100;

const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT - SIDE_BAR_SIZE;
const HEIGHT = 900 - MARGIN.TOP - MARGIN.BOTTOM - SIDE_BAR_SIZE;

function expo(x, f) {
    if (x < 1000 && x > -1000) return x;
    return Number(x).toExponential(f);
}

class Contour {
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
            .attr("style", "max-width: 100%; overflow: visible")


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
            .attr("transform", `translate(0, ${HEIGHT})`)


        // Append group el to display both axes
        this.yAxisGroup = this.svg.append("g");
        this.xScaleForBrush;
        this.yScaleForBrush;

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
    update({data, element, query1, query2, max_num_datasets}) {
        this.data = data;
        this.query1 = query1;
        this.query2 = query2;

        let finalData = [].concat(...data);

        //remove elements to avoid repeated append

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

        console.log('final_data', finalData)
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

        console.log('query', query1, query2);

        let datasets = [];
        let colors = {}
        let dataset_dic = {}

        for (let i = 0; i <= max_num_datasets; i++) {
            datasets.push([])
        }
        let organizedData = organizeByName(data);
        organizedData.map((d, i) => {
            colors[d.name] = d.color;
            datasets[i] = (d.data) ? (d.data) : [];
            dataset_dic[i] = d.name;
        });

        // scott's estimation for bandwidth
        function scottsBandwidth2D(values) {
            const n = values.length;
            const standardDeviationX = d3.deviation(values, d => xScale(d[query1]));
            const standardDeviationY = d3.deviation(values, d => yScale(d[query2]));
            console.log('std', standardDeviationX, standardDeviationY)
            const factor = Math.pow(n, -1 / 6);
            return (factor * standardDeviationX + factor * standardDeviationY) / 2;

        }

        function kernelDensityEstimation2D(data, bandwidth, query1, query2) {
            return function (x, y) {
                let density = [];
                data.forEach(point => {
                    let u = [(x - point[query1]) / bandwidth, (y - point[query2]) / bandwidth];
                    density.push(gaussianKernel2D(u, bandwidth));
                });
                return density
            };
        }


        for (let i = 0; i <= max_num_datasets; i++) {
            let bandwidth = 10;
            console.log('data', datasets[i])
            datasets[i][1] && datasets[i][1].name == "freeform_2d.csv" ?
                bandwidth = scottsBandwidth2D(datasets[i]) : null;
            // bandwidths.forEach(bandwidth => {
            // 	let logLikelihood = crossValidationLogLikelihood(datasets[i], bandwidth);
            // 	console.log('logLikelihood', logLikelihood)
            // 	if (logLikelihood > maxLogLikelihood) {
            // 		maxLogLikelihood = logLikelihood;
            // 		optimalBandwidth = bandwidth;
            // 	}
            // }) : null;

            console.log("Optimal Bandwidth:", datasets[i], bandwidth);

            let contours = []
            // const thresholds = 10; // Adjust the range and step as needed
            if (datasets[i][1] && datasets[i][1].name == "freeform_2d.csv") {
                contours = d3
                    .contourDensity()
                    .x((d) => xScale(d[query1]))
                    .y((d) => yScale(d[query2]))
                    .size([WIDTH, HEIGHT - 46]) // Adjust size as needed
                    .bandwidth(15)
                    .thresholds(1200)(datasets[i]);
            }
// Adjust the projection to fit the width and height of the SVG element
			console.log('contours', contours)


            function getDensityColor(baseColor, density, maxDensity) {
                let hsl = d3.hsl(baseColor);
                // hsl.l = 1 is white, 0 is black
                // We need this seemingly verbose if / else to manually separate colors
                //
                if ((density / maxDensity) > 0.4) {
                    hsl.l = 0.50
                } else if ((density / maxDensity) > 0.2) {
                    hsl.l = 0.55
                } else if ((density / maxDensity) > 0.1) {
                    hsl.l = 0.60
                } else if ((density / maxDensity) > 0.05) {
                    hsl.l = 0.65
                } else {
                    console.log('density', (density / maxDensity))
                    hsl.l = 0.80
                }
                // const minLightness = 0.5;
                // const lightnessRange = hsl.l - minLightness;

                // hsl.l = minLightness + (lightnessRange * (density / maxDensity));
                // hsl.l = hsl.l * (1 - (density / maxDensity));
                hsl.opacity = 0.5;

                // console.log('hsl', hsl)
                return hsl.toString();
            }

            let maxDensity = d3.max(contours, d => d.value); // Maximum density for the current dataset

			// var projection = d3.geoIdentity()
			// 	.fitSize([WIDTH, HEIGHT], contours[0]);

			if (datasets[i].length == 1) {
                d3.selectAll(".group" + i)
                    .remove()
            } else {
                datasets[i][1] && datasets[i][1].name == "freeform_2d.csv" ? this.svg
                        .append("g")
                        .selectAll("path")
                        .data(contours)
                        .enter()
                        .append("path")
                        .attr("fill", d => getDensityColor(colors[dataset_dic[i]], d.value, maxDensity))
                        .attr("d", d3.geoPath())
                        // .attr("stroke", colors[dataset_dic[i]])
                        // .attr("stroke-width", (d, i) => (i % 10 ? 0 : 1))
                        .attr("stroke-linejoin", "round")
                        .attr("class", "group" + i)
                        .attr("transform", `translate(50, 0)`)

                    : null;

                // if (datasets[i][1] && datasets[i][1].name == "freeform_2d.csv") {
                //     let circles = this.svg
                //         .append("g")
                //         .attr("clip-path", "url(#clip)")
                //         .attr("class", "clipPath")
                //         .selectAll(".dataCircle")
                //         .data(datasets[i]);
                //
                //     circles
                //         .enter()
                //         .append("circle")
                //         .join(circles)
                //         .attr("r", circleOriginalSize)
                //         .attr("class", "dataCircle")
                //         .attr("fill", (d) => d.color)
                //         .style("stroke", "none")
                //         .style("stroke-width", 2)
                //         .style("fill-opacity", 0.1)
                //         .attr("cx", (d) => xScale(d[query1]))
                //         .attr("cy", (d) => yScale(d[query2]))
                //         .raise();
                // }



            }

        }

        // let circles = this.svg
        // 	.append("g")
        // 	.attr("clip-path", "url(#clip)")
        // 	.attr("class", "clipPath")
        // 	.selectAll(".dataCircle")
        // 	.data(finalData);
        //
        //
        // circles
        // 	.enter()
        // 	.append("circle")
        // 	.join(circles)
        // 	.attr("r", circleOriginalSize)
        // 	.attr("class", "dataCircle")
        // 	.attr("fill", (d) => d.color)
        // 	.style("stroke", "none")
        // 	.style("stroke-width", 2)
        // 	.style("fill-opacity", 0.8)
        // 	.attr("cx", (d) => xScale(d[query1]))
        // 	.attr("cy", (d) => yScale(d[query2]));
    }
}

export default Contour;