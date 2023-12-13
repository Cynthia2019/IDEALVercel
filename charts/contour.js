import * as d3 from "d3";
import { nnColorAssignment } from "@/util/constants";
import organizeByName from "@/util/organizeByName";

const circleOriginalSize = 5;
const circleFocusSize = 8;

const MARGIN = {
	TOP: 0,
	RIGHT: 50,
	BOTTOM: 20,
	LEFT: 50,
};

const SIDE_BAR_SIZE = 100;

const WIDTH = 968 - MARGIN.LEFT - MARGIN.RIGHT - SIDE_BAR_SIZE;
const HEIGHT = 968 - MARGIN.TOP - MARGIN.BOTTOM - SIDE_BAR_SIZE;

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
	update({ data, element, query1, query2, max_num_datasets }) {
		this.data = data;
		this.query1 = query1;
		this.query2 = query2;

		let finalData = [].concat(...data);
		console.log('final', data)

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

		console.log(xScale)

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

		for (let i = 0; i <= max_num_datasets; i++) {
			datasets[i].length > 1 ? console.log('color', datasets[i][3].color) : null;

			const thresholds = 30; // Adjust the range and step as needed
			const contours = d3
				.contourDensity()
				.x((d) => xScale(d[query1]))
				.y((d) => yScale(d[query2]))
				.size([WIDTH, HEIGHT]) // Adjust size as needed
				.thresholds(thresholds)(datasets[i]);

			if (datasets[i].length == 1) {
				d3.selectAll(".group" + i)
					.remove()
			} else {
				datasets[i].length > 1 ? this.svg
						.append("g")
						.selectAll("path")
						.data(contours)
						.enter()
						.append("path")
						.attr("fill", "none")
						.attr("d", d3.geoPath())
						.attr("stroke", colors[dataset_dic[i]]) // Assuming 'color' is the property you want to use
						.attr("stroke-width", (d, i) => (i % 10 ? 0 : 1))
						.attr("stroke-linejoin", "round")
						.attr("class", "group" + i)

					: null;
			}

		}

		let circles = this.svg
			.append("g")
			.attr("clip-path", "url(#clip)")
			.attr("class", "clipPath")
			.selectAll(".dataCircle")
			.data(finalData);


		circles
			.enter()
			.append("circle")
			.join(circles)
			.attr("r", circleOriginalSize)
			.attr("class", "dataCircle")
			.attr("fill", (d) => d.color)
			.style("stroke", "none")
			.style("stroke-width", 2)
			.style("fill-opacity", 0.8)
			.attr("cx", (d) => xScale(d[query1]))
			.attr("cy", (d) => yScale(d[query2]));
	}
}

export default Contour;