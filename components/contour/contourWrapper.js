import React, { useRef, useState, useEffect } from "react";
import Contour from "@/charts/contour";

const ContourWrapper = ({
    data,
	setDataPoint,
	query1,
	query2,
	reset,
	max_num_datasets
}) => {
	//issue is in contour chart, not here
	const chartArea = useRef(null);
	const legendArea = useRef(null);
	const [chart, setChart] = useState(null);


	useEffect(() => {
		if (!chart) {
			setChart(
				new Contour(
					chartArea.current,
					legendArea.current,
					data

				)
			);
		} else {
			chart.update({
				data,
				element: chartArea.current,
				legendElement: legendArea.current,
				setDataPoint,
				query1,
				query2,
				max_num_datasets});
		}
	}, [chart, query1, query2, data, reset]);
    return (
        <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginLeft: "30px",
        }}
    >
        <div id="main-plot" ref={chartArea}></div>
        </div>
    )
};

export default ContourWrapper; 