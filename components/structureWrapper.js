import React, { useRef, useState, useEffect } from "react";
import Structure from "../charts/structure";

const StructureWrapper = ({ data }) => {
	const chartArea = useRef(null);
	const [chart, setChart] = useState(null);
	useEffect(() => {
		if (!chart) {
			setChart(new Structure(chartArea.current, data));
		} else {
			chart.update({
        data, 
        element: chartArea.current,
      });
		}
	}, [chart, data]);

	return (
		<div
			id="structure-plot"
			ref={chartArea}
			style={{ zIndex: 10 }}
		></div>
	);
};

export default StructureWrapper;
