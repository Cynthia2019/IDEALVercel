import * as d3 from "d3";
import { UMAP } from "umap-js";
import organizeByName from "@/util/organizeByName";
import { StandardScaler } from "@/components/shared/standardScaler";
import { nnColorAssignment } from "@/util/constants";

const circleOriginalSize = 5;
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

function isBrushed(brush_coords, cx, cy) {
	var x0 = brush_coords[0][0],
		x1 = brush_coords[1][0],
		y0 = brush_coords[0][1],
		y1 = brush_coords[1][1];
	return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
}

function expo(x, f) {
	if (x < 1000 && x > -1000) return x;
	return Number(x).toExponential(f);
}

class Umap {
	constructor({
		element,
		data,
		setDataPoint,
		selectedData,
		setSelectedData,
		knn,
	}) {
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
			.attr("style", "max-width: 100%")

		//brush
		this.svg.append("g").attr("class", "brush");

		// Labels
		this.xLabel = this.svg
			.append("text")
			.attr("x", WIDTH / 2)
			.attr("y", HEIGHT + 50)
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
			data,
			element,
			setDataPoint,
			selectedData,
			setSelectedData,
			reset: false,
			knn,
		});
	}

	//query1: x-axis
	//query2: y-axis
	update({
		data,
		element,
		setDataPoint,
		selectedData,
		setSelectedData,
        setNeighbors, 
		reset,
		setReset,
		knn,
        clickedNeighbor,
        setOpenNeighbor,
	}) {
		this.data = data;
		let query1 = "X";
		let query2 = "Y";
		let properties = ["C11", "C12", "C22", "C16", "C26", "C66"];
		let datasets = [];

		let scaler = new StandardScaler();


		let organizedData = organizeByName(data);
		const umap = new UMAP({
			nNeighbors: knn ? knn : 30,
		});
		let temp_data = [];
		organizedData.map((d, i) => {
			for (let data of d.data) {
				let temp_properties = [];
				for (let p of properties) {
					temp_properties.push(+data[p]);
				}
				temp_data.push(temp_properties);
			}
		});

		temp_data.length ? (temp_data = scaler.fit_transform(temp_data)) : null;
		temp_data.length ? umap.fit(temp_data) : null;

		organizedData.map((d, i) => {
			let temp_data2 = [];
			for (let data of d.data) {
				let temp_properties = [];
				for (let p of properties) {
					temp_properties.push(data[p]);
				}
				data.name = d.name;
				data.color = d.color;
				temp_data2.push(temp_properties);
			}
			temp_data2 = scaler.transform(temp_data2);
			let res = temp_data2.length  ? umap.transform(temp_data2) : null;

			res
				? res.map((p, i) => {
						d.data[i]["X"] = p[0];
						d.data[i]["Y"] = p[1];
				  })
				: null;
			datasets.push(d.data);
		});


		let finalData = [].concat(...datasets);

		//remove elements to avoid repeated append
		d3.select(".tooltip-umap").remove();
		d3.selectAll(".dataCircle").remove();
		d3.selectAll("defs").remove();
		d3.selectAll(".clipPath").remove();

		let yScale = d3
			.scaleLinear()
			.domain([
				d3.min(finalData, (d) => d[query2]),
				d3.max(finalData, (d) => d[query2]),
			])
			.range([HEIGHT, 0]);

		let xScale = d3
			.scaleLinear()
			.domain([
				d3.min(finalData, (d) => d[query1]),
				d3.max(finalData, (d) => d[query1]),
			])
			.range([0, WIDTH]);

		this.xScaleForBrush = xScale;
		this.yScaleForBrush = yScale;

		const chartExtent = [
			[0, 0],
			[WIDTH, HEIGHT],
		];

		// Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
		let zoom = d3
			.zoom()
			.scaleExtent([0.1, 20]) // This control how much you can unzoom (x1) and zoom (x20)
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

				this.xScaleForBrush = newXScale;
				this.yScaleForBrush = newYScale;

				d3.selectAll(".dataCircle")
					.data(finalData)
					.attr("cy", (d) => newYScale(d[query2]))
					.attr("cx", (d) => newXScale(d[query1]));
			});

		let brush = d3.brush().on("brush end", (event) => {
			if (event.sourceEvent?.type === "zoom") return; // ignore brush-by-zoom
			if (event.selection) {
				let _xScale = this.xScaleForBrush;
				let _yScale = this.yScaleForBrush;
				d3.selectAll(".dataCircle")
					.data(finalData)
					.classed("selected", function (d) {
						return (
							d3.select(this).classed("selected") ||
							isBrushed(
								event.selection,
								_xScale(d[query1]),
								_yScale(d[query2])
							)
						);
					});
			}
			let selected = [];
			d3.selectAll(".selected").each((d, i) => selected.push(d));
			setSelectedData(selected);
		});
		//apply zoom and brush to svg
		this.svg.select("g.brush").call(brush).on("wheel.zoom", null);
		this.svg.call(zoom).on("mousedown.zoom", null);
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

		let xAxisCall = d3.axisBottom(xScale).tickFormat("");
		this.xAxisGroup.transition().duration(500).call(xAxisCall);

		let yAxisCall = d3.axisLeft(yScale).tickFormat("");
		this.yAxisGroup.transition().duration(500).call(yAxisCall);

		let tooltip = d3
			.select(element)
			.append("div")
			.attr("class", "tooltip-umap")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style("padding", "10px")
			.style("visibility", "hidden");

		let mouseover = function (e, d) {
		    d3.select(this)
		        .attr("r", circleFocusSize)
		        .style("stroke", "black")
		        .style("stroke-width", 2)
		        .style("fill-opacity", 1);
		    setDataPoint(d);
		    tooltip.style("visibility", "visible").transition().duration(200);
		};
		
		let mousemove = function (e, d) {
		    tooltip
		        .html(
		            `${query1}: ` +
		            d[query1] +
		            `<br>${query2}: ` +
		            d[query2]
		        )
		        .style("top", e.pageY + 10 + "px")
		        .style("left", e.pageX + 10 + "px");
		};

		let mouseleave = function (e, d) {
			tooltip.style("visibility", "hidden").transition().duration(200);
			d3.select(this)
				.attr("r", circleOriginalSize)
				.style("stroke", "none")
				.style("stroke-width", 2)
				.style("fill-opacity", 0.8);
		};
		async function getKnnData(dataPoint) {
			const url =
				"https://metamaterials-srv.northwestern.edu./model/";
			let response = await fetch(url, {
				method: "POST",
				mode: "cors",
				body: JSON.stringify({
					dataPoint: [dataPoint],
					data: finalData.map(d => [d.X, d.Y]),
				})
			})
				.then((res) => res.json())
				.catch((err) => console.log("fetch error", err.message));
			return response;
		}

		let mousedown = function (e, d) {
            let columns = ["X", "Y"];
			let inputData = columns.map((c) => d[c]);

            let target = d3.select(this);
            target.classed("selected", !target.classed("selected"));

			let selected = [];
			d3.selectAll(".selected").each((d, i) => selected.push(d));
			setSelectedData(selected);

			if (clickedNeighbor) {
				//get knn data
				target.classed("selected", true);
				getKnnData(inputData).then((data) => {
					let indices = data.indices;
					let distances = data.distances;
					// index should be the index of the data in the current active dataset
					d3.selectAll(".dataCircle")
						.data(finalData)
						.classed("highlighted", function (datum) {
							return indices.includes(finalData.indexOf(datum));
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
						d["distance"] =
							distances[indices.indexOf(finalData.indexOf(d))];
						neighbors.push(d);
					});
					neighbors.sort((a, b) => a.distance - b.distance);
					neighbors.map((d, i) => d["outline_color"] = nnColorAssignment[i])
					neighborElements
						.attr("fill", (d) => d.outline_color)
						.attr("r", circleFocusSize);
					setNeighbors(neighbors);
				});
				setOpenNeighbor(true);
			}

		};

		let circles = this.svg
			.append("g")
			.attr("clip-path", "url(#clip)")
			.attr("class", "clipPath")
			.selectAll(".dataCircle")
			.data(finalData);

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
			.on("mousedown", mousedown)
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave)
			.attr("cx", (d) => xScale(d[query1]))
			.attr("cy", (d) => yScale(d[query2]));

		circles.exit().transition().attr("r", 0).remove();
		if (reset) {
			this.svg.call(zoom.transform, d3.zoomIdentity);
			d3.selectAll(".selected").classed("selected", false);
			setSelectedData([]);
			setReset(false);
		}
	}
}

export default Umap;
